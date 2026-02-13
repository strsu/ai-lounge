import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { scrapeNaverBlogSearch, extractCafeInfo, extractReviews } from '@/lib/scraper'

// Disable static generation for this API route
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

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

    // 네이버 블로그 검색
    const posts = await scrapeNaverBlogSearch(query, 10)

    if (posts.length === 0) {
      return NextResponse.json(
        { error: '검색 결과가 없습니다' },
        { status: 404 }
      )
    }

    // 카페 생성 또는 조회 (첫 번째 포스팅에서 카페 이름 추출)
    const firstPost = posts[0]
    const cafeInfo = extractCafeInfo(firstPost.content || '')

    // 중복 카페 체크
    let cafe = await prisma.cafe.findFirst({
      where: { name: cafeInfo.cafeName }
    })

    if (!cafe) {
      cafe = await prisma.cafe.create({
        data: {
          name: cafeInfo.cafeName,
          address: cafeInfo.cafeAddress,
          phone: cafeInfo.cafePhone,
          description: `${query} 검색 결과`,
          hours: cafeInfo.cafeHours,
          menu: cafeInfo.cafeMenu,
        }
      })
    }

    // 포스팅 저장
    const savedPosts = []
    for (const post of posts) {
      // 중복 체크
      const existingPost = await prisma.post.findFirst({
        where: { url: post.url }
      })

      if (existingPost) {
        savedPosts.push(existingPost)
        continue
      }

      const savedPost = await prisma.post.create({
        data: {
          cafeId: cafe.id,
          source: 'naver_blog',
          url: post.url,
          title: post.title,
          content: post.content,
          thumbnail: post.thumbnail,
          metadata: post.metadata,
        }
      })

      // 리뷰 저장
      if (post.content) {
        const reviews = extractReviews(post.content)
        for (const review of reviews) {
          await prisma.review.create({
            data: {
              cafeId: cafe.id,
              postId: savedPost.id,
              category: review.category,
              score: review.score,
              description: review.description,
            }
          })
        }
      }

      savedPosts.push(savedPost)
    }

    // DO/DONT 분석 (단순 구현)
    const allReviews = await prisma.review.findMany({
      where: { cafeId: cafe.id },
      include: { post: true }
    })

    const categoryScores: Record<string, { total: number; count: number }> = {}
    allReviews.forEach(review => {
      if (!categoryScores[review.category]) {
        categoryScores[review.category] = { total: 0, count: 0 }
      }
      categoryScores[review.category].total += review.score
      categoryScores[review.category].count++
    })

    const doPoints: string[] = []
    const dontPoints: string[] = []

    Object.entries(categoryScores).forEach(([category, data]) => {
      const avg = data.total / data.count
      if (avg >= 4) {
        doPoints.push(`${category}: 평균 ${avg.toFixed(1)}점 (${data.count}개 리뷰)`)
      } else if (avg <= 2.5) {
        dontPoints.push(`${category}: 평균 ${avg.toFixed(1)}점 (${data.count}개 리뷰)`)
      }
    })

    // Summary 저장 또는 업데이트
    await prisma.summary.upsert({
      where: { cafeId: cafe.id },
      create: {
        cafeId: cafe.id,
        doPoints,
        dontPoints,
        warnings: [],
      },
      update: {
        doPoints,
        dontPoints,
        warnings: [],
      }
    })

    return NextResponse.json({
      cafe: {
        id: cafe.id,
        name: cafe.name,
        address: cafe.address,
        phone: cafe.phone,
        description: cafe.description,
      },
      postsCount: savedPosts.length,
      doPoints,
      dontPoints,
      message: `${posts.length}개 포스팅 스크래핑 완료`,
    })
  } catch (error) {
    console.error('Scrape error:', error)
    return NextResponse.json(
      { error: '스크래핑 중 오류가 발생했습니다', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
