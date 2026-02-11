const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('네이버 뉴스 접속 중...');
    await page.goto('https://news.naver.com/', { waitUntil: 'load' });

    await page.waitForTimeout(10000);
    console.log('페이지 제목:', await page.title());
    console.log('현재 URL:', page.url());

    // 스크린샷 찍기
    await page.screenshot({ path: '/home/jj/.openclaw/workspace/naver/naver_news_full.png', fullPage: true });
    console.log('메인 스크린샷 저장됨');

    // 페이지의 모든 뉴스 링크 추출
    const articles = await page.evaluate(() => {
      const results = [];

      // 다양한 뉴스 링크 선택자
      const selectors = [
        'a.news_tit',
        'a[href*="/mnews/article/"]',
        'a[href*="/article/"]',
        '.news_area a',
        '.newsflash_list a'
      ];

      selectors.forEach(selector => {
        const links = document.querySelectorAll(selector);
        links.forEach(link => {
          const text = link.textContent?.trim();
          const href = link.getAttribute('href');

          if (text && href && text.length > 10 && text.length < 200) {
            const fullUrl = href.startsWith('http') ? href : `https://news.naver.com${href}`;

            // 중복 제거
            if (!results.find(r => r.url === fullUrl)) {
              results.push({
                title: text,
                url: fullUrl
              });
            }
          }
        });
      });

      // 상위 9개만 반환
      return results.slice(0, 9);
    });

    console.log(`\n찾은 기사 수: ${articles.length}`);

    // 각 기사 접속해서 내용 추출
    const fs = require('fs');
    const detailedResults = [];

    for (let i = 0; i < Math.min(articles.length, 9); i++) {
      const article = articles[i];
      console.log(`\n[${i + 1}/${Math.min(articles.length, 9)}] 기사 접속 중...`);
      console.log(`제목: ${article.title}`);

      try {
        const articlePage = await browser.newPage();
        await articlePage.goto(article.url, { waitUntil: 'load' });
        await articlePage.waitForTimeout(3000);

        console.log(`  - 기사 페이지 URL: ${articlePage.url()}`);

        // 기사 제목 추출
        const articleTitle = await articlePage.evaluate(() => {
          const selectors = ['h2', '#articleTitle', '.title', '.article-headline'];
          for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) return element.textContent.trim();
          }
          return '';
        });

        // 기사 본문 추출
        const content = await articlePage.evaluate(() => {
          const selectors = [
            '#dic_area',
            '.news_end',
            '#articleBody',
            '.article-body',
            '[id*="articleBody"]',
            '[class*="article-body"]',
            '[id*="dic_area"]',
            '[class*="dic_area"]',
            '.newsct_article',
            '#newsEndContents'
          ];

          for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
              const text = element.textContent.trim();
              // 불필요한 텍스트 제거
              return text.replace(/기자님|특파원|보내기|저장|공유|SNS|페이스북|카카오톡|네이버블로그/g, '').trim();
            }
          }

          return '';
        });

        const finalTitle = articleTitle || article.title;
        detailedResults.push({
          rank: i + 1,
          title: finalTitle,
          url: article.url,
          content: content.substring(0, 1000), // 상위 1000자만
          fullContent: content
        });

        console.log(`  - 제목: ${finalTitle}`);
        console.log(`  - 내용 추출 완료: ${content.substring(0, 50)}...`);

        await articlePage.close();
      } catch (e) {
        console.log(`  - 에러: ${e.message}`);
        detailedResults.push({
          rank: i + 1,
          title: article.title,
          url: article.url,
          content: '내용 추출 실패',
          error: e.message
        });
      }
    }

    // 결과 저장
    fs.writeFileSync(
      '/home/jj/.openclaw/workspace/naver/naver_news_top9.json',
      JSON.stringify(detailedResults, null, 2)
    );
    console.log('\n상세 결과 저장됨: naver_news_top9.json');

    // 요약 생성
    let summaryText = '네이버 뉴스 상위 9개 기사 요약\n';
    summaryText += '========================================\n\n';

    detailedResults.forEach(item => {
      summaryText += `【${item.rank}위】\n`;
      summaryText += `제목: ${item.title}\n`;
      summaryText += `URL: ${item.url}\n`;
      summaryText += `내용: ${item.content.substring(0, 300)}...\n\n`;
    });

    fs.writeFileSync('/home/jj/.openclaw/workspace/naver/naver_news_top9_summary.txt', summaryText, 'utf-8');
    console.log('요약 텍스트 저장됨: naver_news_top9_summary.txt');

  } catch (error) {
    console.error('에러 발생:', error.message);
    console.error('스택:', error.stack);
  } finally {
    await browser.close();
  }
})();
