#!/usr/bin/env python3
import json
import re
import subprocess
import sys

# 기사 링크 리스트
article_urls = [
    "https://n.news.naver.com/article/011/0004586711",
    "https://n.news.naver.com/article/011/0004586724",
    "https://n.news.naver.com/article/011/0004586316",
    "https://n.news.naver.com/article/011/0004586797",
    "https://n.news.naver.com/article/654/0000165038",
    "https://n.news.naver.com/article/654/0000165015",
    "https://n.news.naver.com/article/654/0000164994",
    "https://n.news.naver.com/article/654/0000165037",
    "https://n.news.naver.com/article/023/0003957180"
]

def get_article_content(url):
    """기사의 제목과 본문을 가져옵니다"""
    try:
        result = subprocess.run(
            ['curl', '-s', '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', url],
            capture_output=True,
            text=True,
            timeout=10
        )
        html = result.stdout

        # 제목 추출 (og:title)
        title_match = re.search(r'<meta property="og:title" content="([^"]*)"', html)
        title = title_match.group(1) if title_match else "제목 없음"

        # 본문 추출 (article 문단)
        # 여러 패턴 시도
        content_patterns = [
            r'<article[^>]*id="articleBody"[^>]*>(.*?)</article>',
            r'<div[^>]*id="articleBody"[^>]*>(.*?)</div>',
            r'<div[^>]*id="newsct_article"[^>]*>(.*?)</div>',
            r'<div[^>]*class="newsct_article"[^>]*>(.*?)</div>',
        ]

        content = ""
        for pattern in content_patterns:
            content_match = re.search(pattern, html, re.DOTALL)
            if content_match:
                content_raw = content_match.group(1)
                # HTML 태그 제거
                content = re.sub(r'<[^>]+>', ' ', content_raw)
                content = re.sub(r'\s+', ' ', content).strip()
                if len(content) > 100:
                    break

        if not content or len(content) < 50:
            # 대체 방법: 모든 <p> 태그 내용 수집
            paragraphs = re.findall(r'<p[^>]*>(.*?)</p>', html, re.DOTALL)
            content = ' '.join([re.sub(r'<[^>]+>', ' ', p).strip() for p in paragraphs if len(re.sub(r'<[^>]+>', ' ', p).strip()) > 50])
            content = re.sub(r'\s+', ' ', content).strip()

        # 본문이 너무 길면 자르기
        if len(content) > 1000:
            content = content[:1000] + "..."

        return {
            "url": url,
            "title": title,
            "content": content if content else "본문 없음"
        }
    except Exception as e:
        return {
            "url": url,
            "title": "오류",
            "content": f"가져오기 실패: {str(e)}"
        }

def main():
    articles = []
    print("네이버 뉴스 수집 중...\n", file=sys.stderr)

    for i, url in enumerate(article_urls, 1):
        print(f"[{i}/9] 기사 수집 중...", file=sys.stderr)
        article = get_article_content(url)
        articles.append(article)
        print(f"  ✓ {article['title'][:40]}...", file=sys.stderr)

    # JSON 출력
    print(json.dumps(articles, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
