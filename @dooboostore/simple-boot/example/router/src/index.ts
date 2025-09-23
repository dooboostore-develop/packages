import { Lifecycle, Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Route, Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { SimOption } from '@dooboostore/simple-boot/SimOption';
import { Intent } from '@dooboostore/simple-boot/intent/Intent';
import { RouterAction } from '@dooboostore/simple-boot/route/RouterAction';
import { RouterManager } from '@dooboostore/simple-boot/route/RouterManager';
import { RoutingDataSet } from '@dooboostore/simple-boot/route/RouterManager';
import { Subscription } from '@dooboostore/core/message/Subscription';
import { OnSimCreate } from '@dooboostore/simple-boot';

@Sim
@Router({
  path: '/ssuser'
})
class SubSubRouter implements RouterAction.CanActivate {
  constructor(private routerManager: RouterManager) {
    console.log('SubRouter');
  }


  @Route({ path: '/office' })
  routeSay() {
    return 'hello';
  }

  @Route({ path: '/officess' })
  post() {}

  async canActivate(url: RoutingDataSet, data?: any): Promise<void> {
    console.log('SubSubRouter CanActivate~~', url, data);
  }
}

@Sim({
  scope: Lifecycle.Transient
})
class Office {
  constructor() {
    console.log('Office Constructor');
  }
  say() {
    console.log('say office');
  }

  onRout(i: Intent) {
    console.log('oOffice oooooOnRouteooooooooo', i);
  }
}

@Sim
@Router({
  path: '/user',
  route: {
    '/office': Office
  },
  routers: [SubSubRouter]
})
class SubRouter implements RouterAction.CanActivate {
  constructor() {
    console.log('SubRouter');
  }

  routeSay() {}

  post() {}
  async canActivate(url: RoutingDataSet, data?: any): Promise<void> {
    console.log('SubRouter CanActivate~~', url, data);
  }
}

@Sim
@Router({
  path: '/user',
  route: {
    '/office2': Office
  }
})
class Sub2Router implements RouterAction.CanActivate {
  constructor() {
    console.log('SubRouter');
  }

  routeSay() {}

  post() {}
  async canActivate(url: RoutingDataSet, data?: any): Promise<void> {
    console.log('Sub2Router CanActivate~~', url, data);
  }
}

@Sim
@Router({
  path: '/user1',
  route: {
    '/{world}': Office
  }
})
class Sub3Router implements RouterAction.CanActivate {
  constructor() {
    console.log('SubRouter');
  }

  routeSay() {}

  post() {}
  async canActivate(url: RoutingDataSet, data?: any): Promise<void> {
    console.log('Sub3Router CanActivate~~', url, data);
  }
}

@Sim
@Router({
  path: '/test',
  route: {
    '/office': Office
  }
})
export class TestRouter implements RouterAction.CanActivate {
  constructor() {}

  @Route({ path: '/layers' })
  // @GET({ res: { header: { [HttpHeaders.ContentType]: Mimes.ApplicationJson } } })
  layers(): any {
    return [1, 2, 3];
  }
  async canActivate(url: RoutingDataSet, data?: any): Promise<void> {
    console.log('TestRouter CanActivate~~', url, data);
  }
}
@Sim({
  // scope: Lifecycle.Transient
})
@Router({
  path: '/api',
  route: {},
  routers: [TestRouter]
})
class ApiRouter {
  constructor() {
    console.log('ApiRouter constructor');
  }

  routeSay() {}

  post() {}
}
@Sim({
  // scope: Lifecycle.Transient
})
@Router({
  path: '/',
  route: {
    '': Office,
    good: Office
  }
})
class RRouter implements RouterAction.CanActivate, OnSimCreate {
  private routingSubscription: Subscription;
  constructor(private routerManager: RouterManager) {
    console.log('RRouter constructor');

  }

  onSimCreate() {
    console.log('subscription RRouter');
    this.routingSubscription = this.routerManager.observable.subscribe(it => {
      console.log('vvvvvvvvv', it);
    })
  }

  routeSay() {}

  post() {}

  async canActivate(url: RoutingDataSet, data?: any): Promise<void> {
    console.log('cccccccccccccccan?', data);
  }

  onRout(i: Intent) {
    console.log('ooooooooooooooo', i);
  }
}

// @Sim({
//   scope: Lifecycle.Transient
// })
@Sim
@Router({
  path: '',
  routers: [RRouter, SubRouter, Sub2Router, Sub3Router, ApiRouter]
})
class RootRouter implements RouterAction.CanActivate {
  constructor() {
    console.log('RootRouter constructor');
  }

  async canActivate(url: RoutingDataSet, data?: any): Promise<void> {
    console.log('RootRouter CanActivate~~', url, data);
  }
  say() {
    console.log('RootRouter say() 호출됨');
    return 'RootRouter say';
  }
}

(async () => {
  // const option  = new SimOption({  })
  const option = new SimOption({ rootRouter: RootRouter });
  const app = new SimpleApplication(option);
  app.run();

  // const rootRouter = app.sim(RootRouter)
  // r.say();
  // const routerManager = app.routerManager;
  // const r = await routerManager.routing(new Intent('/user1/office'));
  // const ro = await routerManager.routing(new Intent('/user1/office'));

  // console.log('router', r.router.getValue(), r.getRouterPaths(), r.path, r.pathData, r.getModuleInstance(), r.intent);

  // console.log('-->', r.propertyKeys)
  // console.log('-->', r.routerChains)
  // SubSubRouter의 routeSay 메서드 반환 값 확인
  //   if (r.propertyKeys && r.propertyKeys.includes('routeSay')) {
  //     const returnValue = await r.executeModuleProperty('routeSay');
  //     console.log('Returned value from routeSay:', returnValue); // 'hello'가 출력될
  //   }

  // const r = await app.routing({path:''});
  const r = await app.routing(new Intent('/good'));
  r.getModuleInstance<Office>()?.say()
  console.log('-------');
  // const r = await app.routing(new Intent('/'));
  // const z = r.getModuleInstance<Office>();
  // z?.say();
  // const r = await app.routing(new Intent('/api/test/layers'), {router: rootRouter});
  // const c = await app.routing(new Intent('/api/test/layers'), {router: rootRouter});
  // const rr = await app.routing(new Intent('/'), {router: new RootRouter()});
  // const r = await app.routing(new Intent('/api/test/layers'));
  // const c = await app.routing(new Intent('/api/test/layers'));
  // const r = await routerManager.routing(new Intent('/user/office'));
  // const r = await routerManager.routing(new Intent('/user/ssuser/office'));
  // console.log('module', rr.getModuleInstance());
  // console.log('router==>', r.router.getValue(), r.getRouterPaths(), r.getModuleInstance())
  // console.log('module', r.getModuleInstance());
  // console.log('module', c.getModuleInstance());
  // const rs = await routerManager.routings(new Intent('/user'));
  // console.log('rs',rs.map(it=>({router:it.router.getValue(), module: it.getModuleInstance()})))
})();
