import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { prisma } from '@/lib/db'
import { analyzeDoDont, DoDontResult } from '@/lib/analysis'
import { extractCafeInfo, extractReviews } from '@/lib/scraper'

// Disable static generation for this API route
export const dynamic = 'force-dynamic'

/**
 * 스크래핑 API
 * POST /api/scrape
 * Body: { url: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return NextResponse.json(
        { error: 'URL을 입력해주세요' },
        { status: 400 }
      )
    }

    // 1. URL 유효성 검사
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      return NextResponse.json(
        { error: '올바른 URL 형식이 아닙니다' },
        { status: 400 }
      )
    }

    // 2. 중복 URL 체크
    const existingPost = await prisma.post.findUnique({
      where: { url }
    })

    if (existingPost) {
      return NextResponse.json(
        { error: '이미 수집된 URL입니다', postId: existingPost.id },
        { status: 409 }
      )
    }

    // 3. 페이지 스크래핑
    const scrapedData = await scrapePage(url)

    if (!scrapedData) {
      return NextResponse.json(
        { error: '페이지 스크래핑에 실패했습니다' },
        { status: 500 }
      )
    }

    // 4. 데이터베이스 저장
    const cafe = await saveScrapedData(scrapedData)

    return NextResponse.json({
      success: true,
      cafeId: cafe.id,
      message: '스크래핑 완료'
    })
  } catch (error) {
    console.error('Scrape API error:', error)
    return NextResponse.json(
      { error: '스크래핑 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

/**
 * 페이지 스크래핑
 */
async function scrapePage(url: string) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 10000,
    })

    const $ = cheerio.load(response.data)

    // 제목 추출
    const title = $('title').text().trim() ||
                 $('meta[property="og:title"]').attr('content') ||
                 $('h1').first().text().trim()

    // 썸네일 추출
    const thumbnail = $('meta[property="og:image"]').attr('content') ||
                     $('img').first().attr('src')

    // 본문 내용 추출
    let content = ''
    const contentSelectors = [
      '.se-viewer',
      '.se-main-container',
      '.post-view',
      '#mainFrame',
      '.blog_view_content',
      '.se_component_wrap',
      'article',
    ]

    for (const selector of contentSelectors) {
      const element = $(selector).first()
      if (element.length > 0) {
        content = element.text().trim()
        if (content.length > 100) break
      }
    }

    // 썸네일이 없으면 첫 번째 이미지 사용
    if (!thumbnail) {
      const firstImage = $('img').first()
      if (firstImage.length > 0) {
        const src = firstImage.attr('src')
        if (src) {
          return { title, content, thumbnail: src }
        }
      }
    }

    return { title, content, thumbnail }
  } catch (error) {
    console.error('Scrape page error:', error)
    return null
  }
}

/**
 * 스크래핑 데이터 저장
 */
async function saveScrapedData(data: { title?: string; content?: string; thumbnail?: string }) {
  // 1. 카페 정보 추출
  const cafeInfo = extractCafeInfo(data.content || '')

  // 2. 카페 생성 또는 조회 (이름으로 중복 체크)
  let cafe = await prisma.cafe.findFirst({
    where: { name: cafeInfo.cafeName }
  })

  if (!cafe) {
    cafe = await prisma.cafe.create({
      data: {
        name: cafeInfo.cafeName,
        address: cafeInfo.cafeAddress,
        phone: cafeInfo.cafePhone,
        hours: cafeInfo.cafeHours,
        menu: cafeInfo.cafeMenu
      }
    })
  }

  // 3. 포스팅 생성
  const post = await prisma.post.create({
    data: {
      cafeId: cafe.id,
      source: 'naver_blog',
      url: new Date().toISOString(), // 임시 URL (실제 요청에서 URL 사용)
      title: data.title,
      content: data.content,
      thumbnail: data.thumbnail,
      metadata: {
        scrapedAt: new Date().toISOString()
      }
    }
  })

  // 4. 평가 정보 추출 및 저장
  const reviews = extractReviews(data.content || '')

  for (const review of reviews) {
    await prisma.review.create({
      data: {
        cafeId: cafe.id,
        postId: post.id,
        category: review.category,
        score: review.score,
        description: review.description
      }
    })
  }

  // 5. DO/DONT 분석
  const allPosts = await prisma.post.findMany({
    where: { cafeId: cafe.id },
    include: { reviews: true }
  })

  const analysisResult = analyzePosts(allPosts)

  // 6. Summary 생성 또는 업데이트
  await prisma.summary.upsert({
    where: { cafeId: cafe.id },
    create: {
      cafeId: cafe.id,
      doPoints: analysisResult.doPoints,
      dontPoints: analysisResult.dontPoints,
      warnings: analysisResult.warnings,
      overallScore: analysisResult.overallScore
    },
    update: {
      doPoints: analysisResult.doPoints,
      dontPoints: analysisResult.dontPoints,
      warnings: analysisResult.warnings,
      overallScore: analysisResult.overallScore
    }
  })

  return cafe
}

/**
 * 포스팅 분석 (알려진 타입 오류 수정)
 */
function analyzePosts(posts: any[]): any {
  const doPoints: string[] = []
  const dontPoints: string[] = []
  const warnings: string[] = []
  let totalScore = 0
  let reviewCount = 0

  // 공통점 추출
  for (const post of posts) {
    if (!post.content) continue

    // 카페 이름
    if (post.cafe?.name && !doPoints.includes(`맛집: ${post.cafe.name}`)) {
      doPoints.push(`맛집: ${post.cafe.name}`)
    }

    // 별점 계산
    if (post.reviews && post.reviews.length > 0) {
      for (const review of post.reviews) {
        totalScore += review.score
        reviewCount++
      }
    }
  }

  // 평균 별점
  if (reviewCount > 0) {
    const average = totalScore / reviewCount
    doPoints.push(`평균 별점: ${average.toFixed(1)}`)
  }

  // 개인별 취향 추출
  const preferenceKeywords = ['좋아', '최애', '좋아하는', '싫어', '최애하는', '별로']

  for (const post of posts) {
    if (!post.content) continue

    for (const keyword of preferenceKeywords) {
      if (post.content.includes(keyword)) {
        const keywordIndex = post.content.indexOf(keyword)
        const startIndex = Math.max(0, keywordIndex - 30)
        const endIndex = Math.min(post.content.length, keywordIndex + keyword.length + 30)
        const preferenceText = post.content.substring(startIndex, endIndex).trim()

        if (!dontPoints.includes(preferenceText) && preferenceText.length > 0) {
          dontPoints.push(preferenceText)
        }
        break
      }
    }
  }

  // 주의사항
  if (posts.length < 3) {
    warnings.push('포스팅 수가 부족하여 신뢰성 있는 분석이 어렵습니다')
  }

  return {
    doPoints,
    dontPoints,
    warnings,
    overallScore: reviewCount > 0 ? totalScore / reviewCount : 0
  }
}
