import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { Route, Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { Lifecycle, PostConstruct, Sim, SimConfig } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Inject } from '@dooboostore/simple-boot/decorators/inject/Inject';
import { SimOption } from '@dooboostore/simple-boot/SimOption';
import { ConstructorType } from '@dooboostore/core/types';
import { Intent } from '@dooboostore/simple-boot/intent/Intent';

@Sim
class User {
  constructor() {
    console.log('User constructor');
  }

  say() {
    console.log('User say');
  }
}

@Sim({ scheme: 'User' })
class User1 {
  constructor() {
    console.log('User1 constructor');
  }

  say() {
    console.log('User1 say');
  }


  good() {

  }
}

class User3 {

}
// @Sim({ scheme: 'User2', type: User, autoCreate: true })
class User2 {
  uuid = Math.random();

  constructor() {
    console.log('User2 constructor');
  }

  say() {
    console.log('User2 say', this.uuid);
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
  }
})
class SubRouter {

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
  // path: '/',
  // route: { 'user': User },
  routers: [SubRouter]
})
class AppRouter {
  private date = new Date().toISOString();

  constructor(@Inject({ type: User, scheme: 'User' }) private users: User[], private user2: User2, private user22: User2) {
    console.log('users-->constructor-!!!!', users, user2, user22);
    users.forEach(it => {
      it.say();
    });
    // this.user.say();
  }

  routeSay() {
  }

  @PostConstruct
  post() {
  }
}

@Sim({
  type: AppRouter,
  scope: Lifecycle.Transient
})
class AppRouter2 extends AppRouter {
  // constructor(@Inject({type: User, scheme: 'User'}) users: User[]) {
  //   super(users);
  // }

  routeSay() {
    console.log('routerSay!!!!!!!');
  }


}

// const a = Sim({
//   scope: Lifecycle.Transient
// })(User2);

// const a = Sim({ scheme: 'User2', type: User, autoCreate: true })(User2)

const app = new SimpleApplication(new SimOption({ rootRouter: AppRouter }));
const s = Symbol('aa')
// app.addSim({symbol: s}, new User2());
const other = new Map<ConstructorType<any> | Function | SimConfig, any>()
other.set({symbol: s}, new User2())
other.set({symbol: s, type:User2}, new User2())
// other.set(User2, new User2())
// other.set(User2, new User2())
// other.set(User2, new User2())
// console.log('------', other)
app.run(other);
// let appRouter = app.sims(s);
// appRouter?.say();
// console.log('-------',appRouter)
// appRouter.forEach(it => it.getValue()?.say())

let user2 = app.sim(User2);
user2?.say()
// console.log('-------',user2)

// const intent = new Intent('/user/office');
// app.routing(intent).then(it => {
//   console.log('--s-sdssssd',it)
//   // console.log('---', it, it.module)
// })

// console.log('-----------------------')
// appRouter = app.sim(AppRouter);
// appRouter?.routeSay();
// ssd  ssd
// type 2
// app.run().getOrNewSim(User).say();

// type 3
// app.run();
// const atomic = app.simAtomic(User);
// atomic.value.say();

// type 4 routing
// app.run();
// app.routing('/user').then(it => {
//     it.getModuleInstance<User>()?.say();
// })
