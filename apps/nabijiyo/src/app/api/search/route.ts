import { NextRequest, NextResponse } from 'next/server'

// Disable static generation for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

    // TODO: 스크래핑 로직 구현 (추후 작업 예정)
    // 현재는 더미 데이터를 반환
    const dummyCafes = [
      {
        id: '1',
        cafeName: '테스트 카페',
        cafeAddress: '서울시 강남구',
        cafePhone: '02-1234-5678',
        cafeHours: '09:00 - 22:00',
        cafeMenu: { main: '아메리카노' },
        url: 'https://naver.blog.com/test/1',
        title: '테스트 블로그 포스팅',
        content: '테스트용 더미 데이터입니다.',
        thumbnail: 'https://example.com/thumb.jpg',
        metadata: { source: 'naver_blog', summary: '네이버 블로그 포스팅' },
        reviews: [],
        doPoints: [],
        dontPoints: [],
        warnings: []
      }
    ]

    return NextResponse.json({
      cafes: dummyCafes,
      message: '검색 완료 (더미 데이터)',
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: '검색어를 입력해주세요' },
        { status: 400 }
      )
    }

    // TODO: 스크래핑 로직 구현 (추후 작업 예정)
    // 현재는 더미 데이터를 반환
    const dummyCafes = [
      {
        id: '1',
        cafeName: '테스트 카페',
        cafeAddress: '서울시 강남구',
        cafePhone: '02-1234-5678',
        cafeHours: '09:00 - 22:00',
        cafeMenu: { main: '아메리카노' },
        url: 'https://naver.blog.com/test/1',
        title: '테스트 블로그 포스팅',
        content: '테스트용 더미 데이터입니다.',
        thumbnail: 'https://example.com/thumb.jpg',
        metadata: { source: 'naver_blog', summary: '네이버 블로그 포스팅' },
        reviews: [],
        doPoints: [],
        dontPoints: [],
        warnings: []
      }
    ]

    return NextResponse.json({
      cafes: dummyCafes,
      message: '검색 완료 (더미 데이터)',
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
