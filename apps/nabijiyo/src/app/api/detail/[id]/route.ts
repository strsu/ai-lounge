import { NextRequest, NextResponse } from 'next/server'

// Disable static generation for this API route
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cafeId = params.id

    if (!cafeId || cafeId.trim().length === 0) {
      return NextResponse.json(
        { error: '맛집 ID를 입력해주세요' },
        { status: 400 }
      )
    }

    // TODO: 데이터베이스 조회 로직 구현 (추후 작업 예정)
    // 현재는 더미 데이터를 반환
    const dummyCafeDetail = {
      id: cafeId,
      cafeName: '테스트 카페',
      cafeAddress: '서울시 강남구 테헤란로 123',
      cafePhone: '02-1234-5678',
      cafeHours: '09:00 - 22:00',
      cafeMenu: {
        main: '아메리카노',
        sub: '라떼',
        dessert: '치즈 케이크'
      },
      description: '테스트용 더미 맛집 상세 정보입니다.',
      createdAt: '2026-02-10T00:00:00.000Z',
      updatedAt: '2026-02-10T00:00:00.000Z',
      doPoints: ['맛이 좋습니다', '분위기가 좋습니다'],
      dontPoints: ['주차하기 어려운 곳입니다'],
      warnings: ['주말에 붐비기가 많습니다.']
    }

    return NextResponse.json({
      cafe: dummyCafeDetail,
      message: '맛집 상세 정보 조회 완료 (더미 데이터)',
    })
  } catch (error) {
    console.error('Detail error:', error)
    return NextResponse.json(
      { error: '맛집 상세 정보 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
