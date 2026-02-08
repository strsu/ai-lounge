import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { scrapeNaverBlog } from '@/lib/scrape'

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

    // 1. 블로그 검색 수행
    const results = await scrapeNaverBlog(query)

    if (results.length === 0) {
      return NextResponse.json(
        { error: '검색 결과가 없습니다' },
        { status: 404 }
      )
    }

    // 2. 데이터베이스에 저장
    for (const result of results) {
      // Cafe 찾기 또는 생성
      let cafe = await prisma.cafe.findFirst({
        where: {
          name: result.cafeName,
        },
      })

      if (!cafe) {
        cafe = await prisma.cafe.create({
          data: {
            name: result.cafeName,
            address: result.cafeAddress,
            phone: result.cafePhone,
            hours: result.cafeHours,
            menu: result.cafeMenu,
          },
        })
      }

      // Post 찾기 또는 생성
      let post = await prisma.post.findFirst({
        where: {
          url: result.url,
        },
      })

      if (!post) {
        post = await prisma.post.create({
          data: {
            cafeId: cafe.id,
            source: 'naver_blog',
            url: result.url,
            title: result.title,
            content: result.content,
            thumbnail: result.thumbnail,
            metadata: result.metadata,
          },
        })

        // 평가 점수 추출 및 저장
        if (result.reviews) {
          for (const review of result.reviews) {
            await prisma.review.create({
              data: {
                cafeId: cafe.id,
                postId: post.id,
                category: review.category,
                score: review.score,
                description: review.description,
              },
            })
          }
        }
      }
    }

    // 3. Cafe 목록 가져오기
    const cafes = await prisma.cafe.findMany({
      where: {
        posts: {
          some: {
            source: 'naver_blog',
          },
        },
      },
      include: {
        _count: {
          select: {
            posts: true,
            reviews: true,
          },
        },
      },
    })

    return NextResponse.json({
      cafes,
      message: '검색 및 저장 완료',
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
