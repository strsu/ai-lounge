'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setError('')
    setResults([])

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '검색 실패')
      }

      setResults(data.cafes || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCafeClick = (cafeId: string) => {
    router.push(`/cafe/${cafeId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
            맛집 검색
          </h1>

          {/* 검색 폼 */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="맛집 이름을 입력하세요..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? '검색 중...' : '검색'}
              </button>
            </div>
          </form>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* 검색 결과 */}
          {results.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                검색 결과 ({results.length}개)
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleCafeClick(result.id || 'sample')}
                  >
                    {result.cafeInfo?.cafeName && (
                      <h3 className="text-xl font-semibold mb-3 text-gray-900">
                        {result.cafeInfo.cafeName}
                      </h3>
                    )}
                    {result.cafeInfo?.cafeAddress && (
                      <p className="text-gray-600 mb-2">
                        📍 {result.cafeInfo.cafeAddress}
                      </p>
                    )}
                    {result.cafeInfo?.cafePhone && (
                      <p className="text-gray-600 mb-2">
                        📞 {result.cafeInfo.cafePhone}
                      </p>
                    )}
                    {result.cafeInfo?.cafeHours && (
                      <p className="text-gray-600 mb-4">
                        ⏰ {result.cafeInfo.cafeHours}
                      </p>
                    )}
                    {result.reviews && result.reviews.length > 0 && (
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-500 mb-2">평가 항목:</p>
                        <div className="flex flex-wrap gap-2">
                          {result.reviews.map((review: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              {review.category}: {review.score}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.url && (
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-4 text-blue-600 hover:text-blue-800 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        원문 보기 →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 결과 없음 */}
          {!isLoading && !error && results.length === 0 && query && (
            <div className="text-center py-12 text-gray-500">
              <p>검색 결과가 없습니다.</p>
              <p className="text-sm mt-2">다른 검색어로 시도해보세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
