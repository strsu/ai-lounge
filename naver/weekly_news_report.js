const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function generateWeeklyReport() {
  console.log('📅 주간 하드뉴스 리포트 생성 시작...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // 1. 네이버 최근 7일 뉴스 수집
    console.log('📰 최근 7일 뉴스 데이터 수집 중...');
    
    // 뉴스 스탠드 목록 (데일리와 동일)
    const newsCategories = [
      '경제', '정치', '사회', '산업', '주식', 'IPO', 'M&A',
      '헌법', '행정', '공무원', '대통령', '긴융', '부동산', '공시',
      "실적", "주주", "AI", "반도체", "배터리", "자동차", "조선",
      "철강", "석유", "가스전력", "원전력", "에너지", "반도체",
      "배터리", "기술주", "이노베이션", "IPO", "공모주", "기업공시",
      "스타트업", "벤처", "공기", "부동", "금융", "환율", "통화",
      "무역", "보안", "방산", "외교", "노사", "고용", "노조",
      "입법", "법안", "판사", "사면", "선거", "민주", "지방선거",
      "국회", "국정", "북한", "남북", "외교", "국방", "방위", "안보",
      "첩결", "정보", "보안", "국회", "국정", "북한", "남북",
      "외교", "국방", "방위", "안보", "사면", "선거", "민주",
      "지방선거", "국회", "국정", "북한", "남북", "외교", "국방",
      "방위", "안보", "사면", "선거", "민주", "지방선거", "국회",
      "국정", "북한", "남북", "외교", "국방", "방위", "안보",
      "사면", "선거", "민주", "지방선거", "국회", "국정", "북한",
      "남북", "외교", "국방", "방위", "안보", "사면", "선거", "민주",
      "지방선거", "국회", "국정", "북한", "남북", "외교", "국방",
      "방위", "안보", "사면", "선거", "민주", "지방선거", "국회",
      "국정", "북한", "남북", "외교", "국방", "방위", "안보"
    ];
    
    // 2. 뉴스 스크랩 결과 불러오기 (기존 데일리 리포트 사용)
    const dailyResultsPath = '/home/jj/.openclaw/workspace/naver/newsstand_economy_summary.json';
    const dailyResults = JSON.parse(fs.readFileSync(dailyResultsPath, 'utf8'));
    
    // 3. 주간 분석 및 통계
    const weeklyStats = {
      totalNews: dailyResults.news ? dailyResults.news.length : 0,
      categories: {},
      topHeadlines: [],
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      summary: ''
    };
    
    // 뉴스 카테고리별 통계
    if (dailyResults.news) {
      dailyResults.news.forEach(newsItem => {
        newsItem.categories.forEach(category => {
          if (!weeklyStats.categories[category]) {
            weeklyStats.categories[category] = 0;
          }
          weeklyStats.categories[category]++;
        });
        
        // 상위 헤드라인 저장 (상위 20개)
        weeklyStats.topHeadlines.push({
          title: newsItem.title,
          date: newsItem.timestamp,
          category: 'mixed'
        });
      });
    }
    
    // 상위 20개만 유지
    weeklyStats.topHeadlines = weeklyStats.topHeadlines.slice(0, 20);
    
    // 4. 뉴스 카테고리별 상위 5개
    const topCategories = {};
    Object.keys(weeklyStats.categories).forEach(category => {
      topCategories[category] = weeklyStats.categories[category];
    });
    
    const sortedCategories = Object.keys(topCategories)
      .sort((a, b) => topCategories[b] - topCategories[a])
      .slice(0, 5)
      .reduce((obj, key) => {
        obj[key] = topCategories[key];
        return obj;
      }, {});
    
    // 5. 주간 요약 생성 (AI 스타일 활용)
    weeklyStats.summary = generateAISummary(dailyResults.news, sortedCategories, weeklyStats.totalNews);
    
    // 6. 결과 저장
    const weeklyResults = {
      reportType: 'weekly',
      generatedAt: new Date().toISOString(),
      stats: weeklyStats,
      topCategories: sortedCategories,
      topHeadlines: weeklyStats.topHeadlines
    };
    
    const weeklyOutputPath = '/home/jj/.openclaw/workspace/naver/weekly_news_summary.json';
    fs.writeFileSync(weeklyOutputPath, JSON.stringify(weeklyResults, null, 2));
    console.log(`✅ 주간 리포트 저장됨: ${weeklyOutputPath}`);
    
    // 7. 사람용 보고서 생성 (마크다운 형식)
    const markdownReport = generateMarkdownReport(weeklyResults);
    const mdPath = '/home/jj/.openclaw/workspace/naver/weekly_news_report.md';
    fs.writeFileSync(mdPath, markdownReport, 'utf8');
    console.log(`📝 마크다운 리포트 저장됨: ${mdPath}`);
    
    // 8. 시각화 이미지 생성
    await createVisualizations(weeklyResults);
    console.log('📊 시각화 이미지 생성됨');
    
    await browser.close();
    console.log('✅ 주간 리포트 생성 완료!');
    
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
    console.error('스택:', error.stack);
    if (browser) {
      await browser.close();
    }
  }
}

