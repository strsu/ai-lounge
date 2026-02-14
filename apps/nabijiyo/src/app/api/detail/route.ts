import { NextRequest, NextResponse } from 'next/server'
import { analyzePosts, AnalysisResult } from '@/lib/analyzer'

// Disable static generation for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Dynamic import Prisma to avoid build-time issues
const getPrisma = async () => {
  const { prisma } = await import('@/lib/db')
  return prisma
}

/**
 * 맛집 상세 정보 API
 * GET /api/detail?id={cafeId}
 */
export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrisma()

    const { searchParams } = new URL(request.url)
    const cafeId = searchParams.get('id')

    if (!cafeId) {
      return NextResponse.json(
        { error: '맛집 ID가 필요합니다' },
        { status: 400 }
      )
    }

    // 1. 맛집 정보 조회
    const cafe = await prisma.cafe.findUnique({
      where: { id: cafeId },
      include: {
        posts: {
          include: {
            reviews: true
          }
        },
        reviews: true,
        summary: true
      }
    })

    if (!cafe) {
      return NextResponse.json(
        { error: '맛집을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 2. DO/DONT 분석 (Summary가 없으면 생성)
    let analysisResult: AnalysisResult | null = null

    if (!cafe.summary) {
      // 포스팅이 있으면 분석 수행
      if (cafe.posts.length > 0) {
        // Prisma 타입을 PostInfo 타입으로 변환
        const postsForAnalysis = cafe.posts.map(post => ({
          ...post,
          content: post.content || undefined,
          title: post.title || undefined,
          thumbnail: post.thumbnail || undefined,
          metadata: post.metadata as Record<string, any> | null,
        }))
        analysisResult = analyzePosts(postsForAnalysis)

        // Summary 생성
        await prisma.summary.create({
          data: {
            cafeId: cafe.id,
            doPoints: analysisResult.doPoints,
            dontPoints: analysisResult.dontPoints,
            warnings: analysisResult.warnings,
            overallScore: analysisResult.overallScore
          }
        })
      }
    } else {
      // 기존 Summary 사용
      analysisResult = {
        doPoints: cafe.summary.doPoints as string[],
        dontPoints: cafe.summary.dontPoints as string[],
        warnings: cafe.summary.warnings as string[],
        overallScore: cafe.summary.overallScore || 0
      }
    }

    // 3. 평균 별점 계산
    const averageScores = calculateAverageScores(cafe.reviews)

    // 4. 응답 생성
    return NextResponse.json({
      cafe: {
        id: cafe.id,
        name: cafe.name,
        address: cafe.address,
        phone: cafe.phone,
        description: cafe.description,
        hours: cafe.hours,
        menu: cafe.menu,
        createdAt: cafe.createdAt,
        updatedAt: cafe.updatedAt
      },
      overallScore: analysisResult?.overallScore || 0,
      averageScores,
      doPoints: analysisResult?.doPoints || [],
      dontPoints: analysisResult?.dontPoints || [],
      warnings: analysisResult?.warnings || [],
      posts: cafe.posts.map(post => ({
        id: post.id,
        url: post.url,
        title: post.title,
        content: post.content,
        thumbnail: post.thumbnail,
        metadata: post.metadata,
        source: post.source,
        reviews: post.reviews
      }))
    })
  } catch (error) {
    console.error('Detail API error:', error)
    return NextResponse.json(
      { error: '맛집 상세 정보를 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

/**
 * 카테고리별 평균 별점 계산
 */
function calculateAverageScores(reviews: any[]): Record<string, number> {
  const scores: Record<string, number[]> = {}

  // 카테고리별 점수 모으기
  for (const review of reviews) {
    if (!scores[review.category]) {
      scores[review.category] = []
    }
    scores[review.category].push(review.score)
  }

  // 평균 계산
  const averages: Record<string, number> = {}
  for (const [category, values] of Object.entries(scores)) {
    const average = values.reduce((sum, score) => sum + score, 0) / values.length
    averages[category] = Math.round(average * 10) / 10
  }

  return averages
}
