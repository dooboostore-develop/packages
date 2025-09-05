import { Lifecycle, Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Route, Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { SimOption } from '@dooboostore/simple-boot/SimOption';
import { Intent } from '@dooboostore/simple-boot/intent/Intent';
import { Inject } from '@dooboostore/simple-boot/decorators/inject/Inject';
import { RouterAction, RoutingDataSet } from '@dooboostore/simple-boot/route/RouterAction';


@Sim
@Router({
  path: '/ssuser',
})
class SubSubRouter implements RouterAction{

  constructor() {
    console.log('SubRouter');
  }

  @Route({path: '/office'})
  routeSay() {
    return 'hello';
  }

  @Route({path: '/officess'})
  post() {
  }

  async canActivate(url: RoutingDataSet, data?: any): Promise<void> {
    console.log('SubSubRouter CanActivate~~', url, data)
  }

}

@Sim
class Office {

}


@Sim
@Router({
  path: '/user',
  route: {
    '/office': Office
  },
  routers: [SubSubRouter]
})
class SubRouter implements RouterAction {

  constructor() {
    console.log('SubRouter');
  }

  routeSay() {
  }

  post() {
  }
  async canActivate(url: RoutingDataSet, data?: any): Promise<void> {
    console.log('SubRouter CanActivate~~', url, data)
  }

}

@Sim
@Router({
  path: '/user',
  route: {
    '/office2': Office
  }
})
class Sub2Router  implements RouterAction{

  constructor() {
    console.log('SubRouter');
  }

  routeSay() {
  }

  post() {
  }
  async canActivate(url: RoutingDataSet, data?: any): Promise<void> {
    console.log('Sub2Router CanActivate~~', url, data)
  }

}

@Sim
@Router({
  path: '/user1',
  route: {
    '/{world}': Office
  }
})
class Sub3Router  implements RouterAction{

  constructor() {
    console.log('SubRouter');
  }

  routeSay() {
  }

  post() {
  }
  async canActivate(url: RoutingDataSet, data?: any): Promise<void> {
    console.log('Sub3Router CanActivate~~', url, data)
  }

}




@Sim
@Router({
  path: '/test',
})
export class TestRouter implements RouterAction{

  constructor() {
  }

  @Route({path: '/layers'})
  // @GET({ res: { header: { [HttpHeaders.ContentType]: Mimes.ApplicationJson } } })
  layers(): any {
    return [1,2,3];
  }
  async canActivate(url: RoutingDataSet, data?: any): Promise<void> {
    console.log('TestRouter CanActivate~~', url, data)
  }

}
  @Sim
@Router({
  path: '/api',
  route: {
  },
  routers: [TestRouter]
})
class ApiRouter {

  constructor() {
    console.log('SubRouter');
  }

  routeSay() {
  }

  post() {
  }
}



@Sim({
  scope: Lifecycle.Transient
})
@Router({
  path: '',
  routers: [SubRouter, Sub2Router, Sub3Router, ApiRouter]
})
class RootRouter implements RouterAction {
  constructor() {
    console.log('RootRouter constructor')
  }

  async canActivate(url: RoutingDataSet, data?: any): Promise<void> {
    console.log('RootRouter CanActivate~~', url, data)
  }
say() {
    console.log('RootRouter say() 호출됨');
    return 'RootRouter say';
  }
}

(async ()=>{
  const option  = new SimOption({  })
  const app = new SimpleApplication(option);
  app.run();

  const r = app.sim(RootRouter)
  r.say();
  const routerManager = app.routerManager;
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


  // const r = await routerManager.routing(new Intent('/api/test/layers'));
  // const r = await routerManager.routing(new Intent('/user/office'));
  // const r = await routerManager.routing(new Intent('/user/ssuser/office'));
  // console.log('router', r.router.getValue(), r.getRouterPaths(), r.getModuleInstance())
  // console.log('module', r.getModuleInstance());
  // const rs = await routerManager.routings(new Intent('/user'));
  // console.log('rs',rs.map(it=>({router:it.router.getValue(), module: it.getModuleInstance()})))
})()
