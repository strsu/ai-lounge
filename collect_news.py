#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

article_ids = [
    '005/0001830273',
    '005/0001830411',
    '005/0001830420',
    '005/0001830427',
    '031/0001003029',
    '031/0001003037',
    '031/0001003079',
    '031/0001003083',
    '449/0000334444'
]

articles = []

for aid in article_ids:
    url = f'https://n.news.naver.com/article/{aid}'
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(resp.text, 'html.parser')

        # 제목 추출
        title_elem = soup.find('h2', class_='media_end_head_headline') or soup.find('h3')
        title = title_elem.get_text(strip=True) if title_elem else "제목 없음"

        # 본문 추출
        article_body = soup.find('article', {'id': 'dic_area'})
        if article_body:
            # 불필요한 요소 제거
            for elem in article_body.find_all(['script', 'style', 'iframe', 'img']):
                elem.decompose()
            paragraphs = [p.get_text(strip=True) for p in article_body.find_all(['p', 'div']) if p.get_text(strip=True)]
            content = ' '.join(paragraphs)
        else:
            content = "내용 없음"

        # 요약 (처음 200자)
        summary = content[:300] + '...' if len(content) > 300 else content

        articles.append({
            'url': url,
            'title': title,
            'summary': summary
        })

        print(f"수집 완료: {title[:50]}...")

    except Exception as e:
        print(f"Error fetching {aid}: {e}")
        articles.append({
            'url': url,
            'title': '수집 실패',
            'summary': str(e)
        })

# 결과 저장
with open('/home/jj/.openclaw/workspace/news_summary.json', 'w', encoding='utf-8') as f:
    json.dump(articles, f, ensure_ascii=False, indent=2)

print(f"\n총 {len(articles)}개 기사 수집 완료")
