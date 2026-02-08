#!/usr/bin/env python3
"""
Chat History Viewer 서비스
채팅 로그를 저장하고 조회하는 웹 서비스

기능:
- POST /chats - 채팅 로그 저장
- GET /chats - 채팅 로그 조회
- GET /chats/{id} - 특정 채팅 상세 조회
- GET /chats/search - 채팅 로그 검색
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
from urllib.parse import urlparse, parse_qs, unquote
from typing import Dict, Any, Optional, List

# PostgreSQL 연결
try:
    import psycopg2
    from psycopg2 import sql
    from psycopg2.extras import RealDictCursor
    POSTGRESQL_AVAILABLE = True
except ImportError:
    POSTGRESQL_AVAILABLE = False
    psycopg2 = None

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
    'chats_stored': 0,
    'chats_retrieved': 0,
    'uptime_start': time.time(),
    'latency_ms': []
}

# PostgreSQL 연결 초기화
db_connection: Optional[Any] = None

def init_database():
    """데이터베이스 연결 초기화 및 테이블 생성"""
    global db_connection

    if not POSTGRESQL_AVAILABLE:
        logger.warning("PostgreSQL 라이브러리가 설치되지 않았습니다")
        return None

    try:
        # 환경 변수에서 DB 연결 정보 읽기
        db_host = os.environ.get('DB_HOST', 'postgres')
        db_port = int(os.environ.get('DB_PORT', 5432))
        db_name = os.environ.get('DB_NAME', 'ai_lounge')
        db_user = os.environ.get('DB_USER', 'postgres')
        db_password = os.environ.get('DB_PASSWORD', 'postgres')

        # 데이터베이스 연결
        db_connection = psycopg2.connect(
            host=db_host,
            port=db_port,
            database=db_name,
            user=db_user,
            password=db_password
        )
        logger.info("데이터베이스 연결 성공")

        # 테이블 생성
        create_tables()

        return db_connection
    except Exception as e:
        logger.error(f"데이터베이스 연결 실패: {e}")
        return None

def create_tables():
    """테이블 생성"""
    global db_connection

    if not db_connection:
        return

    try:
        with db_connection.cursor() as cursor:
            # 채팅 로그 테이블
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS chat_logs (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id VARCHAR(255) NOT NULL,
                    session_id VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
                    metadata JSONB,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """)

            # 인덱스 생성
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_chat_logs_user_id ON chat_logs(user_id)
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_chat_logs_session_id ON chat_logs(session_id)
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs(created_at DESC)
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_chat_logs_metadata ON chat_logs USING gin(metadata)
            """)

            db_connection.commit()
            logger.info("테이블 생성 완료")
    except Exception as e:
        logger.error(f"테이블 생성 실패: {e}")
        db_connection.rollback()

class ChatHistoryHandler(BaseHTTPRequestHandler):
    server_version = "Chat-History-Viewer/1.0"

    def log_message(self, format, *args):
        """기본 로그를 구조화된 로그로 대체"""
        logger.info(format % args)

    def send_json_response(self, status_code: int, data: Dict[str, Any]):
        """JSON 응답 전송"""
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('X-Request-ID', self.request_id)
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2, ensure_ascii=False, default=str).encode('utf-8'))

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
        status = "ok" if db_connection else "degraded"

        checks = {
            "database": db_connection is not None,
            "postgresql_available": POSTGRESQL_AVAILABLE
        }

        return {
            "status": status,
            "service": "chat-history-viewer",
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
            "service": "chat-history-viewer",
            "timestamp": datetime.utcnow().isoformat(),
            "uptime_seconds": uptime,
            "requests": {
                "total": metrics['requests_total'],
                "success": metrics['requests_success'],
                "error": metrics['requests_error']
            },
            "chats": {
                "stored": metrics['chats_stored'],
                "retrieved": metrics['chats_retrieved']
            },
            "latency": {
                "avg_ms": self.get_avg_latency(),
                "recent_count": len(metrics['latency_ms'])
            }
        }

    def do_POST(self):
        """POST 요청 처리"""
        start_time = time.time()
        self.request_id = str(uuid.uuid4())[:8]

        try:
            if self.path == '/chats':
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
                user_id = data.get('user_id')
                session_id = data.get('session_id')
                message = data.get('message')
                role = data.get('role', 'user')
                metadata = data.get('metadata', {})

                # 필수 파라미터 검증
                if not all([user_id, session_id, message]):
                    self.send_json_response(400, {
                        "error": "Missing required parameters",
                        "message": "'user_id', 'session_id', 'message' 파라미터가 필요합니다"
                    })
                    self.update_metrics(success=False)
                    return

                # 역할 검증
                if role not in ['user', 'assistant', 'system']:
                    self.send_json_response(400, {
                        "error": "Invalid role",
                        "message": "role은 'user', 'assistant', 'system' 중 하나여야 합니다"
                    })
                    self.update_metrics(success=False)
                    return

                # 데이터베이스에 저장
                if not db_connection:
                    self.send_json_response(503, {
                        "error": "Database not available",
                        "message": "데이터베이스 연결이 없습니다"
                    })
                    self.update_metrics(success=False)
                    return

                try:
                    with db_connection.cursor(cursor_factory=RealDictCursor) as cursor:
                        cursor.execute("""
                            INSERT INTO chat_logs (user_id, session_id, message, role, metadata)
                            VALUES (%s, %s, %s, %s, %s)
                            RETURNING id, created_at
                        """, (user_id, session_id, message, role, json.dumps(metadata)))

                        result = cursor.fetchone()
                        db_connection.commit()
                        metrics['chats_stored'] += 1

                        self.send_json_response(201, {
                            "success": True,
                            "id": str(result['id']),
                            "created_at": result['created_at'].isoformat()
                        })
                        self.update_metrics(success=True)
                except Exception as e:
                    logger.error(f"데이터베이스 저장 실패: {e}")
                    db_connection.rollback()
                    self.send_json_response(500, {
                        "error": "Database error",
                        "message": str(e)
                    })
                    self.update_metrics(success=False)

            else:
                self.send_json_response(404, {
                    "error": "Not found",
                    "path": self.path,
                    "available_endpoints": [
                        "POST /chats",
                        "GET /chats",
                        "GET /chats/{id}",
                        "GET /chats/search"
                    ]
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
            # /health
            if self.path == '/health':
                self.send_json_response(200, self.get_health_status())
                self.update_metrics(success=True)

            # /metrics
            elif self.path == '/metrics':
                self.send_json_response(200, self.get_metrics())
                self.update_metrics(success=True)

            # /
            elif self.path == '/':
                response = {
                    "service": "chat-history-viewer",
                    "version": "1.0.0",
                    "description": "채팅 로그 저장 및 조회 서비스",
                    "timestamp": datetime.utcnow().isoformat(),
                    "endpoints": [
                        {"path": "/chats", "method": "POST", "description": "채팅 로그 저장"},
                        {"path": "/chats", "method": "GET", "description": "채팅 로그 목록 조회"},
                        {"path": "/chats/{id}", "method": "GET", "description": "특정 채팅 상세 조회"},
                        {"path": "/chats/search", "method": "GET", "description": "채팅 로그 검색"},
                        {"path": "/health", "method": "GET", "description": "헬스 체크"},
                        {"path": "/metrics", "method": "GET", "description": "서비스 메트릭"},
                        {"path": "/info", "method": "GET", "description": "서비스 정보"}
                    ],
                    "example_request": {
                        "user_id": "user123",
                        "session_id": "session456",
                        "message": "Hello, world!",
                        "role": "user",
                        "metadata": {"source": "web"}
                    }
                }
                self.send_json_response(200, response)
                self.update_metrics(success=True)

            # /info
            elif self.path == '/info':
                response = {
                    "service": "chat-history-viewer",
                    "version": "1.0.0",
                    "description": "PostgreSQL 기반 채팅 로그 저장 및 조회 서비스",
                    "features": [
                        "채팅 로그 저장 및 조회",
                        "사용자별 채팅 내역",
                        "세션별 대화 그룹화",
                        "전문 텍스트 검색",
                        "구조화된 로깅",
                        "메트릭 수집",
                        "헬스 체크",
                        "요청 ID 추적"
                    ],
                    "database": {
                        "type": "PostgreSQL",
                        "table": "chat_logs",
                        "available": db_connection is not None
                    },
                    "environment": {
                        "python_version": "3.12",
                        "postgresql_available": POSTGRESQL_AVAILABLE,
                        "timezone": "UTC"
                    }
                }
                self.send_json_response(200, response)
                self.update_metrics(success=True)

            # /chats (채팅 로그 목록 조회)
            elif self.path == '/chats':
                if not db_connection:
                    self.send_json_response(503, {
                        "error": "Database not available",
                        "message": "데이터베이스 연결이 없습니다"
                    })
                    self.update_metrics(success=False)
                    return

                # 쿼리 파라미터 파싱
                parsed_url = urlparse(self.path)
                params = parse_qs(parsed_url.query)
                user_id = params.get('user_id', [None])[0]
                session_id = params.get('session_id', [None])[0]
                limit = int(params.get('limit', [50])[0])
                offset = int(params.get('offset', [0])[0])

                # 제한 검증
                if limit > 100:
                    limit = 100

                try:
                    with db_connection.cursor(cursor_factory=RealDictCursor) as cursor:
                        # 쿼리 구성
                        conditions = []
                        args = []

                        if user_id:
                            conditions.append("user_id = %s")
                            args.append(user_id)

                        if session_id:
                            conditions.append("session_id = %s")
                            args.append(session_id)

                        where_clause = " AND ".join(conditions) if conditions else "TRUE"

                        query = f"""
                            SELECT id, user_id, session_id, message, role,
                                   metadata, created_at
                            FROM chat_logs
                            WHERE {where_clause}
                            ORDER BY created_at DESC
                            LIMIT %s OFFSET %s
                        """
                        args.extend([limit, offset])

                        # 전체 개수 조회
                        count_query = f"SELECT COUNT(*) as total FROM chat_logs WHERE {where_clause}"
                        cursor.execute(count_query, args[:-2])
                        total = cursor.fetchone()['total']

                        # 데이터 조회
                        cursor.execute(query, args)
                        rows = cursor.fetchall()

                        # UUID 변환
                        chats = []
                        for row in rows:
                            chat = dict(row)
                            chat['id'] = str(chat['id'])
                            chats.append(chat)

                        metrics['chats_retrieved'] += len(chats)

                        self.send_json_response(200, {
                            "chats": chats,
                            "pagination": {
                                "total": total,
                                "limit": limit,
                                "offset": offset
                            }
                        })
                        self.update_metrics(success=True)

                except Exception as e:
                    logger.error(f"데이터베이스 조회 실패: {e}")
                    self.send_json_response(500, {
                        "error": "Database error",
                        "message": str(e)
                    })
                    self.update_metrics(success=False)

            # /chats/search (채팅 로그 검색)
            elif self.path.startswith('/chats/search'):
                if not db_connection:
                    self.send_json_response(503, {
                        "error": "Database not available",
                        "message": "데이터베이스 연결이 없습니다"
                    })
                    self.update_metrics(success=False)
                    return

                # 쿼리 파라미터 파싱
                parsed_url = urlparse(self.path)
                params = parse_qs(parsed_url.query)
                query = params.get('q', [''])[0]
                user_id = params.get('user_id', [None])[0]
                session_id = params.get('session_id', [None])[0]
                limit = int(params.get('limit', [50])[0])
                offset = int(params.get('offset', [0])[0])

                if not query:
                    self.send_json_response(400, {
                        "error": "Missing required parameter",
                        "message": "'q' 파라미터가 필요합니다"
                    })
                    self.update_metrics(success=False)
                    return

                # 제한 검증
                if limit > 100:
                    limit = 100

                try:
                    with db_connection.cursor(cursor_factory=RealDictCursor) as cursor:
                        # 쿼리 구성
                        conditions = ["message ILIKE %s"]
                        args = [f'%{query}%']

                        if user_id:
                            conditions.append("user_id = %s")
                            args.append(user_id)

                        if session_id:
                            conditions.append("session_id = %s")
                            args.append(session_id)

                        where_clause = " AND ".join(conditions)

                        search_query = f"""
                            SELECT id, user_id, session_id, message, role,
                                   metadata, created_at
                            FROM chat_logs
                            WHERE {where_clause}
                            ORDER BY created_at DESC
                            LIMIT %s OFFSET %s
                        """
                        args.extend([limit, offset])

                        # 전체 개수 조회
                        count_query = f"SELECT COUNT(*) as total FROM chat_logs WHERE {where_clause}"
                        cursor.execute(count_query, args[:-2])
                        total = cursor.fetchone()['total']

                        # 데이터 조회
                        cursor.execute(search_query, args)
                        rows = cursor.fetchall()

                        # UUID 변환
                        chats = []
                        for row in rows:
                            chat = dict(row)
                            chat['id'] = str(chat['id'])
                            chats.append(chat)

                        metrics['chats_retrieved'] += len(chats)

                        self.send_json_response(200, {
                            "chats": chats,
                            "query": query,
                            "pagination": {
                                "total": total,
                                "limit": limit,
                                "offset": offset
                            }
                        })
                        self.update_metrics(success=True)

                except Exception as e:
                    logger.error(f"검색 실패: {e}")
                    self.send_json_response(500, {
                        "error": "Database error",
                        "message": str(e)
                    })
                    self.update_metrics(success=False)

            # /chats/{id} (특정 채팅 상세 조회)
            elif self.path.startswith('/chats/') and len(self.path.split('/')) == 3:
                chat_id = self.path.split('/')[2]

                if not db_connection:
                    self.send_json_response(503, {
                        "error": "Database not available",
                        "message": "데이터베이스 연결이 없습니다"
                    })
                    self.update_metrics(success=False)
                    return

                try:
                    with db_connection.cursor(cursor_factory=RealDictCursor) as cursor:
                        cursor.execute("""
                            SELECT id, user_id, session_id, message, role,
                                   metadata, created_at, updated_at
                            FROM chat_logs
                            WHERE id = %s
                        """, (chat_id,))

                        row = cursor.fetchone()

                        if not row:
                            self.send_json_response(404, {
                                "error": "Not found",
                                "message": f"채팅 로그 {chat_id}를 찾을 수 없습니다"
                            })
                            self.update_metrics(success=False)
                            return

                        chat = dict(row)
                        chat['id'] = str(chat['id'])
                        metrics['chats_retrieved'] += 1

                        self.send_json_response(200, chat)
                        self.update_metrics(success=True)

                except Exception as e:
                    logger.error(f"채팅 상세 조회 실패: {e}")
                    self.send_json_response(500, {
                        "error": "Database error",
                        "message": str(e)
                    })
                    self.update_metrics(success=False)

            else:
                self.send_json_response(404, {
                    "error": "Not found",
                    "path": self.path,
                    "available_endpoints": [
                        "POST /chats",
                        "GET /chats",
                        "GET /chats/{id}",
                        "GET /chats/search"
                    ]
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

    # 데이터베이스 초기화
    init_database()

    server = HTTPServer(('0.0.0.0', port), ChatHistoryHandler)

    logger.info("=" * 60)
    logger.info("Chat History Viewer 서비스가 시작되었습니다.")
    logger.info("=" * 60)
    logger.info(f"포트: {port}")
    logger.info("사용 가능한 엔드포인트:")
    logger.info("  POST /chats          - 채팅 로그 저장")
    logger.info("  GET /chats           - 채팅 로그 목록 조회")
    logger.info("  GET /chats/{id}      - 특정 채팅 상세 조회")
    logger.info("  GET /chats/search    - 채팅 로그 검색")
    logger.info("  GET /                - 서비스 정보")
    logger.info("  GET /health          - 헬스 체크")
    logger.info("  GET /metrics         - 서비스 메트릭")
    logger.info("  GET /info            - 상세 정보")
    logger.info("=" * 60)

    server.serve_forever()

if __name__ == '__main__':
    main()
