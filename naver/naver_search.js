const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 네이버 뉴스 검색으로 바로 접속
    console.log('네이버 뉴스 검색 접속 중...');
    await page.goto('https://search.naver.com/search.naver?where=news&query=%EC%9C%A4%ED%95%98', { waitUntil: 'networkidle' });

    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForTimeout(5000);

    console.log('페이지 제목:', await page.title());
    console.log('현재 URL:', page.url());

    // 스크린샷 찍기
    await page.screenshot({ path: '/home/jj/.openclaw/workspace/yoonha_news.png', fullPage: true });
    console.log('스크린샷 저장됨: yoonha_news.png');

    // 기사 제목과 링크 추출 - 네이버 뉴스 선택자
    const results = [];

    // 다양한 선택자 시도
    const selectors = [
      '.news_tit',
      'a.news_tit',
      '.api_txt_lines .news_tit',
      '.list_news .news_tit',
      '[class*="news_tit"]'
    ];

    for (const selector of selectors) {
      try {
        const articles = await page.locator(selector).all();
        console.log(`선택자 "${selector}" 찾음:`, articles.length);

        for (const article of articles.slice(0, 10)) {
          const text = await article.textContent();
          const href = await article.getAttribute('href');
          if (text && text.trim()) {
            // 중복 제거
            if (!results.find(r => r.title === text.trim())) {
              results.push({ title: text.trim(), link: href });
              console.log(`• ${text.trim()}`);
              console.log(`  ${href}\n`);
            }
          }
        }

        if (results.length > 0) break;
      } catch (e) {
        console.log(`선택자 "${selector}" 에러:`, e.message);
      }
    }

    // 결과 저장
    const fs = require('fs');
    fs.writeFileSync('/home/jj/.openclaw/workspace/yoonha_articles.json', JSON.stringify(results, null, 2));
    console.log('\n결과가 저장됨: yoonha_articles.json');
    console.log('총', results.length, '개의 기사 찾음');

  } catch (error) {
    console.error('에러 발생:', error.message);
    console.error('스택:', error.stack);
  } finally {
    await browser.close();
  }
})();
