import { NextRequest, NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/db'

// Disable static generation for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'
export const revalidate = 0

/**
 * 전체 포스팅 목록 조회
 * GET /api/admin/posts
 */
export async function GET(request: NextRequest) {
  try {
    const prisma = getPrismaClient()

    const { searchParams } = new URL(request.url)
    const cafeId = searchParams.get('cafeId')
    const source = searchParams.get('source')

    // 필터링 조건 구성
    const where: any = {}
    if (cafeId) {
      where.cafeId = cafeId
    }
    if (source) {
      where.source = source
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        cafe: {
          select: {
            id: true,
            name: true
          }
        },
        reviews: true
      }
    })

    return NextResponse.json({
      posts,
      total: posts.length
    })
  } catch (error) {
    console.error('Get posts error:', error)
    return NextResponse.json(
      { error: '포스팅 목록을 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

/**
 * 포스팅 등록
 * POST /api/admin/posts
 */
export async function POST(request: NextRequest) {
  try {
    const prisma = getPrismaClient()

    const body = await request.json()

    // 필수 필드 검증
    if (!body.cafeId || !body.source || !body.url) {
      return NextResponse.json(
        { error: '카페 ID, 소스, URL은 필수 항목입니다' },
        { status: 400 }
      )
    }

    // 카페 존재 여부 확인
    const cafe = await prisma.cafe.findUnique({
      where: { id: body.cafeId }
    })

    if (!cafe) {
      return NextResponse.json(
        { error: '해당 카페를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 포스팅 생성
    const post = await prisma.post.create({
      data: {
        cafeId: body.cafeId,
        source: body.source,
        url: body.url,
        title: body.title || null,
        content: body.content || null,
        thumbnail: body.thumbnail || null,
        metadata: body.metadata || null
      },
      include: {
        cafe: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      post,
      message: '포스팅이 등록되었습니다'
    }, { status: 201 })
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json(
      { error: '포스팅 등록 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
