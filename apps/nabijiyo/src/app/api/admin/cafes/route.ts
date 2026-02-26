import { NextRequest, NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/db'

// Disable static generation for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'
export const revalidate = 0

/**
 * 전체 카페 목록 조회
 * GET /api/admin/cafes
 */
export async function GET(request: NextRequest) {
  try {
    const prisma = getPrismaClient()

    const cafes = await prisma.cafe.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            posts: true,
            reviews: true
          }
        },
        summary: true
      }
    })

    return NextResponse.json({
      cafes,
      total: cafes.length
    })
  } catch (error) {
    console.error('Get cafes error:', error)
    return NextResponse.json(
      { error: '카페 목록을 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

/**
 * 카페 등록
 * POST /api/admin/cafes
 */
export async function POST(request: NextRequest) {
  try {
    const prisma = getPrismaClient()

    const body = await request.json()

    // 필수 필드 검증
    if (!body.name) {
      return NextResponse.json(
        { error: '카페 이름은 필수 항목입니다' },
        { status: 400 }
      )
    }

    // 카페 생성
    const cafe = await prisma.cafe.create({
      data: {
        name: body.name,
        address: body.address || null,
        phone: body.phone || null,
        description: body.description || null,
        hours: body.hours || null,
        menu: body.menu || null
      }
    })

    return NextResponse.json({
      cafe,
      message: '카페가 등록되었습니다'
    }, { status: 201 })
  } catch (error) {
    console.error('Create cafe error:', error)
    return NextResponse.json(
      { error: '카페 등록 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
