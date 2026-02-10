'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🍽️ 맛집 포스팅 요약 플랫폼
          </h1>
          <p className="text-lg text-gray-600">
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
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                검색
              </button>
            </div>
          </form>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-xl font-semibold mb-2">검색</h3>
            <p className="text-gray-600">맛집 이름으로 검색하고 다양한 포스팅을 찾아보세요</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-xl font-semibold mb-2">DO (공통점)</h3>
            <p className="text-gray-600">모든 포스팅이 동의하는 장점을 한눈에 파악하세요</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-xl font-semibold mb-2">DONT (차이점)</h3>
            <p className="text-gray-600">서로 다른 의견과 개인별 취향을 비교해보세요</p>
          </div>
        </div>
      </div>
    </main>
  )
}
