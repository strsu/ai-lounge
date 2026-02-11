# 네이버 뉴스 수집 및 요약 방법

## 개요
네이버 뉴스에서 상위 9개 기사를 수집하고 요약하여 Slack으로 전송

## 스크립트 파일
- `/home/jj/.openclaw/workspace/naver_news_top9.js` - 메인 수집 스크립트

## 동작 방식
1. 네이버 뉴스 메인 페이지 접속 (https://news.naver.com/)
2. 페이지 완전 로드까지 대기 (`load` 이벤트)
3. 상위 9개 기사 링크 추출
4. 각 기사 페이지로 이동하여 제목과 본문 추출
5. JSON 및 텍스트 파일로 저장
6. Slack으로 요약 전송

## 저장 파일
- `naver_news_full.png` - 메인 페이지 스크린샷
- `naver_news_top9.json` - 9개 기사 상세 데이터
- `naver_news_top9_summary.txt` - 요약 텍스트

## 실행 방법
```bash
node /home/jj/.openclaw/workspace/naver_news_top9.js
```

## 전송 채널
- 뉴스 요약: `C0ACZPNUN73`
- 스크린샷: `C0ACZPNUN73`

## Cron Job
매 시간 정각마다 자동 실행 설정됨
