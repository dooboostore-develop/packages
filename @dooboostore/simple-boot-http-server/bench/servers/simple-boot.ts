import 'reflect-metadata';
import { Sim, Router, Route } from '@dooboostore/simple-boot';
import { SimpleBootHttpServer, HttpServerOption, GET, POST, ReqPathData, ReqJsonBody } from '@dooboostore/simple-boot-http-server';
import { PORT, ROUTES, UserService as Plain } from './_common.ts';

@Sim class UserService extends Plain {}

class Api {
  constructor(private users: UserService) {}
  hello() { return { hello: 'world' }; }
  user(p: ReqPathData) { return this.users.find(p.id as string); }
  echo(body: ReqJsonBody) { return body; }
}
// Same hand-applied decorators as the Nest server: 100 routes without 100 hand-written methods.
const P = Api.prototype as any;
const d = (n: string) => Object.getOwnPropertyDescriptor(P, n)!;
// the decorator factory writes `method` into the config object it is given, so never share one across routes
const json = () => ({ res: { contentType: 'application/json' } });
const reg = (n: string, path: string, verb: typeof GET | typeof POST) => { (verb as any)(json())(P, n, d(n)); Route({ path })(P, n, d(n)); };
reg('hello', '/hello', GET);
reg('user', '/users/{id}', GET);
reg('echo', '/echo', POST);
for (let i = 0; i < ROUTES; i++) { Object.defineProperty(P, 'r' + i, { value: () => ({ route: i }), writable: true, configurable: true }); reg('r' + i, '/r/' + i, GET); }
// Parameter types for constructor DI / method injection come from emitDecoratorMetadata.
Reflect.defineMetadata('design:paramtypes', [UserService], Api);
Reflect.defineMetadata('design:paramtypes', [ReqPathData], P, 'user');
Reflect.defineMetadata('design:paramtypes', [ReqJsonBody], P, 'echo');
Router({ path: '' })(Api);
Sim(Api);

new SimpleBootHttpServer(new HttpServerOption({ listen: { port: PORT, hostname: '127.0.0.1' } }, { rootRouter: Api })).run();
