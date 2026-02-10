import { NextRequest, NextResponse } from 'next/server'

// Disable static generation for this API route
export const dynamic = 'force-dynamic'

export interface CafeInfo {
  cafeName: string
  cafeAddress?: string
  cafePhone?: string
  cafeHours?: string
  cafeMenu?: Record<string, any>
}

export interface ReviewInfo {
  category: string
  score: number
  description?: string
}

export interface ScrapeResult {
  cafeInfo?: CafeInfo
  url: string
  title?: string
  content?: string
  thumbnail?: string
  metadata?: Record<string, any>
  reviews?: ReviewInfo[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query } = body

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: '검색어를 입력해주세요' },
        { status: 400 }
      )
    }

    // 1. 네이버 블로그 스크래핑 (우선)
    const blogPosts = await scrapeNaverBlogSearch(query, 10)

    // 2. 네이버 지식인 스크래핑 (보조)
    const knowledgePosts = await scrapeNaverKnowledgeSearch(query, 5)

    // 3. 포스팅 정보 추출
    const processedPosts: ScrapeResult[] = []

    // 블로그 포스팅 처리
    for (const post of blogPosts) {
      if (!post.content) continue

      const cafeInfo = extractCafeInfo(post.content)
      const reviews = extractReviews(post.content)

      processedPosts.push({
        ...post,
        cafeInfo,
        reviews,
        metadata: {
          ...post.metadata,
          source: 'naver_blog',
        },
      })
    }

    // 지식인 답변 처리
    for (const post of knowledgePosts) {
      if (!post.content) continue

      const cafeInfo = extractCafeInfo(post.content)
      const reviews = extractReviews(post.content)

      processedPosts.push({
        ...post,
        cafeInfo,
        reviews,
        metadata: {
          ...post.metadata,
          source: 'naver_knowledge',
        },
      })
    }

    return NextResponse.json({
      cafes: processedPosts,
      message: '검색 완료',
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

/**
 * 네이버 블로그 스크래핑
 * @param query 검색어
 * @param resultCount 검색 결과 수 (기본값: 10)
 * @returns 포스팅 정보 배열
 */
async function scrapeNaverBlogSearch(query: string, resultCount: number = 10): Promise<ScrapeResult[]> {
  try {
    const searchUrl = `https://search.naver.com/search.naver?where=blog&query=${encodeURIComponent(query)}&sm=tab_opt&nso=so%3Ar%2Br%2Frx%2C0%3Ar%2Frp%2Ba%2Bsr%2Cp%3Aall&start=1&display=${resultCount}`

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 10000,
    })

    const $ = cheerio.load(response.data)

    const posts: ScrapeResult[] = []

    // 블로그 포스팅 정보 추출
    $('.blog_area').each((index, element) => {
      if (index >= resultCount) return false

      const $el = $(element)

      const title = $el.find('.title_area a').text().trim()
      const url = $el.find('.title_area a').attr('href')
      const thumbnail = $el.find('.thumb img').attr('src')
      const content = $el.find('.dsc_area a').text().trim()
      const blogName = $el.find('.name_area .name').text().trim()

      if (url && title) {
        posts.push({
          url,
          title,
          thumbnail,
          content,
          metadata: {
            blogName,
            summary: '네이버 블로그 포스팅',
          },
        })
      }
    })

    return posts
  } catch (error) {
    console.error('Naver blog scraping error:', error)
    throw new Error('네이버 블로그 스크래핑 실패')
  }
}

/**
 * 네이버 지식인 스크래핑
 * @param query 검색어
 * @param resultCount 검색 결과 수 (기본값: 10)
 * @returns 포스팅 정보 배열
 */
async function scrapeNaverKnowledgeSearch(query: string, resultCount: number = 10): Promise<ScrapeResult[]> {
  try {
    const searchUrl = `https://search.naver.com/search.naver?where=kin&query=${encodeURIComponent(query)}&sm=tab_opt&nso=so%3Ar%2Br%2Frx%2C0%3Ar%2Frp%2Ba%2Bsr%2Cp%3Aall&start=1&display=${resultCount}`

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 10000,
    })

    const $ = cheerio.load(response.data)

    const posts: ScrapeResult[] = []

    // 지식인 답변 정보 추출
    $('.answer_area').each((index, element) => {
      if (index >= resultCount) return false

      const $el = $(element)

      const title = $el.find('.question_area a').text().trim()
      const url = $el.find('.question_area a').attr('href')
      const content = $el.find('.answer_text').text().trim()

      if (url && title) {
        posts.push({
          url,
          title,
          content,
          metadata: {
            summary: '네이버 지식인 답변',
          },
        })
      }
    })

    return posts
  } catch (error) {
    console.error('Naver knowledge scraping error:', error)
    throw new Error('네이버 지식인 스크래핑 실패')
  }
}

/**
 * 포스팅에서 카페 정보 추출
 * @param content 포스팅 내용
 * @returns 카페 정보
 */
function extractCafeInfo(content: string): CafeInfo {
  const cafeInfo: CafeInfo = {}

  // 카페 이름 추출 (정규표현식 사용)
  const cafeNameMatch = content.match(/카페명[가:]?\s*([^\n,]+)/i)
  if (cafeNameMatch) {
    cafeInfo.cafeName = cafeNameMatch[1].trim()
  }

  // 주소 추출
  const addressMatch = content.match(/주소[가:]?\s*([^\n,]+)/i)
  if (addressMatch) {
    cafeInfo.cafeAddress = addressMatch[1].trim()
  }

  // 전화번호 추출
  const phoneMatch = content.match(/전화번호[가:]?\s*([^\n,]+)/i)
  if (phoneMatch) {
    cafeInfo.cafePhone = phoneMatch[1].trim()
  }

  // 영업시간 추출
  const hoursMatch = content.match(/영업시간[가:]?\s*([^\n,]+)/i)
  if (hoursMatch) {
    cafeInfo.cafeHours = hoursMatch[1].trim()
  }

  // 메뉴 추출
  const menuMatch = content.match(/메뉴[가:]?\s*([^\n,]+)/i)
  if (menuMatch) {
    cafeInfo.cafeMenu = { main: menuMatch[1].trim() }
  }

  return cafeInfo
}

/**
 * 포스팅에서 평가 정보 추출
 * @param content 포스팅 내용
 * @returns 평가 정보 배열
 */
function extractReviews(content: string): ReviewInfo[] {
  const reviews: ReviewInfo[] = []

  // 별점 추출 (정규표현식 사용)
  const tasteMatch = content.match(/맛[가:]?\s*(\d+)[점]/i)
  if (tasteMatch) {
    reviews.push({
      category: 'taste',
      score: parseInt(tasteMatch[1], 10),
      description: '맛 평가',
    })
  }

  const serviceMatch = content.match(/서비스[가:]?\s*(\d+)[점]/i)
  if (serviceMatch) {
    reviews.push({
      category: 'service',
      score: parseInt(serviceMatch[1], 10),
      description: '서비스 평가',
    })
  }

  const valueMatch = content.match(/가성비[가:]?\s*(\d+)[점]/i)
  if (valueMatch) {
    reviews.push({
      category: 'value',
      score: parseInt(valueMatch[1], 10),
      description: '가성비 평가',
    })
  }

  const cleanlinessMatch = content.match(/청결도[가:]?\s*(\d+)[점]/i)
  if (cleanlinessMatch) {
    reviews.push({
      category: 'cleanliness',
      score: parseInt(cleanlinessMatch[1], 10),
      description: '청결도 평가',
    })
  }

  return reviews
}