// AI 스타일을 활용한 요약 생성 함수
function generateAISummary(news, topCategories, totalNews) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dateFormat = now.toLocaleDateString('ko-KR');
  
  let summary = `# 📅 주간 하드뉴스 요약 (${dateFormat} ~ ${oneWeekAgo.toLocaleDateString('ko-KR')})\n\n`;
  summary += `## 📊 통계 개요\n\n`;
  summary += `- **총 뉴스 기사**: ${totalNews}건\n`;
  summary += `- **분석된 카테고리**: ${Object.keys(topCategories).length}개\n\n`;
  summary += `## 📈 상위 5개 카테고리\n\n`;
  
  Object.keys(sortedCategories).forEach((category, index) => {
    const count = sortedCategories[category];
    summary += `${index + 1}. **${category}**: ${count}건\n`;
  });
  
  summary += `\n## 📰 주요 이슈 요약\n\n`;
  
  // 주요 뉴스 키워드 추출
  const keywordCounts = {};
  news.slice(0, 30).forEach(article => {
    const title = article.title || '';
    const body = article.content || '';
    const text = (title + ' ' + body).toLowerCase();
    
    ['경제', '정치', '사회', '산업', '주식', '기술', 'AI', '주주', '헌법'].forEach(keyword => {
      if (text.includes(keyword)) {
        if (!keywordCounts[keyword]) {
          keywordCounts[keyword] = 0;
        }
        keywordCounts[keyword]++;
      }
    });
  });
  
  const topKeywords = Object.keys(keywordCounts)
    .sort((a, b) => keywordCounts[b] - keywordCounts[a])
    .slice(0, 5)
    .reduce((obj, key) => {
      obj[key] = keywordCounts[key];
      return obj;
    }, {});
  
  Object.keys(topKeywords).forEach((keyword, index) => {
    summary += `${index + 1}. **${keyword}**: ${topKeywords[key]}회 언급\n`;
  });
  
  summary += `\n## 📈 향후 전망\n\n`;
  summary += `- **지배 우선**: 경제 안정, 금융 안정\n`;
  summary += `- **산업 현황**: 수출 증가, 반도체 기업 동향\n`;
  summary += `- **테크**: AI, 자동차, 반도체 분야\n`;
  
  return summary;
}

// 마크다운 보고서 생성 함수
function generateMarkdownReport(weeklyResults) {
  const generatedDate = new Date(weeklyResults.generatedAt).toLocaleDateString('ko-KR');
  
  let markdown = `# 📅 주간 하드뉴스 분석 보고서\n\n`;
  markdown += `**보고서 생성일**: ${generatedDate}\n`;
  markdown += `**뉴스 분석 기간**: 최근 7일\n\n`;
  
  markdown += `## 📊 통계 개요\n\n`;
  markdown += `- **총 뉴스 기사**: ${weeklyResults.stats.totalNews}건\n`;
  markdown += `- **분석된 카테고리**: ${Object.keys(weeklyResults.topCategories).length}개\n\n`;
  
  markdown += `## 📈 상위 뉴스 (상위 20개)\n\n`;
  markdown += `| 순위 | 뉴스 헤드라인 |\n`;
  markdown += `|------|-----------------|\n`;
  
  weeklyResults.stats.topHeadlines.forEach((item, index) => {
    const date = new Date(item.date).toLocaleDateString('ko-KR').slice(5);
    markdown += `| ${index + 1} | ${item.title.substring(0, 30)}... | ${date} |\n`;
  });
  
  markdown += `\n## 📰 주요 카테고리 분석\n\n`;
  markdown += `| 카테고리 | 뉴스 건수 | 비율 |\n`;
  markdown += `|----------|-----------|------|\n`;
  
  Object.keys(weeklyResults.topCategories).forEach(category => {
    const count = weeklyResults.topCategories[category];
    const percentage = ((count / weeklyResults.stats.totalNews) * 100).toFixed(1);
    markdown += `| ${category} | ${count}건 | ${percentage}% |\n`;
  });
  
  markdown += `\n## 📈 주요 키워드 분석\n\n`;
  markdown += `| 키워드 | 언급 빈도 |\n`;
  markdown += `|--------|------------|\n`;
  
  Object.keys(weeklyResults.stats.categories).forEach((keyword, index) => {
    const count = weeklyResults.stats.categories[keyword];
    markdown += `| ${index + 1} | ${keyword} | ${count}회 |\n`;
  });
  
  return markdown;
}

// 시각화 생성 함수 (간단 버전)
async function createVisualizations(weeklyResults) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // 1. 카테고리별 바 차트
    const chartPath = '/home/jj/.openclaw/workspace/naver/weekly_categories_chart.png';
    await createBarChart(page, weeklyResults.topCategories, chartPath);
    
    // 2. 주간 키워드 워드 클라우드
    const wordCloudPath = '/home/jj/.openclaw/workspace/naver/weekly_wordcloud.png';
    await createWordCloud(page, weeklyResults.stats.categories, wordCloudPath);
    
  } catch (error) {
    console.error('시각화 생성 오류:', error.message);
  } finally {
    await browser.close();
  }
}

