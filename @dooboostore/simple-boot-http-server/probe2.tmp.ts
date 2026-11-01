import 'reflect-metadata';
import { Sim, Router, Route, ExceptionHandler } from '@dooboostore/simple-boot';
import { SimpleBootHttpServer, HttpServerOption, GET, RequestResponse } from '@dooboostore/simple-boot-http-server';

const seen = [];
void RequestResponse;

@Sim
class Advice {
  @ExceptionHandler({ type: Error })
  onError(rr, e) {
    seen.push('advice:' + (e && e.code));
    try {
      rr.resStatusCode(500).resEnd('oops');
      seen.push('advice-wrote');
    } catch (err) {
      seen.push('advice-threw:' + err.code);
    }
  }
}

@Sim
@Router({ path: '/t' })
class R {
  @Route({ path: '/sent' })
  @GET()
  sent(rr) {
    rr.resEnd('already sent');
    throw Object.assign(new Error('boom-after-send'), { code: 'ERR_TEST' });
  }
}

process.on('uncaughtException', (e) => { seen.push('UNCAUGHT:' + (e && e.code)); process.exitCode = 99; });
process.on('unhandledRejection', (e) => { seen.push('UNHANDLED:' + (e && e.code)); });

const option = new HttpServerOption(
  { listen: { port: 0, hostname: '127.0.0.1' }, globalAdvice: Advice },
  { rootRouter: R }
);
const server = new SimpleBootHttpServer(option);
await new Promise((resolve) => { option.listen.listeningListener = () => resolve(); server.run(); });
const address = server.server.address();
const base = `http://127.0.0.1:${address.port}`;
const res = await fetch(`${base}/t/sent`);
console.log('status:', res.status, 'body:', await res.text());
await new Promise((r) => setTimeout(r, 500));
console.log('seen:', JSON.stringify(seen));
server.server.close();
