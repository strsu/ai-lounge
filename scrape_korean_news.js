const axios = require('axios');
const cheerio = require('cheerio');

async function fetchNews() {
  const newsSources = [
    {
      name: 'JTBC',
      url: 'https://news.jtbc.co.kr/',
      selectors: ['.headline_news > li a', 'a.news_tit']
    },
    {
      name: 'SBS',
      url: 'https://news.sbs.co.kr/news/',
      selectors: ['.news_title a', '.news_wrp a']
    },
    {
      name: 'MBN',
      url: 'https://www.mbn.co.kr/news/',
      selectors: ['.news_list a', '.section_news_tit a']
    }
  ];

  const allNews = [];

  for (const source of newsSources) {
    try {
      console.log(`Fetching from ${source.name}...`);
      const response = await axios.get(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      for (const selector of source.selectors) {
        $(selector).each((i, elem) => {
          if (allNews.length >= 9) return false;

          const title = $(elem).text().trim();
          let link = $(elem).attr('href');

          if (title && title.length > 10 && !allNews.some(n => n.title === title)) {
            if (link && !link.startsWith('http')) {
              link = new URL(link, source.url).href;
            }
            allNews.push({
              title,
              link,
              source: source.name
            });
          }
        });

        if (allNews.length >= 9) return false;
      }
    } catch (error) {
      console.error(`Error fetching from ${source.name}:`, error.message);
    }

    if (allNews.length >= 9) break;
  }

  return allNews.slice(0, 9);
}

fetchNews().then(news => {
  console.log(JSON.stringify(news, null, 2));
}).catch(err => {
  console.error('Error:', err);
});
