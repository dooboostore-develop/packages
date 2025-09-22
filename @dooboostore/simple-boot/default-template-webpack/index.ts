import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { Route, Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Inject } from '@dooboostore/simple-boot/decorators/inject/Inject';
import { SimOption } from '@dooboostore/simple-boot/SimOption';
import { Intent } from '@dooboostore/simple-boot/intent/Intent';
import { RouteFilter } from '@dooboostore/simple-boot/route/RouteFilter';
import { RouterAction, RoutingDataSet } from '@dooboostore/simple-boot/route/RouterAction';
import { Injection } from '@dooboostore/simple-boot/decorators/inject/Injection';
import { GlobalAdvice } from './GlobalAdvice';
//
// @Sim
// class User {
//   constructor() {
//     console.log('User constructor');
//   }
//
//   say() {
//     console.log('User say');
//   }
// }
//
// @Sim({ scheme: 'User' })
// class User1 {
//   constructor() {
//     console.log('User1 constructor');
//   }
//
//   say() {
//     console.log('User1 say');
//   }
// }
//
// // @Sim({ scheme: 'User2', type: User, autoCreate: true })
// class User2 {
//   uuid = Math.random();
//
//   constructor() {
//     console.log('User2 constructor');
//   }
//
//   say() {
//     console.log('User2 say');
//   }
// }
//
// @Sim
// @Router({
//   path: '/',
//   route: { '/user': User }
// })
// class AppRouter {
//   private date = new Date().toISOString();
//
//   constructor() {
//   }
//
//   routeSay() {
//   }
//
//   @PostConstruct
//   post() {
//   }
// }
//
//
// (async ()=>{
//   const app = new SimpleApplication(new SimOption({ rootRouter: AppRouter }));
//   app.run();
//   const routerModule = await app.routing('/')
//   console.log('-->',routerModule, routerModule.module)
//
// })();

@Sim
class SS {
  name = 'csss';

  sayName() {
    console.log(`My office Name is ${this.name}`);
  }

  say() {
    console.log('SS say');
  }
}
@Sim
@Router({
  path: '/{rname:[a-z]+}',
  // path: '/aa',
  route: { '/ffw': SS }
  // filters: [new RFilter()],
  // route: {'/office': Office}
})
class SSRouter implements RouterAction {
  child: any;

  async canActivate(url: RoutingDataSet, module: any) {
    this.child = module;
  }

  say() {
    console.log('---users----------say---------');
  }

  hasActivate(checkObj: any): boolean {
    return this.child === checkObj;
  }
}

@Sim
class Office {
  name = 'oldName';

  sayName() {
    console.log(`My office Name is ${this.name}`);
  }

  say() {
    console.log('Office say');
  }
}
@Sim
class Office2 {
  name = 'oldName';

  sayName() {
    console.log(`My office Name is ${this.name}`);
  }

  say() {
    console.log('Office2 say');
  }
}

@Sim
@Router({
  path: '/users',
  // filters: [new RFilter()],
  route: {
    '/office': Office
    // '/{name:[a-z]+}': Office2
  },
  routers: [SSRouter]
})
class UsersRouter implements RouterAction {
  child: any;

  async canActivate(url: RoutingDataSet, module: any) {
    this.child = module;
  }

  say() {
    console.log('---users----------say---------');
  }
  hasActivate(checkObj: any): boolean {
    return this.child === checkObj;
  }
}

@Sim
class Welcome {
  say() {
    console.log('welcome say!!');
  }
}

export class AFilter implements RouteFilter {
  isAccept(indent: Intent): boolean {
    console.log('aaaa', indent);

    throw new Error('zzzzzzzzzzzz22zz');
    return true;
  }
}

@Sim
export class RFilter implements RouteFilter {
  isAccept(indent: Intent): boolean {
    console.log('rrrr', indent);
    return true;
  }
}

@Sim
@Router({
  path: '',
  // route: {'/welcome': {filters: [new AFilter(), RFilter], target: Welcome}},
  route: { '/welcome': Welcome },
  // route: {'/welcome': {filters: [new AFilter(), RFilter], target: Welcome}},
  routers: [UsersRouter]
  // filters: [new AFilter(), RFilter, {
  //     isAccept(intent: Intent): boolean {
  //         console.log('-fff')
  //         return true;
  //     }
  // }]
})
class AppRouter implements RouterAction {
  name = 'appRouter-name';

  @Injection
  @Route({
    path: ['/sub-route', '/ss', '/zz']
    // filters: [new AFilter(), RFilter, {
    //     isAccept(intent: Intent): boolean {
    //         console.log('-fff')
    //         return false;
    //     }
    // }]
  })
  test(@Inject({ disabled: true }) props: string, simOption: SimOption) {
    console.log('test--', props, simOption, this.name);
  }

  async canActivate(url: RoutingDataSet, module: any) {
    // console.log('activate route: ', url, module);
  }
}

const option = new SimOption();
option.advice = [GlobalAdvice];
option.rootRouter = AppRouter;
const app = new SimpleApplication(option);
app.run();
(async () => {
  // route in router
  // let routerModule = await app.routing('/sub-route');
  // console.log('---?', routerModule)
  // let propertyKey = routerModule.propertyKeys?.[0];
  // console.log('key-->', propertyKey);
  // let moduleInstance = routerModule.getModuleInstance<(props: string) => void>(propertyKey);
  // moduleInstance('propData');
  // routerModule.executeModuleProperty(propertyKey);

  // route in router
  // routerModule = await app.routing('/zz');
  // propertyKey = routerModule.propertyKeys?.[0];
  // routerModule.executeModuleProperty(propertyKey, '2')
  //
  // // route in router
  // routerModule = await app.routing('/ss');
  // propertyKey = routerModule.propertyKeys?.[0];
  // routerModule.executeModuleProperty(propertyKey)
  //
  // // router
  // const routerModule = await app.routing('/users/office');
  // const routerModule = await app.routing('/users');
  // const routerModule = await app.routing('/users/czcz');
  const routerModule = await app.routing({ path: '/users/aa/ffw' });
  // console.log('---routerModule-->', routerModule, routerModule.getRouterPath(), routerModule.module);
  console.log('---routerModule-->', '---', routerModule.getRouterPath(), routerModule.pathData);
  routerModule.getModuleInstance<UsersRouter>()?.say();
  // const routerModule = await app.routing('/users/office');
  // console.log('---routerModule-->', routerModule, routerModule.module);
  // routerModule.getModuleInstance<Office>()?.say();
  // const routerModule = await app.routing('/welcome');
  // console.log('---routerModule-->', routerModule, routerModule.module);
  // routerModule.getModuleInstance<Welcome>()?.say();
  // const routerModule = await app.routing('/users');
  // routerModule.getModuleInstance<UsersRouter>()?.say();
  // (await app.routing('/users/office?name=newName')).getModuleInstance<Office>().sayName();
})();
