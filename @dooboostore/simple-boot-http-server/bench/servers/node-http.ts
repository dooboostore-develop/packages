import http from 'node:http';
import { PORT, UserService } from './_common.ts';
const users = new UserService();
const send = (res: http.ServerResponse, body: unknown) => { const s = JSON.stringify(body); res.writeHead(200, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(s) }); res.end(s); };
http.createServer((req, res) => {
  const url = req.url!;
  if (url === '/hello') return send(res, { hello: 'world' });
  if (url.startsWith('/users/')) return send(res, users.find(url.slice(7)));
  if (url.startsWith('/r/')) return send(res, { route: Number(url.slice(3)) });
  if (url === '/echo' && req.method === 'POST') { const c: Buffer[] = []; req.on('data', (d) => c.push(d)); return void req.on('end', () => send(res, JSON.parse(Buffer.concat(c).toString()))); }
  res.writeHead(404).end();
}).listen(PORT);
