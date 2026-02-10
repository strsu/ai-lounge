'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function CafeDetailPage() {
  const params = useParams()
  const [cafe, setCafe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCafeDetail()
  }, [params.id])

  const fetchCafeDetail = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/detail?id=${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '맛집 상세 정보를 불러오지 못했습니다')
      }

      setCafe(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchCafeDetail}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  if (!cafe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">맛집을 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 뒤로가기 버튼 */}
          <button
            onClick={() => window.history.back()}
            className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <span>←</span> 뒤로 가기
          </button>

          {/* 맛집 헤더 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {cafe.cafe?.name}
            </h1>
            <div className="space-y-2 text-gray-600">
              {cafe.cafe?.address && (
                <p className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{cafe.cafe.address}</span>
                </p>
              )}
              {cafe.cafe?.phone && (
                <p className="flex items-center gap-2">
                  <span>📞</span>
                  <span>{cafe.cafe.phone}</span>
                </p>
              )}
              {cafe.cafe?.hours && (
                <p className="flex items-center gap-2">
                  <span>⏰</span>
                  <span>{cafe.cafe.hours}</span>
                </p>
              )}
              {cafe.cafe?.description && (
                <p className="pt-4 text-gray-700">{cafe.cafe.description}</p>
              )}
            </div>

            {/* 종합 평점 */}
            {cafe.overallScore > 0 && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-yellow-500">
                    ⭐ {cafe.overallScore.toFixed(1)}
                  </div>
                  <div className="text-gray-600">종합 평점</div>
                </div>
              </div>
            )}
          </div>

          {/* 카테고리별 평점 */}
          {cafe.averageScores && Object.keys(cafe.averageScores).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                카테고리별 평점
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(cafe.averageScores).map(([category, score]) => (
                  <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-500 mb-1">
                      {(score as number).toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {getCategoryName(category)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DO (공통점) */}
          {cafe.doPoints && cafe.doPoints.length > 0 && (
            <div className="bg-green-50 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-green-800 mb-4">
                ✅ DO (공통점)
              </h2>
              <ul className="space-y-2">
                {cafe.doPoints.map((point: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span className="text-green-800">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* DONT (차이점) */}
          {cafe.dontPoints && cafe.dontPoints.length > 0 && (
            <div className="bg-red-50 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-red-800 mb-4">
                ❌ DONT (차이점)
              </h2>
              <ul className="space-y-2">
                {cafe.dontPoints.map((point: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span className="text-red-800">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 주의사항 */}
          {cafe.warnings && cafe.warnings.length > 0 && (
            <div className="bg-yellow-50 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-yellow-800 mb-4">
                ⚠️ 주의사항
              </h2>
              <ul className="space-y-2">
                {cafe.warnings.map((warning: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span className="text-yellow-800">{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 참조 포스팅 */}
          {cafe.posts && cafe.posts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📝 참조 포스팅 ({cafe.posts.length}개)
              </h2>
              <div className="space-y-4">
                {cafe.posts.map((post: any, idx: number) => (
                  <div
                    key={post.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {getSourceName(post.source)}
                      </span>
                    </div>
                    {post.title && (
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {post.title}
                      </h3>
                    )}
                    {post.content && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                        {post.content}
                      </p>
                    )}
                    {post.reviews && post.reviews.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.reviews.map((review: any, rIdx: number) => (
                          <span
                            key={rIdx}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {review.category}: {review.score}
                          </span>
                        ))}
                      </div>
                    )}
                    {post.url && (
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        원문 보기 →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    taste: '맛',
    service: '서비스',
    value: '가성비',
    cleanliness: '청결도',
  }
  return names[category] || category
}

function getSourceName(source: string): string {
  const names: Record<string, string> = {
    naver_blog: '네이버 블로그',
    naver_knowledge: '네이버 지식인',
    instagram: '인스타그램',
  }
  return names[source] || source
}
