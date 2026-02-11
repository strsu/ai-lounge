const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('네이버 뉴스스탠드 접속 중...');
    await page.goto('https://newsstand.naver.com/', { waitUntil: 'domcontentloaded' });

    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForTimeout(5000);

    console.log('페이지 제목:', await page.title());
    console.log('현재 URL:', page.url());

    // 스크린샷 찍기
    await page.screenshot({ path: '/home/jj/.openclaw/workspace/naver/newsstand.png', fullPage: true });
    console.log('스크린샷 저장됨: newsstand.png');

    // 전체 페이지 텍스트 추출
    const bodyText = await page.evaluate(() => {
      return document.body.innerText;
    });

    // 파일로 저장
    const fs = require('fs');
    fs.writeFileSync('/home/jj/.openclaw/workspace/naver/newsstand_text.txt', bodyText);
    console.log('텍스트 저장됨: newsstand_text.txt');

    // 메인 헤드라인 뉴스 추출 시도
    const headlines = await page.evaluate(() => {
      const results = [];
      // 다양한 뉴스 헤드라인 선택자
      const selectors = [
        'h2',
        'h3',
        '.headline',
        '.news_tit',
        '[class*="headline"]',
        '[class*="title"]'
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const text = el.textContent.trim();
          if (text && text.length > 10 && text.length < 200) {
            results.push(text);
          }
        });
      }

      // 중복 제거
      return [...new Set(results)].slice(0, 20);
    });

    console.log('\n=== 주요 헤드라인 ===\n');
    headlines.forEach(h => console.log(`• ${h}`));

    // 결과 저장
    const result = {
      title: await page.title(),
      url: page.url(),
      headlines: headlines,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync('/home/jj/.openclaw/workspace/naver/newsstand_summary.json', JSON.stringify(result, null, 2));
    console.log('\n요약 저장됨: newsstand_summary.json');

  } catch (error) {
    console.error('에러 발생:', error.message);
    console.error('스택:', error.stack);
  } finally {
    await browser.close();
  }
})();
