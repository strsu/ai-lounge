import { NextRequest, NextResponse } from 'next/server'

// Disable static generation for this API route
export const dynamic = 'force-dynamic'

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

    // TODO: 스크래핑 로직 구현 (추후 작업 예정)
    // 현재는 더미 데이터를 반환
    const dummyScrapeResult = {
      url: url,
      title: '테스트 스크래핑 결과',
      content: '테스트용 더미 스크래핑 데이터입니다.',
      thumbnail: 'https://example.com/thumb.jpg',
      metadata: {
        scrapedAt: new Date().toISOString(),
        summary: '네이버 블로그 포스팅'
      },
      cafeInfo: {
        cafeName: '테스트 맛집',
        cafeAddress: '서울시 강남구',
        cafePhone: '02-1234-5678',
        cafeHours: '09:00 - 22:00',
        cafeMenu: { main: '아메리카노' }
      },
      reviews: [],
      doPoints: [],
      dontPoints: [],
      warnings: []
    }

    return NextResponse.json({
      scrapeResult: dummyScrapeResult,
      message: '스크래핑 완료 (더미 데이터)',
    })
  } catch (error) {
    console.error('Scrape error:', error)
    return NextResponse.json(
      { error: '스크래핑 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
