import { NextRequest, NextResponse } from 'next/server'

// Disable static generation for this API route
export const dynamic = 'force-dynamic'

interface ScrapeResult {
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

    // 임시 스크래핑 결과 반환 (Prisma 제거)
    const mockResults: ScrapeResult[] = [
      {
        url: 'https://example.com/blog/1',
        title: `테스트 블로그: ${query}`,
        metadata: {
          thumbnail: '',
          summary: '테스트용 더미 데이터입니다',
        },
        cafeName: '테스트 맛집',
        cafeAddress: '서울시 테스트구',
        cafePhone: '02-1234-5678',
        cafeHours: '09:00 - 22:00',
        cafeMenu: { main: '테스트 메뉴' },
      }
    ]

    return NextResponse.json({
      cafes: mockResults,
      message: '검색 완료 (Prisma 없음)',
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
