import { PostInfo, ReviewInfo } from './scraper'

export interface AnalysisResult {
  doPoints: string[]
  dontPoints: string[]
  warnings: string[]
  overallScore: number
}

/**
 * 공통점(DO) 분석
 * @param posts 포스팅 정보 배열
 * @returns 공통점 배열
 */
export function extractCommonPoints(posts: PostInfo[]): string[] {
  const doPoints: string[] = []

  if (posts.length === 0) return doPoints

  // 1. 메뉴 추출 (정규표현식 사용)
  const menuPoints = extractMenuPoints(posts)
  doPoints.push(...menuPoints)

  // 2. 맛집 이름 추출
  const cafeNamePoints = extractCafeNamePoints(posts)
  doPoints.push(...cafeNamePoints)

  // 3. 평균 별점 계산
  const averageScorePoints = extractAverageScorePoints(posts)
  doPoints.push(...averageScorePoints)

  return doPoints
}

/**
 * 차이점(DONT) 분석
 * @param posts 포스팅 정보 배열
 * @returns 차이점 배열
 */
export function extractDifferences(posts: PostInfo[]): string[] {
  const dontPoints: string[] = []

  if (posts.length < 2) return dontPoints

  // 1. 개인별 취향 추출
  const personalPreferencePoints = extractPersonalPreferencePoints(posts)
  dontPoints.push(...personalPreferencePoints)

  // 2. 평가 기준 차이 추출
  const evaluationCriteriaPoints = extractEvaluationCriteriaPoints(posts)
  dontPoints.push(...evaluationCriteriaPoints)

  // 3. 의견 차이 추출
  const opinionDifferencePoints = extractOpinionDifferencePoints(posts)
  dontPoints.push(...opinionDifferencePoints)

  return dontPoints
}

/**
 * 메뉴 포인트 추출
 * @param posts 포스팅 정보 배열
 * @returns 메뉴 포인트 배열
 */
function extractMenuPoints(posts: PostInfo[]): string[] {
  const menuPoints: string[] = []

  // 모든 포스팅의 콘텐츠에서 메뉴 키워드 추출
  const menuKeywords = ['메뉴', '음식', '식사', '코스', '세트메뉴', '메인메뉴', '사이드메뉴', '디저트']

  for (const post of posts) {
    if (!post.content) continue

    for (const keyword of menuKeywords) {
      if (post.content.includes(keyword)) {
        // 메뉴 키워드 근처의 텍스트 추출 (최대 100자)
        const keywordIndex = post.content.indexOf(keyword)
        const startIndex = Math.max(0, keywordIndex - 50)
        const endIndex = Math.min(post.content.length, keywordIndex + keyword.length + 50)
        const menuText = post.content.substring(startIndex, endIndex).trim()

        if (!menuPoints.includes(menuText)) {
          menuPoints.push(menuText)
        }
        break
      }
    }
  }

  return menuPoints
}

/**
 * 맛집 이름 포인트 추출
 * @param posts 포스팅 정보 배열
 * @returns 맛집 이름 포인트 배열
 */
function extractCafeNamePoints(posts: PostInfo[]): string[] {
  const cafeNames: string[] = []

  // 모든 포스팅의 카페 이름 추출
  for (const post of posts) {
    if (!post.cafeInfo || !post.cafeInfo.cafeName) continue

    const cafeName = post.cafeInfo.cafeName
    if (!cafeNames.includes(cafeName)) {
      cafeNames.push(cafeName)
    }
  }

  return cafeNames
}

/**
 * 평균 별점 포인트 추출
 * @param posts 포스팅 정보 배열
 * @returns 평균 별점 포인트 배열
 */
function extractAverageScorePoints(posts: PostInfo[]): string[] {
  const averageScorePoints: string[] = []

  // 모든 포스팅의 별점 계산
  let totalScore = 0
  let reviewCount = 0

  for (const post of posts) {
    if (!post.reviews || post.reviews.length === 0) continue

    for (const review of post.reviews) {
      totalScore += review.score
      reviewCount++
    }
  }

  if (reviewCount > 0) {
    const averageScore = totalScore / reviewCount
    averageScorePoints.push(`평균 별점: ${averageScore.toFixed(1)}`)
  }

  return averageScorePoints
}

/**
 * 개인별 취향 포인트 추출
 * @param posts 포스팅 정보 배열
 * @returns 개인별 취향 포인트 배열
 */
