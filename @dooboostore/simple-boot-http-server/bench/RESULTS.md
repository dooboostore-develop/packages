# simple-boot-http-server benchmark

- Node v24.21.0, Intel(R) Core(TM) Ultra 9 275HX, 24 cores, linux x64
- Versions: simple-boot-http-server 1.0.39, express 5.3.0, fastify 5.12.8, hono 4.13.17, nest (express) 11.2.9, nest (fastify) 11.2.9
- 2026-11-11 · autocannon, 64 connections, 2 s warmup + 8 s measured per case · server and load generator on the same machine (loopback)

## Throughput (requests/sec, higher is better; best in **bold**)

| scenario | node:http (baseline) | simple-boot-http-server | express | fastify | hono | nest (express) | nest (fastify) |
|---|---|---|---|---|---|---|---|
| hello JSON | ██████████ **163,680** | ███▉ 64,184 | █████▌ 89,832 | █████████▉ 160,864 | ████████▊ 143,200 | ████▌ 74,184 | ████████▏ 132,728 |
| path param + injected service | ██████████ **162,992** | ███▊ 60,764 | █████▏ 82,688 | █████████▊ 158,112 | ████████▍ 135,660 | ████▏ 66,360 | ███████▌ 122,408 |
| JSON body echo (POST) | ██████████ **125,424** | ████▎ 52,916 | █████▍ 67,024 | █████████▍ 117,848 | ███▍ 42,076 | ████▎ 52,644 | ███████▋ 95,000 |
| 100 routes (rotating) | ██████████ **161,056** | ██▏ 35,224 | ████▊ 76,392 | █████████▉ 159,344 | ████████▌ 136,160 | ███▉ 63,052 | ███████▉ 126,080 |

## Latency p99 (ms, lower is better)

| scenario | node:http (baseline) | simple-boot-http-server | express | fastify | hono | nest (express) | nest (fastify) |
|---|---:|---:|---:|---:|---:|---:|---:|
| hello JSON | **0** | 1 | **0** | **0** | **0** | 1 | **0** |
| path param + injected service | **0** | 1 | 1 | **0** | **0** | 1 | **0** |
| JSON body echo (POST) | **0** | 1 | 1 | **0** | 6 | 2 | **0** |
| 100 routes (rotating) | **0** | 2 | 1 | **0** | **0** | 1 | **0** |

## Startup and memory (lower is better)

| | node:http (baseline) | simple-boot-http-server | express | fastify | hono | nest (express) | nest (fastify) |
|---|---|---|---|---|---|---|---|
| start to first response (ms) | █████▍ 224 | ████████▉ 367 | ██████▎ 261 | ███████▌ 313 | ██████▎ 261 | ████████▊ 361 | ██████████ 414 |
| RSS right after start (MB) | ███████▌ 140 | █████████▎ 172 | ███████▋ 142 | ████████▍ 155 | ███████▊ 145 | █████████▍ 174 | ██████████ 186 |
| RSS after all load cases (MB) | █████▏ 186 | ███████▎ 267 | ██████ 220 | █████▎ 193 | ██████████ 366 | ███████▏ 260 | ███████▍ 269 |








## Charts

Bar length is proportional to the value. Sorted best first; `▲` marks the best of the row.

### Throughput

```text
hello JSON
  node:http (baseline)     ████████████████████████████████  163,680  ▲
  fastify                  ███████████████████████████████   160,864
  hono                     ████████████████████████████      143,200
  nest (fastify)           ██████████████████████████        132,728
  express                  ██████████████████                89,832
  nest (express)           ███████████████                   74,184
  simple-boot-http-server  █████████████                     64,184

path param + injected service
  node:http (baseline)     ████████████████████████████████  162,992  ▲
  fastify                  ███████████████████████████████   158,112
  hono                     ███████████████████████████       135,660
  nest (fastify)           ████████████████████████          122,408
  express                  ████████████████                  82,688
  nest (express)           █████████████                     66,360
  simple-boot-http-server  ████████████                      60,764

JSON body echo (POST)
  node:http (baseline)     ████████████████████████████████  125,424  ▲
  fastify                  ██████████████████████████████    117,848
  nest (fastify)           ████████████████████████          95,000
  express                  █████████████████                 67,024
  simple-boot-http-server  ██████████████                    52,916
  nest (express)           █████████████                     52,644
  hono                     ███████████                       42,076

100 routes (rotating)
  node:http (baseline)     ████████████████████████████████  161,056  ▲
  fastify                  ████████████████████████████████  159,344
  hono                     ███████████████████████████       136,160
  nest (fastify)           █████████████████████████         126,080
  express                  ███████████████                   76,392
  nest (express)           █████████████                     63,052
  simple-boot-http-server  ███████                           35,224
```

### Startup and memory

```text
start to first response (ms)  (lower is better)
  node:http (baseline)     █████████████████                 224  ▲
  express                  ████████████████████              261
  hono                     ████████████████████              261
  fastify                  ████████████████████████          313
  nest (express)           ████████████████████████████      361
  simple-boot-http-server  ████████████████████████████      367
  nest (fastify)           ████████████████████████████████  414

RSS right after start (MB)  (lower is better)
  node:http (baseline)     ████████████████████████          140  ▲
  express                  ████████████████████████          142
  hono                     █████████████████████████         145
  fastify                  ███████████████████████████       155
  simple-boot-http-server  ██████████████████████████████    172
  nest (express)           ██████████████████████████████    174
  nest (fastify)           ████████████████████████████████  186

RSS after all load cases (MB)  (lower is better)
  node:http (baseline)     ████████████████                  186  ▲
  fastify                  █████████████████                 193
  express                  ███████████████████               220
  nest (express)           ███████████████████████           260
  simple-boot-http-server  ███████████████████████           267
  nest (fastify)           ████████████████████████          269
  hono                     ████████████████████████████████  366
```

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
