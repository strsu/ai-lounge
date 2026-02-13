import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Disable static generation for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, resultCount = 10 } = body

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: '검색어를 입력해주세요' },
        { status: 400 }
      )
    }

    // 데이터베이스에서 검색
    const cafes = await prisma.cafe.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { address: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: resultCount,
      include: {
        reviews: true,
        posts: true,
        summary: true,
      },
    })

    return NextResponse.json({
      cafes,
      message: `검색 완료 (${cafes.length}개 결과)`,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const resultCount = parseInt(searchParams.get('resultCount') || '10', 10)

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: '검색어를 입력해주세요' },
        { status: 400 }
      )
    }

    // 데이터베이스에서 검색
    const cafes = await prisma.cafe.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { address: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: resultCount,
      include: {
        reviews: true,
        posts: true,
        summary: true,
      },
    })

    return NextResponse.json({
      cafes,
      message: `검색 완료 (${cafes.length}개 결과)`,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
