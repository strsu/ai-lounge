'use client'

import { useState } from 'react'

export default function Home() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🍽️ 맛집 포스팅 요약 플랫폼
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            네이버에서 동일한 맛집의 여러 포스팅을 수집하고, 공통점(DO)과 차이점(DONT)을 분석해 드려요
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="맛집 이름을 입력하세요 (예: '도리쿠카라카라')"
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '검색 중...' : '검색'}
              </button>
            </div>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {result.cafe?.name || '맛집 정보'}
              </h2>
              
              {/* DO/DONT Summary */}
              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-2">
                    ✅ DO (공통점)
                  </h3>
                  {result.doPoints && result.doPoints.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-green-700 dark:text-green-300">
                      {result.doPoints.map((point: string, idx: number) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-green-600 dark:text-green-400">분석된 공통점이 없습니다</p>
                  )}
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
                    ❌ DONT (차이점)
                  </h3>
                  {result.dontPoints && result.dontPoints.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-300">
                      {result.dontPoints.map((point: string, idx: number) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-red-600 dark:text-red-400">차이점이 없습니다</p>
                  )}
                </div>

                {result.overallScore && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400 mb-2">
                      ⭐ 종합 평점: {result.overallScore.toFixed(1)}
                    </h3>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
