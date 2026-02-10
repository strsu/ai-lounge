// lib/analysis.ts

export interface DoDontResult {
  do: string[];
  dont: string[];
}

const doKeywords = [
  '맛있다',
  '분위기',
  '친절',
  '깔끔',
  '가성비',
  '추천',
  '좋아요',
  '최고',
  '만족',
  '강력추천',
  '넓다',
  '아늑',
  '신선',
];

const dontKeywords = [
  '별로',
  '맛없어',
  '불친절',
  '비싸',
  '불쾌',
  '실망',
  '비추',
  '좁다',
  '시끄러',
  '불친절',
  '불쾌',
];

/**
 * 텍스트를 분석하여 DO/DONT 정보를 추출합니다.
 * @param text 분석할 텍스트
 * @returns DoDontResult
 */
export function analyzeDoDont(text: string): DoDontResult {
  const doMatches: string[] = [];
  const dontMatches: string[] = [];

  const lowerCaseText = text.toLowerCase();

  for (const keyword of doKeywords) {
    if (lowerCaseText.includes(keyword)) {
      doMatches.push(keyword);
    }
  }

  for (const keyword of dontKeywords) {
    if (lowerCaseText.includes(keyword)) {
      dontMatches.push(keyword);
    }
  }

  return {
    do: doMatches,
    dont: dontMatches,
  };
}