function extractPersonalPreferencePoints(posts: PostInfo[]): string[] {
  const personalPreferencePoints: string[] = []

  // 개인별 취향 키워드 추출
  const preferenceKeywords = ['좋아', '최애', '좋아하는', '싫어', '최애하는', '별로', '별로 안']

  for (const post of posts) {
    if (!post.content) continue

    for (const keyword of preferenceKeywords) {
      if (post.content.includes(keyword)) {
        // 취향 키워드 근처의 텍스트 추출 (최대 100자)
        const keywordIndex = post.content.indexOf(keyword)
        const startIndex = Math.max(0, keywordIndex - 50)
        const endIndex = Math.min(post.content.length, keywordIndex + keyword.length + 50)
        const preferenceText = post.content.substring(startIndex, endIndex).trim()

        if (!personalPreferencePoints.includes(preferenceText)) {
          personalPreferencePoints.push(preferenceText)
        }
        break
      }
    }
  }

  return personalPreferencePoints
}

/**
 * 평가 기준 차이 포인트 추출
 * @param posts 포스팅 정보 배열
 * @returns 평가 기준 차이 포인트 배열
 */
function extractEvaluationCriteriaPoints(posts: PostInfo[]): string[] {
  const evaluationCriteriaPoints: string[] = []

  // 첫 번째 포스팅의 평가 기준 추출
  if (posts.length > 0 && posts[0].reviews) {
    const firstPost = posts[0]
    for (const review of firstPost.reviews) {
      if (!evaluationCriteriaPoints.includes(review.category)) {
        evaluationCriteriaPoints.push(`${review.category}: ${review.score}`)
      }
    }
  }

  // 두 번째 포스팅의 평가 기준 추출
  if (posts.length > 1 && posts[1].reviews) {
    const secondPost = posts[1]
    for (const review of secondPost.reviews) {
      if (!evaluationCriteriaPoints.includes(review.category)) {
        evaluationCriteriaPoints.push(`${review.category}: ${review.score}`)
      }
    }
  }

  return evaluationCriteriaPoints
}

/**
 * 의견 차이 포인트 추출
 * @param posts 포스팅 정보 배열
 * @returns 의견 차이 포인트 배열
 */
function extractOpinionDifferencePoints(posts: PostInfo[]): string[] {
  const opinionDifferencePoints: string[] = []

  // 긍정/부정 평가 키워드 추출
  const positiveKeywords = ['좋아', '최고', '훌륭한', '최상', '추천', '재방문', '또 갈게요']
  const negativeKeywords = ['별로', '아쉬운', '최악', '최저', '비추천', '안 가요']

  for (const post of posts) {
    if (!post.content) continue

    let isPositive = false
    let isNegative = false

    for (const keyword of positiveKeywords) {
      if (post.content.includes(keyword)) {
        isPositive = true
        break
      }
    }

    for (const keyword of negativeKeywords) {
      if (post.content.includes(keyword)) {
        isNegative = true
        break
      }
    }

    if (isPositive && !opinionDifferencePoints.includes('긍정 평가')) {
      opinionDifferencePoints.push('긍정 평가')
    }

    if (isNegative && !opinionDifferencePoints.includes('부정 평가')) {
      opinionDifferencePoints.push('부정 평가')
    }
  }

  return opinionDifferencePoints
}

/**
 * 주의사항 추출
 * @param posts 포스팅 정보 배열
 * @returns 주의사항 배열
 */
export function extractWarnings(posts: PostInfo[]): string[] {
  const warnings: string[] = []

  // 1. 포스팅 수가 부족한 경우
  if (posts.length < 3) {
    warnings.push('포스팅 수가 부족하여 신뢰성 있는 분석이 어렵습니다')
  }

  // 2. 포스팅 간의 기간 차이가 큰 경우
  // (구현 필요: createdAt 비교)

  // 3. 개인적인 의견 차이가 큰 경우
  const opinionDifferencePoints = extractOpinionDifferencePoints(posts)
  if (opinionDifferencePoints.includes('긍정 평가') && opinionDifferencePoints.includes('부정 평가')) {
    warnings.push('개인적인 의견 차이가 큽니다. 환경/상황에 따라 평가가 다를 수 있습니다')
  }

  return warnings
}

/**
 * 종합 점수 계산
 * @param posts 포스팅 정보 배열
 * @returns 종합 점수
 */
export function calculateOverallScore(posts: PostInfo[]): number {
  if (posts.length === 0) return 0

  let totalScore = 0
  let reviewCount = 0

  for (const post of posts) {
    if (!post.reviews || post.reviews.length === 0) continue

    for (const review of post.reviews) {
      totalScore += review.score
      reviewCount++
    }
  }

  if (reviewCount > 0) {
    return totalScore / reviewCount
  }

  return 0
}

/**
 * 전체 분석 수행
 * @param posts 포스팅 정보 배열
 * @returns 분석 결과
 */
export function analyzePosts(posts: PostInfo[]): AnalysisResult {
  const doPoints = extractCommonPoints(posts)
  const dontPoints = extractDifferences(posts)
  const warnings = extractWarnings(posts)
  const overallScore = calculateOverallScore(posts)

  return {
    doPoints,
    dontPoints,
    warnings,
    overallScore,
  }
}
