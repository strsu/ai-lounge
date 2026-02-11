const axios = require('axios');
const cheerio = require('cheerio');

async function getTopNews() {
  const rssUrl = 'https://rss.etnews.com/Section901.xml';

  try {
    const response = await axios.get(rssUrl, {
      timeout: 10000
    });

    const $ = cheerio.load(response.data, { xmlMode: true });
    const news = [];

    $('item').slice(0, 9).each((i, elem) => {
      const title = $(elem).find('title').text().trim();
      const description = $(elem).find('description').text().trim();
      const link = $(elem).find('link').text().trim();
      const pubDate = $(elem).find('pubDate').text().trim();

      // 설명에서 HTML 태그 제거하고 요약 생성
      const plainDesc = description.replace(/<[^>]*>/g, '').trim();

      news.push({
        title,
        description: plainDesc.length > 200 ? plainDesc.substring(0, 200) + '...' : plainDesc,
        link,
        pubDate
      });
    });

    return news;
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
}

getTopNews().then(news => {
  console.log(JSON.stringify(news, null, 2));
}).catch(err => {
  console.error('Error:', err);
});
