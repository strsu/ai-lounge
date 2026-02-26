import { NextRequest, NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/db'

// Disable static generation for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'
export const revalidate = 0

/**
 * 특정 카페 조회
 * GET /api/admin/cafes/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cafeId = (await params).id
    const prisma = getPrismaClient()

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
        { error: '해당 카페를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json({ cafe })
  } catch (error) {
    console.error('Get cafe error:', error)
    return NextResponse.json(
      { error: '카페 정보를 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

/**
 * 카페 정보 수정
 * PUT /api/admin/cafes/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cafeId = (await params).id
    const prisma = getPrismaClient()

    const body = await request.json()

    // 카페 존재 여부 확인
    const existingCafe = await prisma.cafe.findUnique({
      where: { id: cafeId }
    })

    if (!existingCafe) {
      return NextResponse.json(
        { error: '해당 카페를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 카페 정보 업데이트
    const cafe = await prisma.cafe.update({
      where: { id: cafeId },
      data: {
        name: body.name,
        address: body.address !== undefined ? body.address : existingCafe.address,
        phone: body.phone !== undefined ? body.phone : existingCafe.phone,
        description: body.description !== undefined ? body.description : existingCafe.description,
        hours: body.hours !== undefined ? body.hours : existingCafe.hours,
        menu: body.menu !== undefined ? body.menu : existingCafe.menu
      }
    })

    return NextResponse.json({
      cafe,
      message: '카페 정보가 수정되었습니다'
    })
  } catch (error) {
    console.error('Update cafe error:', error)
    return NextResponse.json(
      { error: '카페 정보 수정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

/**
 * 카페 삭제
 * DELETE /api/admin/cafes/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cafeId = (await params).id
    const prisma = getPrismaClient()

    // 카페 존재 여부 확인
    const existingCafe = await prisma.cafe.findUnique({
      where: { id: cafeId }
    })

    if (!existingCafe) {
      return NextResponse.json(
        { error: '해당 카페를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 카페 삭제 (연관된 포스팅, 리뷰, 요약도 CASCADE로 삭제됨)
    await prisma.cafe.delete({
      where: { id: cafeId }
    })

    return NextResponse.json({
      message: '카페가 삭제되었습니다'
    })
  } catch (error) {
    console.error('Delete cafe error:', error)
    return NextResponse.json(
      { error: '카페 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
