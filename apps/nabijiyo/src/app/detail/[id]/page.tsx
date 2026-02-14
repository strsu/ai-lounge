import { useState, useEffect } from 'react'

export default function DetailPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true)
  const [cafe, setCafe] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [doPoints, setDoPoints] = useState<string[]>([])
  const [dontPoints, setDontPoints] = useState<string[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchCafeDetails() {
      try {
        const response = await fetch(`/api/detail?id=${params.id}`)
        const data = await response.json()

        if (data.error) {
          setError(data.error)
        } else {
          setCafe(data.cafe)
          setReviews(data.reviews || [])
          setDoPoints(data.doPoints || [])
          setDontPoints(data.dontPoints || [])
        }
      } catch (err) {
        setError('상세 정보 로딩 실패: ' + (err instanceof Error ? err.message : String(err)))
      } finally {
        setLoading(false)
      }
    }

    fetchCafeDetails()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  if (error && !cafe) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h1>
          <p className="text-gray-600">{error}</p>
          <a
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            홈으로 돌아가기
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <a
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            목록으로
          </a>
        </div>

        {cafe && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {cafe.name}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  기본 정보
                </h2>
                <div className="space-y-2">
                  {cafe.address && (
                    <div className="flex items-start text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L16.657 16.657L4.828 16.657A4 4 0 014.142V4.828a4 4 0 014.142 0 6.286l0-6.286 0 0-6.286 0-14.142 0-4-0-4-4-4.014142V16.657z" />
                      </svg>
                      <p>{cafe.address}</p>
                    </div>
                  )}

                  {cafe.phone && (
                    <div className="flex items-start text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 16.92v-3.64a1 1 0 01 0 1.01 0 5.99 0 2.72a1 1 0 01 0 1.99 0 4.42 0 2.72a1 1 0 01 0 3.99 0 6.28 0 3.99 0 4.42 0 2.72a1 1 0 01 0 1.99 0 4.42 0 2.72z" />
                      </svg>
                      <p>{cafe.phone}</p>
                    </div>
                  )}

                  {cafe.hours && (
                    <div className="flex items-start text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m0-6H3a3 3 0 00-3 3.72V6a1 1 0 01 1.01 0 2.72 0 6.28 0 3.99 0 6.28 0 3.99 0 4.42 0 2.72z" />
                      </svg>
                      <p>{cafe.hours}</p>
                    </div>
                  )}

                  {cafe.description && (
                    <div className="text-sm text-gray-600">
                      {cafe.description}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  DO/DONT 분석 결과
                </h2>

                {doPoints.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-green-700 mb-2">
                      DO (공통점) - 해야 할 것
                    </h3>
                    <ul className="space-y-2">
                      {doPoints.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-5 h-5 mr-2 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {dontPoints.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-red-700 mb-2">
                      DONT (차이점) - 피해야 할 것
                    </h3>
                    <ul className="space-y-2">
                      {dontPoints.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-5 h-5 mr-2 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="text-sm text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {doPoints.length === 0 && dontPoints.length === 0 && (
                  <div className="text-gray-500 text-sm">
                    DO/DONT 분석 결과가 아직 없습니다.
                  </div>
                )}
              </div>
            </div>

            {reviews.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  리뷰 ({reviews.length}개)
                </h2>

                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="mb-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {review.category}
                          </h3>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-5 h-5 ${star <= review.score ? 'text-yellow-500' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>

                      {review.description && (
                        <p className="text-sm text-gray-600 mt-2">
                          {review.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
