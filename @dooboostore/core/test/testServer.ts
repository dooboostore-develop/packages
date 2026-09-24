import * as http from 'node:http';
import type { AddressInfo } from 'node:net';

export type RecordedRequest = {
  method?: string;
  url?: string;
  headers: http.IncomingHttpHeaders;
};

export type TestServer = {
  url: string;
  requests: RecordedRequest[];
  close: () => Promise<void>;
};

/**
 * 실제 로컬 HTTP 서버 하나. 라우트:
 * - GET/POST/... /echo       -> 200 { ok: true }, 요청 기록
 * - GET         /fail        -> 500 { error: 'boom' }
 * - GET         /slow?ms=N   -> N ms 대기 후 200 (기본 1000ms)
 * - 그 외                     -> 404
 */
export const startTestServer = (): Promise<TestServer> => {
  const requests: RecordedRequest[] = [];

  const server = http.createServer((req, res) => {
    requests.push({ method: req.method, url: req.url, headers: req.headers });
    const url = new URL(req.url ?? '/', 'http://localhost');

    if (url.pathname === '/fail') {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'boom' }));
      return;
    }

    if (url.pathname === '/slow') {
      const ms = Number(url.searchParams.get('ms') ?? 1000);
      const timer = setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, slept: ms }));
      }, ms);
      req.on('aborted', () => clearTimeout(timer));
      return;
    }

    if (url.pathname === '/echo') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found' }));
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo;
      resolve({
        url: `http://127.0.0.1:${port}`,
        requests,
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
};

/** 지정 시간 안에 promise가 끝나면 그 결과를, 못 끝나면 'timed-out'을 리턴한다. */
export const raceTimeout = async <T>(promise: Promise<T>, ms: number): Promise<T | 'timed-out'> => {
  return Promise.race([
    promise,
    new Promise<'timed-out'>((resolve) => setTimeout(() => resolve('timed-out'), ms)),
  ]);
};
