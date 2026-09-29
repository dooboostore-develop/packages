"""@fetch 테스트용 더미 서버. GET /api/post/1, GET /api/slow?n=, POST /api/posts, POST /api/echo"""
import json
import time
from urllib.parse import urlparse, parse_qs
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


class H(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        req_headers = self.headers.get('Access-Control-Request-Headers')
        self.send_header('Access-Control-Allow-Headers', req_headers or 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        url = urlparse(self.path)
        if url.path == '/api/slow':
            # abort 테스트용 지연 응답 (동시 요청이 서로 막히지 않게 서버는 ThreadingHTTPServer)
            time.sleep(0.8)
            body = json.dumps({'n': parse_qs(url.query).get('n', [None])[0]}).encode()
            try:
                self.send_response(200)
                self._cors()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(body)
            except (BrokenPipeError, ConnectionResetError):
                pass  # 클라이언트가 abort 해서 끊긴 경우
        elif self.path == '/api/post/1':
            body = json.dumps({'id': 1, 'title': 'dummy-post', 'userId': 7}).encode()
            self.send_response(200)
            self._cors()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(404)
            self._cors()
            self.end_headers()

    def do_POST(self):
        n = int(self.headers.get('Content-Length', 0))
        raw = self.rfile.read(n)
        if self.path == '/api/echo':
            body = json.dumps({
                'contentType': self.headers.get('Content-Type'),
                'body': raw.decode('utf-8', 'replace')[:200],
            }).encode()
            self.send_response(200)
            self._cors()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(body)
        elif self.path == '/api/posts':
            data = json.loads(raw or b'{}')
            data['id'] = 101
            body = json.dumps(data).encode()
            self.send_response(201)
            self._cors()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(404)
            self._cors()
            self.end_headers()

    # /api/method: 받은 메서드와 body 를 그대로 돌려준다 (fetchPut/Patch/Delete 별칭 확인용)
    def _echo_method(self):
        n = int(self.headers.get('Content-Length', 0))
        raw = self.rfile.read(n) if n else b''
        body = json.dumps({'method': self.command, 'body': raw.decode('utf-8', 'replace')}).encode()
        self.send_response(200)
        self._cors()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(body)

    def do_PUT(self):
        self._echo_method()

    def do_PATCH(self):
        self._echo_method()

    def do_DELETE(self):
        self._echo_method()

    def log_message(self, *a):
        pass


if __name__ == '__main__':
    ThreadingHTTPServer(('127.0.0.1', 8101), H).serve_forever()
