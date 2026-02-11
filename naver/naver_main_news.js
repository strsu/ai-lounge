const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('네이버 메인 접속 중...');
    await page.goto('https://www.naver.com/', { waitUntil: 'domcontentloaded' });

    // 페이지가 로드될 때까지 대기
    await page.waitForTimeout(5000);

    console.log('페이지 제목:', await page.title());
    console.log('현재 URL:', page.url());

    // 스크린샷 찍기
    await page.screenshot({ path: '/home/jj/.openclaw/workspace/naver/naver_main.png', fullPage: true });
    console.log('스크린샷 저장됨: naver_main.png');

    // 뉴스 헤드라인 추출
    const news = await page.evaluate(() => {
      const results = [];

      // 뉴스 관련 선택자들
      const selectors = [
        '.news_area',
        '.news_wrap',
        '.news_tit',
        '[class*="news"]',
        '.ranking_news',
        '.ah_k'
      ];

      // 헤드라인 텍스트 추출
      const allText = document.body.innerText;
      const lines = allText.split('\n');

      // 뉴스 키워드가 포함된 줄 필터링
      lines.forEach(line => {
        const trimmed = line.trim();
        // 너무 길거나 너무 짧은 줄 제외
        if (trimmed.length > 10 && trimmed.length < 200) {
          // 뉴스 관련 패턴
          if (trimmed.includes('뉴스') ||
              trimmed.match(/[0-9]시|[0-9]일|기자|방송|정치|경제|사회|국제|IT|연예|스포츠/)) {
            // 날짜/시간 패턴 제외
            if (!trimmed.match(/^\d{2}:\d{2}$/) &&
                !trimmed.match(/^\d{4}-\d{2}-\d{2}$/)) {
              results.push(trimmed);
            }
          }
        }
      });

      // 중복 제거하고 상위 30개 반환
      return [...new Set(results)].slice(0, 30);
    });

    console.log('\n=== 네이버 메인 주요 뉴스 ===\n');
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

    const fs = require('fs');
    fs.writeFileSync('/home/jj/.openclaw/workspace/naver/naver_main_news.json', JSON.stringify(result, null, 2));
    console.log('\n뉴스 저장됨: naver_main_news.json');

    // 스크린샷 전송
    console.log('\nSlack으로 스크린샷 전송 중...');

  } catch (error) {
    console.error('에러 발생:', error.message);
    console.error('스택:', error.stack);
  } finally {
    await browser.close();
  }
})();
