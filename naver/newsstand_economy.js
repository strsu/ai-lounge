const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('네이버 뉴스스탠드 종합/경제 접속 중...');
    await page.goto('https://newsstand.naver.com/?list=ct2', { waitUntil: 'domcontentloaded' });

    // 충분히 기다림
    console.log('페이지 로딩 대기 중...');
    await page.waitForTimeout(10000);

    console.log('추가 대기...');
    await page.waitForTimeout(5000);

    console.log('페이지 제목:', await page.title());
    console.log('현재 URL:', page.url());

    // 스크린샷 찍기
    await page.screenshot({ path: '/home/jj/.openclaw/workspace/naver/newsstand_economy.png', fullPage: true });
    console.log('스크린샷 저장됨: newsstand_economy.png');

    // 전체 텍스트 추출
    const bodyText = await page.evaluate(() => {
      return document.body.innerText;
    });

    // 텍스트 저장
    const fs = require('fs');
    fs.writeFileSync('/home/jj/.openclaw/workspace/naver/newsstand_economy_text.txt', bodyText);
    console.log('텍스트 저장됨: newsstand_economy_text.txt');

    // 뉴스 헤드라인 추출
    const news = await page.evaluate(() => {
      const results = [];
      const lines = document.body.innerText.split('\n');

      lines.forEach(line => {
        const trimmed = line.trim();
        // 뉴스 헤드라인 패턴
        if (trimmed.length > 15 && trimmed.length < 200) {
          // 날짜, 시간, 편집 정보 제외
          if (!trimmed.match(/^\d{2}-\d{2}/) &&
              !trimmed.match(/^\d{2}:\d{2}/) &&
              !trimmed.includes('편집') &&
              !trimmed.includes('사이트 바로가기') &&
              !trimmed.includes('구독하기')) {
            // 뉴스 키워드 포함 여부 확인
            if (trimmed.match(/경제|정치|사회|국제|주식|코스피|코스닥|원\/달러|금리|인플레이션|기준금리|수출|수입|기업|은행|금융|부동산|공시|실적|주주|투자|증권|IPO|IPO|공모주|M&A|기술주|AI|반도체|배터리|자동차|조선|철강|석유|가스|전력|에너지|빅테크|플랫폼|스타트업|벤처|유니콘/)) {
              results.push(trimmed);
            }
          }
        }
      });

      return [...new Set(results)].slice(0, 30);
    });

    console.log('\n=== 종합/경제 주요 뉴스 ===\n');
    news.forEach((item, index) => {
      console.log(`${index + 1}. ${item}`);
    });

    // 결과 저장
    const result = {
      title: await page.title(),
      url: page.url(),
      news: news,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync('/home/jj/.openclaw/workspace/naver/newsstand_economy_summary.json', JSON.stringify(result, null, 2));
    console.log('\n요약 저장됨: newsstand_economy_summary.json');

  } catch (error) {
    console.error('에러 발생:', error.message);
    console.error('스택:', error.stack);
  } finally {
    await browser.close();
  }
})();
