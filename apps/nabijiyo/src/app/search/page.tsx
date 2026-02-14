import { useState } from 'react'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setResults([])
      } else {
        setResults(data.cafes || [])
      }
    } catch (err) {
      setError('검색 실패: ' + (err instanceof Error ? err.message : String(err)))
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">
            맛집 검색
          </h1>
          
          <div className="mb-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-2">
                  검색어
                </label>
                <input
                  id="search-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="예: 홍카 라이스, 맛집 이름"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '검색 중...' : '검색'}
              </button>
            </form>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {loading && (
            <div className="flex justify-center items-center mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 border-t-transparent"></div>
              <p className="ml-3 text-gray-600">검색 중...</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                검색 결과 ({results.length}개)
              </h2>

              <div className="space-y-4">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {result.name}
                        </h3>

                        {result.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {result.description}
                          </p>
                        )}

                        <div className="space-y-2">
                          {result.address && (
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="font-medium">주소:</span>
                              <span className="ml-2">{result.address}</span>
                            </div>
                          )}

                          {result.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="font-medium">전화:</span>
                              <span className="ml-2">{result.phone}</span>
                            </div>
                          )}

                          {result.hours && (
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="font-medium">영업시간:</span>
                              <span className="ml-2">{result.hours}</span>
                            </div>
                          )}
                        </div>

                        <a
                          href={`/detail/${result.id}`}
                          className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                        >
                          상세 보기
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && !error && results.length === 0 && query && (
            <div className="text-center py-8">
              <p className="text-gray-500">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
