# 🍺 술 먹는 날 체크 시스템

전하의 술 마신 날을 기록하고 월별로 확인하는 웹 시스템입니다.

## 📂 파일 구조

```
drinking-tracker/
├── data.json       # 데이터 저장소
├── index.html      # 웹 뷰어 (달력 + 통계)
├── add_record.py   # 데이터 추가 스크립트
└── README.md       # 이 파일
```

## 🚀 사용 방법

### 1. 웹 뷰어 열기

```bash
cd /home/jj/.openclaw/workspace/drinking-tracker
python3 -m http.server 8080
```

그리고 브라우저에서:
- http://localhost:8080

### 2. 기록 추가

#### 방법 1: 직접 스크립트 실행

```bash
python3 add_record.py <날짜> [--people <사람1> <사람2> ...] [--food <음식>]
```

**예시:**
```bash
# 오늘 기록
python3 add_record.py today --people 진수 수호

# 특정 날짜 기록 + 음식
python3 add_record.py 2026-02-15 --people 진수 수호 --food 곱창

# 혼자 마심
python3 add_record.py today

# 음식만 추가
python3 add_record.py 2026-02-15 --food 치킨
```

#### 방법 2: OpenClaw에게 말하기

전하가 Slack에서:
> "오늘 진수랑 수호랑 곱창 먹는다"

라고 말하면 내가 자동으로 기록해드릴게요! 🤖

## 📊 웹 뷰어 기능

### 달력 뷰
- 📅 월별 캘린더
- 🍺 술 마신 날은 보라색으로 표시
- 🟡 오늘은 노란색으로 표시
- 👥 누구랑 마셨는지 표시
- 🍽️ 무엇을 먹었는지 표시
- ◀ ▶ 버튼으로 이전/다음 달 이동

### 통계
- 📈 이번 달 음주일
- 📉 음주 비율
- 🎯 전체 누적 음주일
- 👥 누구랑 가장 많이 마셨는지 랭킹
- 🍽️ 가장 많이 먹은 음식 랭킹

## 💾 데이터 형식

```json
{
  "records": [
    {
      "date": "2026-02-02",
      "people": ["진수", "수호"],
      "food": "곱창"
    },
    {
      "date": "2026-02-15",
      "people": ["진수"],
      "food": "치킨"
    }
  ]
}
```

## 🔧 커스터마이징

### 포트 변경

```bash
python3 -m http.server 9000  # 9000번 포트로 변경
```

### 색상 변경

`index.html`의 CSS에서 수정하세요:

```css
/* 술 마신 날 배경색 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## 📝 기록 템플릿

전하가 다음과 같이 말씀하면 기록해드릴 수 있사옵니다:

- "오늘 진수랑 먹는다"
- "오늘 진수랑 곱창 먹는다"
- "내일 수호랑 먹을거야"
- "2월 15일에 진수 수호랑 먹는다"
- "오늘 혼자 마신다" (사람 이름 없으면 혼자 마신 걸로 기록)
- "오늘 치킨 먹었다" (음식 정보도 자동으로 기록)

---

**만든이:** OpenClaw AI 🤖
**만든 날:** 2026년 2월 2일
