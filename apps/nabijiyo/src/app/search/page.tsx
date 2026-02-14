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
        setResults(data.results || [])
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
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 000 8.4 0 0 0 0s1.38l1.62 0 0 0s2.06l-2 292.974"></path>
                    </svg>
                    검색 중...
                  </>
                ) : (
                  검색
                )}
              </button>
            </form>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 font-medium">
                {error}
              </p>
            </div>
          )}

          {loading && (
            <div className="flex justify-center mb-6">
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
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="flex items-start space-x-4">
                      {result.thumbnail && (
                        <img
                          src={result.thumbnail}
                          alt={result.name}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      )}

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {result.name}
                        </h3>

                        {result.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {result.description}
                          </p>
                        )}

                        <div className="space-y-2">
                          {result.address && (
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657 16.657 8.08-16.657a3 3 9v3H16.657a12 3.9 12.7l-1.41-1.41-1.41a1 3 9v-3H18a4a12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H18a5a12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H20a4a12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H20a5a12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H22a4a12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24a4a12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H22a5a12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24a5a12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H22a6a12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H22a7a12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H22a8a12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24a7a12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24a8a12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24a9a12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24aa12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24ab12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24ac12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24ad12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24ae12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24af12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24b012 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24b112 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24b212 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24b312 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24b412 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24b512 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24b612 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24b712 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24b812 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24b912 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24ba12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24bb12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24bc12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24bd12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24be12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24bf12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24c012 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24c112 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24c212 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24c312 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24c412 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24c512 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24c612 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24c712 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24c812 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24c912 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24ca12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24cb12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24cc12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24cd12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24ce12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24cf12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24d012 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24d112 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24d212 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24d312 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24d412 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24d512 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24d612 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24d712 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24d812 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24d912 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24da12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24db12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41-1.41a1 3 9v-3H24dc12 3.9 12.7l-1.41-1.41-1.41-1.41-1.41-1.41-1. page break (reached the maximum heap size allocated for HTTP headers)
[91m    at /app/.next/server/webpack-runtime.js:1:193 (this:2463)
[0m    at /app/.next/server/webpack-runtime.js:1:193 (this:2464)
[0m    at /app/.next/server/webpack-runtime.js:1:193 (this:2465)
[0m    at /app/.next/server/webpack-runtime.js:1:321 (this:2466)
[0m    at /app/.next/server/webpack-runtime.js:1:321 (this:2467)
[0m    at /app/.next/server/webpack 헐에러: 
[0m[91m    Error: ReferenceError: File is not defined
[0m        at 5399 (/app/.next/server/app/api/scrape/route.js:126:76584)
[0m    at t (/app/.next/server/webpack-runtime.js:1:142)
[0m    at 4424 (/app/.next/server/app/api/scrape/route.js:126:57858)
[0m    at t (/app/.next/server/webpack-runtime.js:1:142)
[0m    at 5517 (/app/.next/server/app/api/scrape/route.js:126:15120)
[0m    at 4016 (/app/.next/server/app/api/search/route.js:126:76584)
[0m is not defined
[0m        at 2503 (/app/.next/server/app/api/search/route.js:126:51219)
[0m    at t (/app/.next/server/webpack-runtime.js:1:142)
[0m    at 4243 (/app/.next/server/app/api/search/page.tsx:126:51219)
[0m    at 4016 (/app/.next/server/app/api/search/page.tsx:126:76584)
[0m    at 4243 (/app/.next/server/app/api/search/page.tsx:126:51219)
[0m    at 4243 (/app 객체 확장 불가 확장 실패입니다.
[0m    at 4016 (/app/.next/server/app/api/search/page.tsx:126:76584)
[0m    at 4243 (/app/.next/server/app/api/search 페이지 빌드 실패:**
[0m    at t (/app/.next/server/webpack-runtime.js:1:142)
[0m    at 4016 (/app/.next/server/app/api/search/page.tsx:126:76584)
[0m    at 4243 (/app/.next/server/app/api/search/page.tsx:126:51219)
[ 빌드 실패 원인:**
[0m    at t (/app/.next/server/webpack-runtime.js:1:142)
[0m    at 4016 (/app/.next/server/app/api/search/page.tsx:126:76584)
[0m    at 4243 (/app/.next Server Components (Page, Layout, Error, Loading 등)
[0m    at 4243 (/app/.next/server/webpack-runtime.js:1:142)
[0m 컴포넌트 확장 확장 실패입니다.
[0m    at 4016 (/app/.next/server/app/api/search/page.tsx:126:76584)
[0m    at 4243 (/app/.next/Server Components (Page, Layout, Error, Loading, Toast 등)
[0m    at 4243 (/app/.next/server/webpack-runtime.js:1: is not defined
[0m        at 5399 (/app/.next/server/app/api/search/page.tsx:126:76584)
[0m        at t (/app/.next/server/webpack-runtime.js:1: 또는 페이지 빌드 실패입니다.
[0m    at 4016 (/app/.next/server/app/api/search/page.tsx:126:51219)
[0m    at t (/app/api/search/route.ts 에러: [0m[91m검색 실패: Failed to collect page data for /api/search
[0m        at /app/node_modules/next/dist/build/utils.js:1269:15
[0m        at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
[0m  type: 'Error'
[0m        }
[0m    }
[0m[0m
```
                          </div>
                        )}

                        {result.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 16.002 6.002 3.413 2 0 5.258 20.748 22.002 15 8.998 2a1 3 9 12.004 2 2 13.99 14.99 2 2.992 12.004 13.998 20.748 22.002 15.578 13.99 8.99 20.998 13.998 20.998 13.998 20.998 13.998 20.748 22.002 15 8.998 2a1 3 8.998 14.998 20.748 22.002 15 8.998 2 2.998 13.99 20.748 22.002 15.578 13.99 14.998 20.748 22.002 15 578 13.998 8.998 2 2 13.99 14.998 20.748 22.002 15 578 13.998 14.998 20.748 22.002 15 13.998 13.998 20.998 13.998 20.998 13.998 13.998 20.748 22.002 15 8.998 2a1 3 8.998 14.998 20.748 22.002 15 8.998 2 2.998 13.998 20.748 22.002 15 8.998 2a1 3 9 12.004 2 2 13.99 14.99 20.748 22.002 15 578 13.99 14.998 20.748 22.02 15.8.998 13.99 14.998 20.748 22.002 15 578 13.998 14.99 20.748 22.002 15 578 13.998 14.998 20.748 22.002 15.8.998 13.99 14.998 20.748 22.002 15 578 13.998 14.998 20.748 22.002 15 13.998 13.998 20.748 22.002 15 578 13.998 14.998 20.748 22.002 15 8.998 2a1 3 9 12.004 2 2 13.99 14.99 20.748 22.002 15 13.998 13.998 14.998 20.748 22.002 15 578 13.998 14.998 20.748 22.02 15.8.998 13.99 14.99 20.748 22.002 15 578 13.998 14.998 20.748 22.002 15 13.998 13.998 20.748 22.002 15 578 13.998 14.998 20.748 22.002 15 8.998 2 2 13.99 14.99 20.748 22.002 15 13.998 13.99 14. 페이지 빌드 실패 원인:**
[0m    at t (/app/.next/server/webpack-runtime.js:1:142)
[0m    at 4016 (/app/.next/server/app/api/search/route.ts 에러: [0m[91m검색 실패: Failed to collect page data for /api/search
[0m        at /app/node_modules/next/dist/build/utils.js:1269:15
[0m        at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
[0m  type: `Error`
[0m        }
[0m[0m
```
                            )}

                        <a
                          href={`/detail/${result.id}`}
                          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg text-center transition-colors duration-200"
                        >
                          상세 보기
                        </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
