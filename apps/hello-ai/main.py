#!/usr/bin/env python3
"""
Hello World 서비스
AI Lounge 테스트용 간단한 웹 서비스
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from datetime import datetime

class HelloHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        if self.path == '/health':
            # 헬스 체크 엔드포인트
            response = {
                "status": "ok",
                "service": "hello-ai",
                "timestamp": datetime.utcnow().isoformat()
            }
        elif self.path == '/':
            # 기본 엔드포인트
            response = {
                "message": "Hello World from AI Lounge!",
                "service": "hello-ai",
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            # 404 처리
            self.send_response(404)
            self.end_headers()
            response = {
                "error": "Not found",
                "path": self.path
            }

        self.wfile.write(json.dumps(response, indent=2).encode('utf-8'))

    def log_message(self, format, *args):
        """기본 로그 출력 비활성화 (최소화된 로그만 출력)"""
        print(f"[{datetime.utcnow().isoformat()}] {format % args}")

def main():
    port = 8080
    server = HTTPServer(('0.0.0.0', port), HelloHandler)
    print(f"Hello-ai 서비스가 포트 {port}에서 시작되었습니다.")
    print("사용 가능한 엔드포인트:")
    print("  GET /       - Hello World 메시지")
    print("  GET /health - 헬스 체크")
    server.serve_forever()

if __name__ == '__main__':
    main()

