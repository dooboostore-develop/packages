
## How to read this

All servers implement the same four routes (`servers/_common.ts`) and each answer is checked for identical output before its numbers count. Absolute numbers depend on the machine; the ratios between columns are what carry information. Re-run with `pnpm bench`.

### Honest summary

simple-boot-http-server is currently the **slowest** of the servers tested, in every throughput case:

| scenario | vs express | vs nest (express) | vs nest (fastify) | vs fastify |
|---|---:|---:|---:|---:|
| hello JSON | 0.71x | 0.87x | 0.48x | 0.40x |
| path param + injected service | 0.73x | 0.92x | 0.50x | 0.38x |
| JSON body echo (POST) | 0.79x | 1.01x | 0.56x | 0.45x |
| 100 routes (rotating) | 0.46x | 0.56x | 0.28x | 0.22x |

- It is **on par with NestJS on express** for body handling and within ~10% to 15% on simple routes, which is the closest like-for-like (decorator + DI) comparison.
- It is **roughly half the speed of fastify-based stacks**, and p99 latency stays at 1 to 2 ms under 64 connections.
- **Route matching is the weak spot**: with 100 routes it drops to 35k req/s from 64k for a single route, while express, fastify and hono barely move. Matching appears to scale with the number of routes.
- Startup is average (~370 ms incl. TypeScript transpile); memory after load is now in line with the others (see below).

### A memory leak found by this benchmark (fixed)

The first full run showed simple-boot-http-server at **551 MB** RSS after the load cases versus ~220 MB for express. Repeating load kept growing it (289, 367, 419, 443, 498 MB; no drop when idle), and a forced-GC heap check confirmed retained JS objects, not lazy GC.

Cause: every request without a session cookie created a session and stored it in `SessionManager.sessions`, even for plain JSON endpoints that never use sessions. Sessions are only swept every `expiredTime` (30 minutes by default), so anonymous traffic grew the map without bound, and it was a cheap memory-exhaustion vector for any client that simply never sends cookies.

Fix: sessions are now created lazily, only when a handler calls `reqSession*()`, and the cookie is issued at that point. A second bug surfaced while testing it: one request calling `reqSessionGet` then `reqSessionSet` created two sessions; both now share one. The sweep timer no longer keeps the process alive (`unref`). Regression test: `test/server/session-lazy.test.ts`.

Effect: RSS after all load cases 551 MB to 267 MB, hello JSON 51k to 64k req/s (about +25%), stable memory across repeated load. Behaviour change worth knowing: a response no longer carries a `Set-Cookie: SBSESSIONID=...` unless the handler used the session.

### Methodology and caveats

- Load generator (autocannon, 64 connections, 1 request in flight per connection) and server share one machine over loopback; expect a few percent of run-to-run noise. Latency is reported in whole milliseconds by autocannon, so sub-millisecond differences are invisible.
- 2 s warmup then 8 s measured per case; each server runs in its own fresh process.
- `node:http` is a hand-written router with no framework, included as a ceiling.
- The decorator-based servers (simple-boot, Nest) have their 100 routes registered programmatically, but through the same decorators a hand-written controller would use.
- hono's slow POST result is genuine for this setup (`await c.req.json()` per request) but is not investigated here.
- Not measured: gzip, WebSocket, SSE, large bodies, middleware or filter chains, and real handlers that touch a database. Framework overhead is usually small next to those in real applications.
