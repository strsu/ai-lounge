const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('네이버 뉴스 접속 중...');
    await page.goto('https://news.naver.com/', { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(5000);
    console.log('페이지 제목:', await page.title());

    // 스크린샷 찍기
    await page.screenshot({ path: '/home/jj/.openclaw/workspace/naver/naver_news.png', fullPage: true });
    console.log('메인 스크린샷 저장됨');

    // 언론사와 기사 추출
    const articles = await page.evaluate(() => {
      const results = [];

      // 각 언론사 섹션 찾기
      const pressSections = document.querySelectorAll('.newsflash_list');

      pressSections.forEach(section => {
        const pressName = section.querySelector('.press_name')?.textContent?.trim();
        if (!pressName) return;

        const links = section.querySelectorAll('a.news_tit');

        links.forEach((link, index) => {
          if (index >= 2) return; // 상위 2개만

          const title = link.textContent?.trim();
          const href = link.getAttribute('href');

          if (title && href) {
            results.push({
              pressName: pressName,
              rank: index + 1,
              title: title,
              url: href.startsWith('http') ? href : `https://news.naver.com${href}`
            });
          }
        });
      });

      return results;
    });

    console.log(`\n찾은 기사 수: ${articles.length}`);
    articles.forEach(art => {
      console.log(`[${art.pressName}] ${art.rank}위: ${art.title.substring(0, 50)}...`);
    });

    // 각 기사 접속해서 내용 추출
    const fs = require('fs');
    const detailedResults = [];

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`\n[${i + 1}/${articles.length}] ${article.pressName} ${article.rank}위 기사 접속 중...`);

      try {
        const articlePage = await browser.newPage();
        await articlePage.goto(article.url, { waitUntil: 'domcontentloaded' });
        await articlePage.waitForTimeout(2000);

        // 기사 본문 추출
        const content = await articlePage.evaluate(() => {
          // 다양한 본문 선택자 시도
          const selectors = [
            '#dic_area',
            '.news_end',
            '#articleBody',
            '.article-body',
            '[id*="articleBody"]',
            '[class*="article-body"]',
            '[id*="dic_area"]',
            '[class*="dic_area"]'
          ];

          for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
              return element.textContent.trim();
            }
          }

          return '';
        });

        detailedResults.push({
          pressName: article.pressName,
          rank: article.rank,
          title: article.title,
          url: article.url,
          content: content.substring(0, 1000), // 상위 1000자만
          fullContent: content
        });

        console.log(`  - 내용 추출 완료: ${content.substring(0, 50)}...`);

        await articlePage.close();
      } catch (e) {
        console.log(`  - 에러: ${e.message}`);
      }
    }

    // 결과 저장
    fs.writeFileSync(
      '/home/jj/.openclaw/workspace/naver/naver_news_detailed.json',
      JSON.stringify(detailedResults, null, 2)
    );
    console.log('\n상세 결과 저장됨: naver_news_detailed.json');

    // 요약 생성
    console.log('\n=== 뉴스 요약 ===\n');
    detailedResults.forEach(item => {
      console.log(`【${item.pressName} ${item.rank}위】`);
      console.log(`제목: ${item.title}`);
      console.log(`내용: ${item.content.substring(0, 200)}...`);
      console.log('---\n');
    });

    // 요약 텍스트 파일 생성
    let summaryText = '네이버 뉴스 각 언론사별 상위 기사 요약\n';
    summaryText += '========================================\n\n';

    detailedResults.forEach(item => {
      summaryText += `【${item.pressName} ${item.rank}위】\n`;
      summaryText += `제목: ${item.title}\n`;
      summaryText += `내용: ${item.content.substring(0, 300)}...\n\n`;
    });

    fs.writeFileSync('/home/jj/.openclaw/workspace/naver/naver_news_summary.txt', summaryText, 'utf-8');
    console.log('요약 텍스트 저장됨: naver_news_summary.txt');

  } catch (error) {
    console.error('에러 발생:', error.message);
    console.error('스택:', error.stack);
  } finally {
    await browser.close();
  }
})();
