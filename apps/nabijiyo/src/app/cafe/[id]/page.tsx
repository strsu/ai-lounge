'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Cafe {
  id: string
  name: string
  address?: string
  phone?: string
  description?: string
  hours?: string
  menu?: any
}

interface Review {
  id: string
  category: string
  score: number
  description?: string
}

interface Post {
  id: string
  url: string
  title?: string
  content?: string
  thumbnail?: string
  metadata?: any
  source: string
  reviews: Review[]
}

interface DetailResponse {
  cafe: Cafe
  overallScore: number
  averageScores: Record<string, number>
  doPoints: string[]
  dontPoints: string[]
  warnings: string[]
  posts: Post[]
}

export default function CafeDetailPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<DetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDetail()
  }, [params.id])

  const fetchDetail = async () => {
    try {
      const response = await fetch(`/api/detail?id=${params.id}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '상세 정보를 불러오지 못했습니다')
      }

      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : '상세 정보를 불러오는 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (score: number) => {
    const filledStars = Math.round(score)
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={i < filledStars ? 'text-yellow-400' : 'text-gray-300'}
          >
            ★
          </span>
        ))}
        <span className="ml-2 text-gray-600">{score.toFixed(1)}</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
          <Link
            href="/search"
            className="block mt-4 text-center text-blue-600 hover:underline"
          >
            ← 검색으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 뒤로가기 버튼 */}
        <Link
          href="/search"
          className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6"
        >
          ← 검색으로 돌아가기
        </Link>

        {/* 맛집 헤더 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {data.cafe.name}
          </h1>

          {/* 기본 정보 */}
          <div className="space-y-3">
            {data.cafe.address && (
              <p className="text-gray-600 flex items-center gap-2">
                <span className="text-lg">📍</span>
                {data.cafe.address}
              </p>
            )}
            {data.cafe.phone && (
              <p className="text-gray-600 flex items-center gap-2">
                <span className="text-lg">📞</span>
                {data.cafe.phone}
              </p>
            )}
            {data.cafe.hours && (
              <p className="text-gray-600 flex items-center gap-2">
                <span className="text-lg">⏰</span>
                {data.cafe.hours}
              </p>
            )}
          </div>

          {/* 종합 평점 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">종합 평점</h3>
            <div className="text-3xl font-bold text-blue-600 mb-3">
              {data.overallScore.toFixed(1)}
            </div>

            {/* 카테고리별 평점 */}
            <div className="space-y-2">
              {Object.entries(data.averageScores).map(([category, score]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-gray-700 capitalize">
                    {category === 'taste' && '맛'}
                    {category === 'service' && '서비스'}
                    {category === 'value' && '가성비'}
                    {category === 'cleanliness' && '청결도'}
                  </span>
                  {renderStars(score)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DO (공통점) 섹션 */}
        {data.doPoints.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              ✅ DO (공통점)
            </h2>
            <ul className="space-y-2">
              {data.doPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* DONT (차이점) 섹션 */}
        {data.dontPoints.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              ⚠️ DONT (차이점)
            </h2>
            <ul className="space-y-2">
              {data.dontPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 주의사항 */}
        {data.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-yellow-700 mb-3">
              📌 주의사항
            </h2>
            <ul className="space-y-2">
              {data.warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2 text-yellow-800">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 참조 포스팅 목록 */}
        {data.posts.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              📝 참조 포스팅 ({data.posts.length}건)
            </h2>
            <div className="space-y-4">
              {data.posts.map((post) => (
                <div key={post.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    {post.thumbnail && (
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {post.title || '제목 없음'}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {post.source === 'naver_blog' && '네이버 블로그'}
                        {post.source === 'naver_cafe' && '네이버 카페'}
                      </p>
                      {post.content && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {post.content}
                        </p>
                      )}
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-sm text-blue-600 hover:underline"
                      >
                        원문 보기 →
                      </a>
                    </div>
                  </div>

                  {/* 포스팅별 평가 */}
                  {post.reviews.length > 0 && (
                    <div className="mt-3 flex gap-4 flex-wrap">
                      {post.reviews.map((review) => (
                        <div
                          key={review.id}
                          className="text-sm px-3 py-1 bg-gray-100 rounded-full"
                        >
                          <span className="text-gray-600">
                            {review.category === 'taste' && '맛'}
                            {review.category === 'service' && '서비스'}
                            {review.category === 'value' && '가성비'}
                            {review.category === 'cleanliness' && '청결도'}
                          </span>
                          <span className="ml-1 font-semibold">
                            {review.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
