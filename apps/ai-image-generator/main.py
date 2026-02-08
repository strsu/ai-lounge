#!/usr/bin/env python3
"""
AI Image Generator 서비스
DALL-E API를 사용하여 이미지를 생성하는 웹 서비스

기능:
- POST /generate - 이미지 생성 요청
- GET /health - 헬스 체크
- GET /metrics - 서비스 메트릭
- GET /info - 서비스 정보
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from datetime import datetime
import uuid
import logging
import traceback
import os
import time
import base64
import io
from urllib.parse import urlparse, parse_qs
from typing import Dict, Any, Optional

# OpenAI API
try:
    import openai
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    OpenAI = None

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
    'images_generated': 0,
    'uptime_start': time.time(),
    'latency_ms': []
}

# OpenAI 클라이언트 초기화
openai_client: Optional[OpenAI] = None
if OPENAI_AVAILABLE and os.environ.get('OPENAI_API_KEY'):
    try:
        openai_client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
        logger.info("OpenAI 클라이언트 초기화 완료")
    except Exception as e:
        logger.error(f"OpenAI 클라이언트 초기화 실패: {e}")

class ImageGeneratorHandler(BaseHTTPRequestHandler):
    server_version = "AI-Image-Generator/1.0"

    def log_message(self, format, *args):
        """기본 로그를 구조화된 로그로 대체"""
        logger.info(format % args)

    def send_json_response(self, status_code: int, data: Dict[str, Any]):
        """JSON 응답 전송"""
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('X-Request-ID', self.request_id)
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2, ensure_ascii=False).encode('utf-8'))

    def update_metrics(self, success: bool = True, latency_ms: Optional[float] = None):
        """메트릭 업데이트"""
        metrics['requests_total'] += 1
        if success:
            metrics['requests_success'] += 1
        else:
            metrics['requests_error'] += 1

        if latency_ms:
            metrics['latency_ms'].append(latency_ms)
            if len(metrics['latency_ms']) > 100:
                metrics['latency_ms'] = metrics['latency_ms'][-100:]

    def get_uptime(self) -> float:
        """업타임 계산"""
        return time.time() - metrics['uptime_start']

    def get_avg_latency(self) -> float:
        """평균 지연시간 계산"""
        if not metrics['latency_ms']:
            return 0
        return sum(metrics['latency_ms']) / len(metrics['latency_ms'])

    def get_health_status(self) -> Dict[str, Any]:
        """서비스 상태 확인"""
        uptime = self.get_uptime()
        status = "ok" if openai_client else "degraded"

        checks = {
            "openai_api": openai_client is not None,
            "api_key_configured": bool(os.environ.get('OPENAI_API_KEY'))
        }

        return {
            "status": status,
            "service": "ai-image-generator",
            "version": "1.0.0",
            "timestamp": datetime.utcnow().isoformat(),
            "uptime_seconds": uptime,
            "uptime_formatted": f"{uptime:.2f}s",
            "checks": checks
        }

    def get_metrics(self) -> Dict[str, Any]:
        """메트릭 정보 반환"""
        uptime = self.get_uptime()
        return {
            "service": "ai-image-generator",
            "timestamp": datetime.utcnow().isoformat(),
            "uptime_seconds": uptime,
            "requests": {
                "total": metrics['requests_total'],
                "success": metrics['requests_success'],
                "error": metrics['requests_error']
            },
            "images": {
                "generated": metrics['images_generated']
            },
            "latency": {
                "avg_ms": self.get_avg_latency(),
                "recent_count": len(metrics['latency_ms'])
            }
        }

    def generate_image(self, prompt: str, size: str = "1024x1024") -> Dict[str, Any]:
        """이미지 생성"""
        if not openai_client:
            raise RuntimeError("OpenAI 클라이언트가 초기화되지 않았습니다")

        try:
            # DALL-E API 호출
            response = openai_client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size=size,
                n=1,
                response_format="b64_json"
            )

            image_data = response.data[0].b64_json
            revised_prompt = response.data[0].revised_prompt

            metrics['images_generated'] += 1

            return {
                "success": True,
                "image_b64": image_data,
                "revised_prompt": revised_prompt,
                "size": size,
                "model": "dall-e-3"
            }
        except Exception as e:
            logger.error(f"이미지 생성 실패: {str(e)}")
            raise

    def do_POST(self):
        """POST 요청 처리"""
        start_time = time.time()
        self.request_id = str(uuid.uuid4())[:8]

        try:
            if self.path == '/generate':
                # 요청 본문 읽기
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)

                try:
                    data = json.loads(post_data.decode('utf-8'))
                except json.JSONDecodeError:
                    self.send_json_response(400, {
                        "error": "Invalid JSON",
                        "message": "요청 본문이 올바른 JSON 형식이 아닙니다"
                    })
                    self.update_metrics(success=False)
                    return

                # 파라미터 추출
                prompt = data.get('prompt')
                size = data.get('size', '1024x1024')

                if not prompt:
                    self.send_json_response(400, {
                        "error": "Missing required parameter",
                        "message": "'prompt' 파라미터가 필요합니다"
                    })
                    self.update_metrics(success=False)
                    return

                # 크기 검증
                valid_sizes = ["1024x1024", "1792x1024", "1024x1792"]
                if size not in valid_sizes:
                    self.send_json_response(400, {
                        "error": "Invalid size",
                        "message": f"size는 {valid_sizes} 중 하나여야 합니다"
                    })
                    self.update_metrics(success=False)
                    return

                # 이미지 생성
                try:
                    result = self.generate_image(prompt, size)
                    self.send_json_response(200, result)
                    self.update_metrics(success=True)
                except Exception as e:
                    self.send_json_response(500, {
                        "error": "Image generation failed",
                        "message": str(e)
                    })
                    self.update_metrics(success=False)

            else:
                # 404 처리
                self.send_json_response(404, {
                    "error": "Not found",
                    "path": self.path,
                    "available_endpoints": ["POST /generate", "GET /", "GET /health", "GET /metrics", "GET /info"]
                })
                self.update_metrics(success=False)

        except Exception as e:
            logger.error(f"Error handling POST request: {str(e)}")
            logger.error(traceback.format_exc())

            self.send_json_response(500, {
                "error": "Internal Server Error",
                "message": str(e),
                "request_id": self.request_id
            })
            self.update_metrics(success=False)

        finally:
            latency_ms = (time.time() - start_time) * 1000
            logger.info(f"Request {self.request_id}: {self.path} - {latency_ms:.2f}ms")

    def do_GET(self):
        """GET 요청 처리"""
        start_time = time.time()
        self.request_id = str(uuid.uuid4())[:8]

        try:
            if self.path == '/health':
                self.send_json_response(200, self.get_health_status())
                self.update_metrics(success=True)

            elif self.path == '/metrics':
                self.send_json_response(200, self.get_metrics())
                self.update_metrics(success=True)

            elif self.path == '/':
                response = {
                    "service": "ai-image-generator",
                    "version": "1.0.0",
                    "description": "AI 이미지 생성 서비스",
                    "timestamp": datetime.utcnow().isoformat(),
                    "endpoints": [
                        {"path": "/generate", "method": "POST", "description": "이미지 생성"},
                        {"path": "/health", "method": "GET", "description": "헬스 체크"},
                        {"path": "/metrics", "method": "GET", "description": "서비스 메트릭"},
                        {"path": "/info", "method": "GET", "description": "서비스 정보"}
                    ],
                    "example_request": {
                        "prompt": "A beautiful sunset over the ocean",
                        "size": "1024x1024"
                    }
                }
                self.send_json_response(200, response)
                self.update_metrics(success=True)

            elif self.path == '/info':
                response = {
                    "service": "ai-image-generator",
                    "version": "1.0.0",
                    "description": "DALL-E API를 사용한 AI 이미지 생성 서비스",
                    "features": [
                        "DALL-E 3 모델 지원",
                        "구조화된 로깅",
                        "메트릭 수집",
                        "헬스 체크",
                        "요청 ID 추적"
                    ],
                    "supported_sizes": ["1024x1024", "1792x1024", "1024x1792"],
                    "environment": {
                        "python_version": "3.12",
                        "openai_available": OPENAI_AVAILABLE,
                        "timezone": "UTC"
                    }
                }
                self.send_json_response(200, response)
                self.update_metrics(success=True)

            else:
                self.send_json_response(404, {
                    "error": "Not found",
                    "path": self.path,
                    "available_endpoints": ["POST /generate", "GET /", "GET /health", "GET /metrics", "GET /info"]
                })
                self.update_metrics(success=False)

        except Exception as e:
            logger.error(f"Error handling GET request: {str(e)}")
            logger.error(traceback.format_exc())

            self.send_json_response(500, {
                "error": "Internal Server Error",
                "message": str(e),
                "request_id": self.request_id
            })
            self.update_metrics(success=False)

        finally:
            latency_ms = (time.time() - start_time) * 1000
            logger.info(f"Request {self.request_id}: {self.path} - {latency_ms:.2f}ms")

def main():
    port = int(os.environ.get('PORT', 8080))

    if not openai_client:
        logger.warning("=" * 60)
        logger.warning("경고: OpenAI API가 구성되지 않았습니다")
        logger.warning("OPENAI_API_KEY 환경 변수를 설정하세요")
        logger.warning("=" * 60)

    server = HTTPServer(('0.0.0.0', port), ImageGeneratorHandler)

    logger.info("=" * 60)
    logger.info("AI Image Generator 서비스가 시작되었습니다.")
    logger.info("=" * 60)
    logger.info(f"포트: {port}")
    logger.info("사용 가능한 엔드포인트:")
    logger.info("  POST /generate - 이미지 생성")
    logger.info("  GET /         - 서비스 정보")
    logger.info("  GET /health   - 헬스 체크")
    logger.info("  GET /metrics  - 서비스 메트릭")
    logger.info("  GET /info     - 상세 정보")
    logger.info("=" * 60)

    server.serve_forever()

if __name__ == '__main__':
    main()
