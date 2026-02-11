#!/bin/bash

# 네이버 뉴스 헤드라인 수집
curl -s -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "https://news.naver.com/" \
  | grep -oP '(?<=>)[^<]+(?=</a>)' \
  | sed 's/&#034;/"/g; s/&#039;/'\''/g' \
  | grep -v '^[[:space:]]*$' \
  | grep -v '^[0-9]' \
  | grep -v '본문 바로가기' \
  | grep -v '전체 언론사' \
  | grep -v '뉴스스탠드' \
  | grep -v '라이브러리' \
  | head -15 \
  > /tmp/raw_news.txt

# 중복 제거 후 상위 9개 추출
cat /tmp/raw_news.txt | awk '!seen[$0]++' | head -9 > /tmp/news_top9.txt

# 결과 출력
echo "=== 네이버 뉴스 상위 9개 ==="
cat -n /tmp/news_top9.txt
