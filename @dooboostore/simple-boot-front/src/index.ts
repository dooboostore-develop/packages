import 'reflect-metadata';
import { SimFrontOption, UrlType } from './option/SimFrontOption';
import { SimpleBootFront } from './SimpleBootFront';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { Component } from './decorators/Component';
import { RouterAction } from '@dooboostore/simple-boot/route/RouterAction';
import { SimstanceManager } from '@dooboostore/simple-boot/simstance/SimstanceManager.ts';
import { Navigation } from './service/Navigation';




@Sim({
  using: []
})
@Component({
  template: '<div>home: ${this.name}$</div>',
  style: []
})
class Home {
  name = 'home';
  toggle = false;
}

@Sim({
  using: []
})
@Component({
  template: '<div>user</div>',
})
class User {
  name = 'User';
  toggle = true;
}


@Sim({
  using: []
})
@Router({
  path: '',
  route: {
    '/': Home,
    '/user': User
  }
})
@Component({
  template: `
  <header>
    <nav>
        <ul>
            <li>
                <button router-link="/">home</button>
            </li>
            <li>
                <button router-link="/user">user</button>
            </li>
        </ul>
    </nav>

</header>
<main>
    <div dr-this="this.child" dr-this:type="outlet" dr-scrip="false"></div>
</main>
<div class="good">g</div>
<footer>
    footer
</footer>

  
  `,
  style: []
})
export class Index implements RouterAction {
  child?: any;
  constructor(public sim: SimstanceManager) {
    console.log('simstanceManager--------', sim);
  }
  async canActivate(url: any, module: any) {
    this.child = module;
    console.log('route->', url, module);
  }
}





const config = new SimFrontOption(window).setRootRouter(Index).setUrlType(UrlType.hash);
// const config = new SimFrontOption(window).setUrlType(UrlType.path);
const simpleApplication = new SimpleBootFront(config);
simpleApplication.run();
const dd = Reflect.getMetadata('design:paramtypes', Navigation);
console.log('SimFrontOption Metadata:', dd);

// console.log("----------", template)
// console.log("----------", css)



// const Key = Symbol('Simss')
// function log(target: any, key: string) {
//   console.log(`Property ${key} has been decorated`);
// }
//
// function TTT(target: any) {
//   console.log('TTT', target);
//   Reflect.defineMetadata('vv', {}, target);
//   return target;
// }
//
// @TTT
// class TestClass {
//   name: string;
//
//   constructor(name: string) {
//     this.name = name;
//     console.log('Constructor called with:', name);
//   }
// }
//
// console.log('Creating instance...');
// const test = new TestClass('test-name');
// console.log('Instance name:', test.name);
// //
// console.log('Getting metadata...');
// const dd = Reflect.getMetadata('design:paramtypes', TestClass);
// console.log('Metadata:', dd);

// import { Lifecycle, PostConstruct, Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
// import { Router } from '@dooboostore/simple-boot/decorators/route/Router';
// import { Inject } from '@dooboostore/simple-boot/decorators/inject/Inject';
// import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
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
// @Sim({scheme: 'User'})
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
// @Sim({scheme: 'User2', type: User, autoCreate: true})
// class User2 {
//   uuid = Math.random();
//   constructor() {
//     console.log('User2 constructor');
//   }
//
//   say() {
//     console.log('User2 say');
//   }
// }
//
// @Sim({
//   scope: Lifecycle.Transient
// })
// @Router({
//   path: '',
//   route: {'/user': User}
// })
// abstract class AppRouter {
//   private date = new Date().toISOString();
//
//   constructor(@Inject({type: User, scheme: 'User'}) private users: User[], private user2: User2, private user22: User2) {
//     console.log('users-->constructor-!!!!', users, user2, user22);
//     users.forEach(it => {
//       it.say();
//     })
//     // this.user.say();
//   }
//
//   routeSay() {
//     console.log('routerSay', this.date);
//   }
//
//   @PostConstruct
//   post() {
//     console.log('---------22-postConstruct')
//   }
// }
//
// @Sim({
//   type: AppRouter,
//   scope: Lifecycle.Transient
// })
// class AppRouter2 extends AppRouter {
//   // constructor(@Inject({type: User, scheme: 'User'}) users: User[]) {
//   //   super(users);
//   // }
//
//   routeSay() {
//     console.log('routerSay!!!!!!!');
//   }
//
//
// }
//
// const app = new SimpleApplication(AppRouter);
// // type 1
// app.run();
// // const a = app.simAtomic(AppRouter)
// // console.log('---->',a)
// // const c = a.getConfig()
// // console.log('---->',c)
// // app.sim(User).say();
// let appRouter = app.sim(AppRouter);
// // console.log('!!!', appRouter)
// appRouter?.routeSay();