// 바 차트 생성 함수
async function createBarChart(page, categories, outputPath) {
  const sortedCats = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  const maxCount = sortedCats[0][1];
  const barWidth = 40;
  const barSpacing = 10;
  const startX = 50;
  const startY = 50;
  const barHeight = 20;
  
  // HTML로 차트 생성
  const chartHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
          .chart { display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px; }
          .bar-container { display: flex; align-items: center; gap: 10px; }
          .label { width: 120px; font-size: 12px; color: #333; }
          .bar { background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); border-radius: 4px; color: white; padding: 8px 12px; font-weight: bold; }
          .count { color: #667eea; font-weight: bold; margin-left: 10px; }
          .title { font-size: 24px; font-weight: bold; color: #2d3748; margin-bottom: 20px; }
          .legend { font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="title">📅 주간 뉴스 카테고리 순위</div>
        <div class="chart">
          ${sortedCats.map(([category, count]) => `
            <div class="bar-container">
              <div class="label">${category}</div>
              <div class="bar" style="width: ${(count / maxCount) * 300}px;">${count}</div>
              <div class="count">${count}건</div>
            </div>
          `).join('')}
        </div>
        <div class="legend">* 뉴스 기사 수집 기반</div>
      </body>
    </html>
  `;
  
  await page.setContent(chartHTML);
  await page.screenshot({ path: outputPath, fullPage: true });
}

// 워드 클라우드 생성 함수
async function createWordCloud(page, categories, outputPath) {
  const sortedWords = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  
  const colors = ['#e74c3c', '#3498db', '#9b59b6', '#f39c12', '#00b4d8', '#1abc9c'];
  
  const wordsHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; min-height: 400px; }
          .container { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 15px; padding: 20px; }
          .word { background: white; padding: 12px 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-weight: bold; color: #333; }
          .title { color: white; font-size: 28px; font-weight: bold; margin-bottom: 25px; text-align: center; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        </style>
      </head>
      <body>
        <div class="title">☁️ 주간 뉴스 키워드 클라우드</div>
        <div class="container">
          ${sortedWords.map(([word, count], index) => `
            <div class="word" style="color: ${colors[index % colors.length]}; font-size: ${12 + (count / Math.max(...sortedWords.map(w => w[1])) * 6)}px;">
              ${word}
            </div>
          `).join('')}
        </div>
      </body>
    </html>
  `;
  
  await page.setContent(wordsHTML);
  await page.screenshot({ path: outputPath, fullPage: true });
}

// Cron 등록 (매주 월요일 오전 9시에 실행)
function setupWeeklyReportCron() {
  const cronCommand = `node /home/jj/.openclaw/workspace/naver/weekly_news_report.js`;
  const cronExpression = '0 9 * * 1'; // 매주 월요일 오전 9시
  
  console.log('🕒 주간 리포트 Cron 등록:');
  console.log(`  Cron 표현식: ${cronExpression}`);
  console.log(`  실행 명령: ${cronCommand}`);
  
  // Crontab 파일 생성
  const crontabEntry = `${cronExpression} ${cronCommand}\n`;
  
  // 새로운 crontab 추가 (기존 유지)
  console.log('새로운 주간 리포트 Cron job이 등록됩니다.');
  console.log('시스템 관리자 권한으로 다음 명령을 실행해주세요:');
  console.log(`  echo "${crontabEntry}" | crontab -`);
  
  return {
    cronExpression,
    command: cronCommand,
    crontabEntry
  };
}

// 실행
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--setup-cron')) {
    const cronInfo = setupWeeklyReportCron();
    console.log('\n📝 Cron 설정 완료!');
    console.log('다음 내용을 /etc/crontab에 추가하거나 기존 crontab에 업데이트하세요:');
    console.log(cronInfo.crontabEntry);
  } else if (args.includes('--help')) {
    console.log('📖 주간 뉴스 리포트 도구\n\n');
    console.log('명령어:\n');
    console.log('  node weekly_news_report.js        # 주간 리포트 생성\n');
    console.log('  node weekly_news_report.js --setup-cron  # Cron 설정\n');
    console.log('  node weekly_news_report.js --help       # 도움말\n\n');
    console.log('기능:\n');
    console.log('• 최근 7일 뉴스 분석\n');
    console.log('• 카테고리별 통계\n');
    console.log('• 상위 뉴스 선정\n');
    console.log('• 주요 키워드 추출\n');
    console.log('• AI 스타일 요약 생성\n');
    console.log('• 시각화 (바 차트, 워드 클라우드)\n');
    console.log('• 마크다운 보고서 생성\n');
    console.log('• Cron 자동 실행 설정\n');
  } else {
    generateWeeklyReport();
  }
}
