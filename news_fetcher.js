const https = require('https');
const { XMLParser } = require('fast-xml-parser');

async function fetchRSS() {
  return new Promise((resolve, reject) => {
    https.get('https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

const parser = new XMLParser();
fetchRSS().then(rss => {
  const result = parser.parse(rss);
  const items = result.rss.channel.item.slice(0, 9);

  items.forEach((item, index) => {
    console.log(`[${index + 1}] ${item.title}`);
    console.log(`📰 ${item.source?.['$']?.source || item['media:credit'] || '출처 미상'}`);
    console.log();
  });
}).catch(console.error);
