const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeNaverNews() {
  try {
    const response = await axios.get('https://news.naver.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const news = [];

    // 네이버 뉴스 메인 페이지의 헤드라인 기사 추출
    // 여러 선택자 시도
    const selectors = [
      'a.news_tit',
      '.newsflash_body .sa_text_strong',
      '.main_header .sa_item a.sa_text_strong',
      '.section_list_ranking a',
      '.section_list_ranking .sa_item a.sa_text_strong'
    ];

    for (const selector of selectors) {
      $(selector).each((i, elem) => {
        if (news.length >= 9) return false;

        const title = $(elem).text().trim();
        const link = $(elem).attr('href');

        if (title && link && !news.some(n => n.title === title)) {
          news.push({ title, link });
        }
      });
    }

    // 여전히 9개가 안되면 다른 선택자 시도
    if (news.length < 9) {
      $('a[href*="/main/read.naver"]').each((i, elem) => {
        if (news.length >= 9) return false;

        const title = $(elem).text().trim();
        const link = $(elem).attr('href');

        if (title && link && title.length > 10 && !news.some(n => n.title === title)) {
          news.push({ title, link: link.startsWith('http') ? link : 'https://news.naver.com' + link });
        }
      });
    }

    return news.slice(0, 9);
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
}

scrapeNaverNews().then(news => {
  console.log(JSON.stringify(news, null, 2, ensureUnicode=false));
});
