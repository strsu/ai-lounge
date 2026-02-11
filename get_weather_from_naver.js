#!/usr/bin/env node

/**
 * 네이버에서 서울 날씨 정보를 가져와서 Slack으로 전송
 * OpenClaw Browser API 사용
 */

const https = require('https');
const http = require('http');

// OpenClaw Gateway 설정
const GATEWAY_URL = 'http://localhost:8080';

// Slack 채널 설정 (주인장이 원하는 채널)
const SLACK_CHANNEL = 'c08arssh4ue'; // 현재 설정된 채널

/**
 * HTTP 요청 헬퍼
 */
function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

/**
 * 브라우저 조작 API 호출
 */
async function browserAction(action, params = {}) {
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: `/api/browser?action=${action}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params)
  };

  const result = await httpRequest(`http://localhost:8080/api/browser?action=${action}`, options);
  if (result.statusCode !== 200) {
    throw new Error(`Browser action failed: ${result.data}`);
  }
  return result.data;
}

/**
 * 메시지 전송 API 호출
 */
async function sendMessage(channel, text) {
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: `/api/message?action=send&channel=${channel}&message=${encodeURIComponent(text)}`,
    method: 'GET'
  };

  const result = await httpRequest(`http://localhost:8080/api/message?action=send&channel=${channel}&message=${encodeURIComponent(text)}`, options);
  return result.data;
}

/**
 * HTML에서 날씨 정보 추출
 */
function parseWeatherFromHTML(html) {
  try {
    // 간단한 파싱 - 정규식 사용
    const tempMatch = html.match(/-?\d+\.?\d*°/);
    const statusMatch = html.match(/(맑음|흐림|구름많음|비|눈|비\/눈)/);

    if (!tempMatch) {
      return null;
    }

    return {
      temperature: tempMatch[0],
      status: statusMatch ? statusMatch[1] : '알 수 없음'
    };
  } catch (error) {
    console.error('HTML 파싱 오류:', error);
    return null;
  }
}

/**
 * 메인 함수
 */
async function main() {
  console.log('날씨 정보 수집 시작...');

  try {
    // 1. 브라우저 시작
    console.log('1. 브라우저 시작...');
    await browserAction('start', { profile: 'openclaw' });

    // 2. 네이버 날씨 페이지로 이동
    console.log('2. 네이버 날씨 페이지로 이동...');
    const openResult = await browserAction('open', {
      profile: 'openclaw',
      targetUrl: 'https://search.naver.com/search.naver?query=서울날씨'
    });
    const targetId = openResult.targetId;
    console.log('  탭 ID:', targetId);

    // 3. 잠시 대기
    console.log('3. 페이지 로딩 대기...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 4. 스냅샷으로 날씨 정보 확인
    console.log('4. 페이지 스냅샷 생성...');
    const snapshot = await browserAction('snapshot', {
      profile: 'openclaw',
      targetId: targetId,
      refs: 'aria'
    });

    // 5. 날씨 정보 추출
    console.log('5. 날씨 정보 추출...');
    const weatherText = JSON.stringify(snapshot);
    const weather = parseWeatherFromHTML(weatherText);

    if (weather) {
      const message = `🌤️ 오늘 서울 날씨\n\n🌡️ 기온: ${weather.temperature}\n☁️ 상태: ${weather.status}`;
      console.log('메시지:', message);

      // 6. Slack으로 전송
      console.log('6. Slack으로 전송...');
      await sendMessage(SLACK_CHANNEL, message);
      console.log('✅ 날씨 정보 전송 완료!');
    } else {
      throw new Error('날씨 정보를 찾을 수 없습니다');
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    const errorMessage = `날씨 정보 가져오기 실패: ${error.message}`;
    await sendMessage(SLACK_CHANNEL, errorMessage);
    process.exit(1);
  }
}

// 실행
main();
