import { NextRequest, NextResponse } from 'next/server'

// Disable static generation for this API route
export const dynamic = 'force-dynamic'

import {
  scrapeNaverBlogSearch,
  scrapeNaverKnowledgeSearch,
  extractCafeInfo,
  extractReviews,
} from '@/lib/scraper'
import { analyzePosts } from '@/lib/analyzer'

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

    // 1. 네이버 블로그 스크래핑 (우선)
    const blogPosts = await scrapeNaverBlogSearch(query, 10)

    // 2. 네이버 지식인 스크래핑 (보조)
    const knowledgePosts = await scrapeNaverKnowledgeSearch(query, 5)

    // 3. 포스팅 정보 추출
    const processedPosts: ScrapeResult[] = []

    // 블로그 포스팅 처리
    for (const post of blogPosts) {
      if (!post.content) continue

      const cafeInfo = extractCafeInfo(post.content)
      const reviews = extractReviews(post.content)

      processedPosts.push({
        ...post,
        cafeInfo,
        reviews,
        metadata: {
          ...post.metadata,
          source: 'naver_blog',
        },
      })
    }

    // 지식인 답변 처리
    for (const post of knowledgePosts) {
      if (!post.content) continue

      const cafeInfo = extractCafeInfo(post.content)
      const reviews = extractReviews(post.content)

      processedPosts.push({
        ...post,
        cafeInfo,
        reviews,
        metadata: {
          ...post.metadata,
          source: 'naver_knowledge',
        },
      })
    }

    // 4. DO/DONT 분석
    const { doPoints, dontPoints, warnings, overallScore } = analyzePosts(processedPosts)

    // 5. 응답 생성
    return NextResponse.json({
      cafes: processedPosts,
      analysis: {
        doPoints,
        dontPoints,
        warnings,
        overallScore,
      },
      message: '검색 완료',
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
