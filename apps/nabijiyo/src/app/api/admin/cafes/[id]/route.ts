import { NextRequest, NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/db'

// Disable static generation for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'
export const revalidate = 0

interface SummaryResponse {
  cafeId: string
  overallScore: number
  doPoints: string[]
  dontPoints: string[]
  warnings: string[]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cafeId = (await params).id
    const prisma = getPrismaClient()

    // 카페 ID 유효성 검사
    const cafe = await prisma.cafe.findUnique({
      where: { id: cafeId }
    })

    if (!cafe) {
      return NextResponse.json(
        { error: '해당 카페를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 리뷰 및 포스팅 데이터 조회
    const reviews = await prisma.review.findMany({
      where: { cafeId: cafeId },
      include: { post: true }
    })

    // 종합 평점 계산
    const categoryScores: Record<string, { total: number; count: number }> = {}
    reviews.forEach(review => {
      if (!categoryScores[review.category]) {
        categoryScores[review.category] = { total: 0, count: 0 }
      }
      categoryScores[review.category].total += review.score
      categoryScores[review.category].count++
    })

    const doPoints: string[] = []
    const dontPoints: string[] = []
    const warnings: string[] = []

    Object.entries(categoryScores).forEach(([category, data]) => {
      const avg = data.total / data.count
      if (avg >= 4) {
        doPoints.push(`${category}: 평균 ${avg.toFixed(1)}점 (${data.count}개 리뷰)`)
      } else if (avg <= 2.5) {
        dontPoints.push(`${category}: 평균 ${avg.toFixed(1)}점 (${data.count}개 리뷰)`)
      }
    })

    // 전체 종합 평점 (가중치 적용)
    const overallScore = Object.values(categoryScores).length > 0
      ? Object.values(categoryScores).reduce((sum, data) => sum + (data.total / data.count), 0) / Object.keys(categoryScores).length
      : 0

    // Summary 업데이트 또는 생성
    await prisma.summary.upsert({
      where: { cafeId },
      create: {
        cafeId,
        doPoints,
        dontPoints,
        warnings,
        overallScore
      },
      update: {
        doPoints,
        dontPoints,
        warnings,
        overallScore
      }
    })

    const summary: SummaryResponse = {
      cafeId,
      overallScore,
      doPoints,
      dontPoints,
      warnings
    }

    return NextResponse.json({
      cafe: {
        id: cafe.id,
        name: cafe.name,
        address: cafe.address,
        phone: cafe.phone,
        description: cafe.description
      },
      summary,
      message: '요약 리포트 생성 완료'
    })
  } catch (error) {
    console.error('Summary generation error:', error)
    return NextResponse.json(
      { error: '요약 리포트 생성 중 오류가 발생했습니다', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
