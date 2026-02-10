#!/usr/bin/env python3
"""
Hello World 서비스
AI Lounge 테스트용 간단한 웹 서비스

개선 사항:
- 구조화된 로깅
- 메트릭 엔드포인트
- 개선된 헬스체크
- 요청 ID 추적
- 에러 핸들링 강화
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from datetime import datetime
import uuid
import logging
import traceback
import os
import time

# 구조화된 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# 메트릭 수집
metrics = {
    'requests_total': 0,
    'requests_success': 0,
    'requests_error': 0,
    'uptime_start': time.time(),
    'latency_ms': []
}

class HelloHandler(BaseHTTPRequestHandler):
    server_version = "Hello-AI/1.0"

    def log_message(self, format, *args):
        """기본 로그를 구조화된 로그로 대체"""
        logger.info(format % args)

    def send_json_response(self, status_code, data):
        """JSON 응답 전송"""
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('X-Request-ID', self.request_id)
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2, ensure_ascii=False).encode('utf-8'))

    def update_metrics(self, success=True, latency_ms=None):
        """메트릭 업데이트"""
        metrics['requests_total'] += 1
        if success:
            metrics['requests_success'] += 1
        else:
            metrics['requests_error'] += 1

        if latency_ms:
            metrics['latency_ms'].append(latency_ms)
            # 최근 100개만 유지
            if len(metrics['latency_ms']) > 100:
                metrics['latency_ms'] = metrics['latency_ms'][-100:]

    def get_uptime(self):
        """업타임 계산"""
        return time.time() - metrics['uptime_start']

    def get_avg_latency(self):
        """평균 지연시간 계산"""
        if not metrics['latency_ms']:
            return 0
        return sum(metrics['latency_ms']) / len(metrics['latency_ms'])

    def get_health_status(self):
        """서비스 상태 확인"""
        uptime = self.get_uptime()
        return {
            "status": "ok",
            "service": "hello-ai",
            "version": "1.0.0",
            "timestamp": datetime.utcnow().isoformat(),
            "uptime_seconds": uptime,
            "uptime_formatted": f"{uptime:.2f}s"
        }

    def get_metrics(self):
        """메트릭 정보 반환"""
        uptime = self.get_uptime()
        return {
            "service": "hello-ai",
            "timestamp": datetime.utcnow().isoformat(),
            "uptime_seconds": uptime,
            "requests": {
                "total": metrics['requests_total'],
                "success": metrics['requests_success'],
                "error": metrics['requests_error']
            },
            "latency": {
                "avg_ms": self.get_avg_latency(),
                "recent_count": len(metrics['latency_ms'])
            }
        }

    def do_GET(self):
        """GET 요청 처리"""
        start_time = time.time()
        self.request_id = str(uuid.uuid4())[:8]

        try:
            if self.path == '/api/health':
                # API 헬스 체크 엔드포인트
                self.send_json_response(200, self.get_health_status())
                self.update_metrics(success=True)

            elif self.path == '/health':
                # 헬스 체크 엔드포인트
                self.send_json_response(200, self.get_health_status())
                self.update_metrics(success=True)

            elif self.path == '/metrics':
                # 메트릭 엔드포인트
                self.send_json_response(200, self.get_metrics())
                self.update_metrics(success=True)

            elif self.path == '/':
                # 기본 엔드포인트
                response = {
                    "message": "Hello World from AI Lounge!",
                    "service": "hello-ai",
                    "version": "1.0.0",
                    "timestamp": datetime.utcnow().isoformat(),
                    "endpoints": [
                        {"path": "/", "method": "GET", "description": "Hello World 메시지"},
                        {"path": "/health", "method": "GET", "description": "헬스 체크"},
                        {"path": "/metrics", "method": "GET", "description": "서비스 메트릭"},
                        {"path": "/info", "method": "GET", "description": "서비스 정보"}
                    ]
                }
                self.send_json_response(200, response)
                self.update_metrics(success=True)

            elif self.path == '/info':
                # 서비스 정보 엔드포인트
                response = {
                    "service": "hello-ai",
                    "version": "1.0.0",
                    "description": "AI Lounge 테스트용 웹 서비스",
                    "features": [
                        "구조화된 로깅",
                        "메트릭 수집",
                        "헬스 체크",
                        "요청 ID 추적"
                    ],
                    "environment": {
                        "python_version": "3.12",
                        "timezone": "UTC"
                    }
                }
                self.send_json_response(200, response)
                self.update_metrics(success=True)

            else:
                # 404 처리
                response = {
                    "error": "Not found",
                    "path": self.path,
                    "available_endpoints": ["/", "/health", "/metrics", "/info"]
                }
                self.send_json_response(404, response)
                self.update_metrics(success=False)

        except Exception as e:
            # 에러 핸들링
            logger.error(f"Error handling request: {str(e)}")
            logger.error(traceback.format_exc())

            response = {
                "error": "Internal Server Error",
                "message": str(e),
                "request_id": self.request_id
            }
            self.send_json_response(500, response)
            self.update_metrics(success=False)

        finally:
            # 지연시간 계산
            latency_ms = (time.time() - start_time) * 1000
            logger.info(f"Request {self.request_id}: {self.path} - {latency_ms:.2f}ms")

def main():
    port = int(os.environ.get('PORT', 8080))
    server = HTTPServer(('0.0.0.0', port), HelloHandler)

    logger.info("=" * 60)
    logger.info("Hello-ai 서비스가 시작되었습니다.")
    logger.info("=" * 60)
    logger.info(f"포트: {port}")
    logger.info("사용 가능한 엔드포인트:")
    logger.info("  GET /        - Hello World 메시지")
    logger.info("  GET /health  - 헬스 체크")
    logger.info("  GET /metrics - 서비스 메트릭")
    logger.info("  GET /info    - 서비스 정보")
    logger.info("=" * 60)

    server.serve_forever()

if __name__ == '__main__':
    main()
