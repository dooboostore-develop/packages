import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { Lifecycle, PostConstruct, Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Inject } from '@dooboostore/simple-boot/decorators/inject/Inject';
import { SimOption } from '@dooboostore/simple-boot/SimOption';
import { ConstructorType } from '@dooboostore/core/types';

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
}

// @Sim({ scheme: 'User2', type: User, autoCreate: true })
class User2 {
  uuid = Math.random();

  constructor() {
    console.log('User2 constructor');
  }

  say() {
    console.log('User2 say');
  }
}

@Sim({
  scope: Lifecycle.Transient
})
@Router({
  path: '',
  route: { '/user': User }
})
abstract class AppRouter {
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

const app = new SimpleApplication(new SimOption({ rootRouter: AppRouter2 }));
app.addSim( User2);
// app.addSim({ scheme: 'User2', type: User, autoCreate: true }, User2);
// type 1
const other = new Map<ConstructorType<any> | Function, any>()
// other.set(User2, new User2());
app.run(other);
// const a = app.simAtomic(AppRouter)
// console.log('---->',a)
// const c = a.getConfig()
// console.log('---->',c)
// app.sim(User).say();
let appRouter = app.sim(AppRouter);
// console.log('!!!', appRouter)
appRouter?.routeSay();

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
