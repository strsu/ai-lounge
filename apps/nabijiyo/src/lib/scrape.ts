import axios from 'axios'
import * as cheerio from 'cheerio'
import { prisma } from './prisma'

interface NaverBlogScrapedData {
  cafeName: string
  cafeAddress?: string
  cafePhone?: string
  cafeHours?: string
  cafeMenu?: Record<string, any>
  url: string
  title?: string
  content?: string
  thumbnail?: string
  metadata?: Record<string, any>
  reviews?: Array<{
    category: string
    score: number
    description?: string
  }>
}

/**
 * 네이버 블로그 스크래핑
 */
export async function scrapeNaverBlog(query: string): Promise<NaverBlogScrapedData[]> {
  const results: NaverBlogScrapedData[] = []

  try {
    // 네이버 블로그 검색 URL
    const searchUrl = `https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(query)}`

    // 요청 헤더 설정
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    }

    // 검색 결과 페이지 스크래핑
    const response = await axios.get(searchUrl, {
      headers,
      timeout: 10000,
    })

    const $ = cheerio.load(response.data)

    // 블로그 게시물 링크 찾기
    $('.sh_blog_postlist .sh_blog_post').each((_, element) => {
      const $el = $(element)
      const url = $el.find('.sh_blog_title a').attr('href')

      if (url) {
        results.push({
          url,
          title: $el.find('.sh_blog_title').text().trim(),
          metadata: {
            thumbnail: $el.find('img').attr('src'),
            summary: $el.find('.sh_blog_write').text().trim(),
          },
          cafeName: '', // 초기값 설정 (상세 페이지에서 추출됨)
        })
      }
    })

    // 각 포스팅 상세 페이지 스크래핑
    for (const result of results) {
      try {
        // 상세 페이지 스크래핑
        const detailResponse = await axios.get(result.url, {
          headers,
          timeout: 10000,
        })

        const $detail = cheerio.load(detailResponse.data)

        // 맛집 정보 추출
        const cafeName = $detail('.blog_api_content')
          .find('.blog_qa, .se-module-caption')
          .first()
          .text()
          .trim()

        // 메타데이터 정리
        result.metadata = {
          ...result.metadata,
          cafeName,
          cafeAddress: $detail('.se-module-caption').last().text().trim(),
          cafePhone: $detail('.blog_api_content')
            .find('.se-module-caption')
            .eq(1)
            .text()
            .replace(/[^\d-]/g, '')
            .trim(),
          cafeHours: $detail('.se-module-caption')
            .eq(2)
            .text()
            .trim(),
          cafeMenu: {
            main: $detail('.blog_api_content')
              .find('.blog_qa, .se-module-caption')
              .eq(0)
              .text()
              .trim(),
          },
        }

        // 별점 추출 (예시)
        const reviews: any[] = []
        $detail('.se-module-caption').each((_, el) => {
          const text = $(el).text().trim()
          if (text.includes('별점') || text.includes('★')) {
            const parts = text.split('점').filter(Boolean)
            if (parts.length > 0) {
              const score = parseInt(parts[0]) || 0
              reviews.push({
                category: 'taste',
                score,
                description: text,
              })
            }
          }
        })

        if (reviews.length > 0) {
          result.reviews = reviews
        }

        // 콘텐츠 추출
        result.content = $detail('.se-module-text').text().trim().substring(0, 2000)
        result.thumbnail = $detail('.se-image')
          .find('img')
          .attr('src') || $detail('.post-content').find('img').attr('src')

      } catch (detailError) {
        console.error(`Failed to scrape ${result.url}:`, detailError)
        continue
      }
    }

  } catch (error) {
    console.error('Scraping error:', error)
  }

  return results
}

/**
 * 맛집 요약 분석 (DO/DONT)
 */
export async function analyzeCafeSummary(cafeId: string) {
  // Cafe 데이터 가져오기
  const cafe = await prisma.cafe.findUnique({
    where: { id: cafeId },
    include: {
      reviews: true,
      posts: {
        include: {
          reviews: true,
        },
      },
    },
  })

  if (!cafe) {
    throw new Error('Cafe not found')
  }

  // 공통점(DO) 분석
  const doPoints: string[] = []
  const dontPoints: string[] = []

  // 각 평가 카테고리별 평균 별점 계산
  const scoreCategories = ['taste', 'service', 'value', 'cleanliness'] as const
  const categoryScores: Record<string, { total: number; count: number }> = {}

  for (const category of scoreCategories) {
    const reviews = cafe.reviews.filter(r => r.category === category)
    if (reviews.length > 0) {
      const total = reviews.reduce((sum, r) => sum + r.score, 0)
      const avg = total / reviews.length
      categoryScores[category] = {
        total,
        count: reviews.length,
      }

      if (avg >= 4) {
        doPoints.push(`${category}가 좋아요`)
      } else if (avg <= 2) {
        dontPoints.push(`${category}가 아쉬워요`)
      }
    }
  }

  // DO/DONT 정리
  const doSummary = Array.from(new Set(doPoints)).slice(0, 5).join(', ')
  const dontSummary = Array.from(new Set(dontPoints)).slice(0, 5).join(', ')

  // 총점 계산
  const overallScore = Object.values(categoryScores).reduce((sum, item) => sum + item.total, 0) /
    Object.values(categoryScores).reduce((sum, item) => sum + item.count, 0) || 0

  // 요약 저장
  const summary = await prisma.summary.upsert({
    where: { cafeId },
    update: {
      doPoints,
      dontPoints,
      warnings: [
        '다양한 의견을 확인해보세요',
        '별점은 작성자마다 다를 수 있습니다',
      ],
      overallScore,
    },
    create: {
      cafeId,
      doPoints,
      dontPoints,
      warnings: [
        '다양한 의견을 확인해보세요',
        '별점은 작성자마다 다를 수 있습니다',
      ],
      overallScore,
    },
  })

  return summary
}
