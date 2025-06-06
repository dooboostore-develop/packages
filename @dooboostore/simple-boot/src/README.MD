SIMPLE-BOOT-CORE
===
### It provides convenience in service development.  
![typescript](https://img.shields.io/badge/-typescript-black?logo=typescript) [![typescript](https://img.shields.io/badge/-npm-black?logo=npm)](https://www.npmjs.com/package/simple-boot-core) [![license](https://img.shields.io/badge/license-MIT-green)](LICENSE.md)  

* Object management.
   * Dependency Injection (DI)
   * Life cycle provided.
* Aspect Oriented Programming (AOP)
* ExceptionHandler (Global or Local)
* Router System 
* Intent Event System


## 🚀 Quick start
```shell
npm init -y
npm install simple-boot-core
tsc --init --experimentalDecorators --emitDecoratorMetadata
```
```typescript
// index.ts
import {SimpleApplication} from 'simple-boot-core';
import {Router} from 'simple-boot-core/decorators/route/Router';
import {Sim} from 'simple-boot-core/decorators/SimDecorator';
@Sim
class User {
  say() {
    console.log('say~ hello');
  }
}

@Sim @Router({ path: '', route: {'/user': User}})
class AppRouter {}

const app = new SimpleApplication(AppRouter);

// type 1
app.run();
app.sim(User).say();

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

```
```shell
npx ts-node index.ts
# say~ hello
```

# 😃 examples
- [examples](./examples)

## Object management.
<details>
  <summary>Dependency Injection (DI) <strong>🔻(click)</strong></summary>

## @Sim
Decorators must be declared to be managed.
```typescript
@Sim
class ProjectService {
  sum(x: number, y: number) {
    return x + y;
  }
}

@Sim
class User {

  constructor(private projectService: ProjectService) {
  }

  say() {
    console.log(`say~ hello: ${this.projectService.sum(5, 25)}`);
  }
}
// 💥 call say()
// say~ hello: 30
```
## SimConfig
```typescript
export enum Lifecycle {
  /**
   * The default registration scope, Each resolve will return the same instance (including resolves from child containers)
   */
  Singleton = 'Singleton',
  /**
   * a new instance will be created with each resolve
   */
  Transient = 'Transient'
}

export interface SimConfig {
  symbol?: Symbol | (Symbol[]);
  scheme?: string | (string[]);
  scope?: Lifecycle;
  autoCreate?: boolean;  // auto start = auto new
  proxy?: ((ProxyHandler<any> | ConstructorType<any> | Function)) | (ProxyHandler<any> | ConstructorType<any> | Function)[];
  type?: (ConstructorType<any> | Function) | (ConstructorType<any> | Function)[];
  using?: (ConstructorType<any> | Function) | (ConstructorType<any> | Function)[];
}
@Sim({...config})
class test {}
```
</details>

<details>
  <summary>Life cycle provided <strong>🔻(click)</strong></summary>

## OnSimCreate interface
Sim Object created just one call
```typescript
@Sim
class User implements OnSimCreate {
  onSimCreate(): void {
    console.log('on Create')
  }
}
// output 💥
// on Create
```
</details>


## OnSimCreateCompleted
Sim Proxy after Completed callBack proxy this
```typescript

@Sim({
  symbol: AuthService.SYMBOL,
  proxy:SymbolIntentApiServiceProxy
})
export class FrontAuthService implements AuthService, OnSimCreate, OnSimCreateCompleted<FrontAuthService> {

  constructor(
          private apiService: ApiService,
          private authStore: AuthStore
  ) {
  }

  async my(data?: ((config?: Config) => Promise<AuthService.MyResponse>)): Promise<AuthService.MyResponse> {
    return data!();
  }

  resetPassword(request: AuthService.ResetPasswordRequest, data?: (config: Config<AuthService.ResetPasswordRequest> ) => Promise<void>): Promise<void> {
    return data!({body: request});
  }

  async sign(request: AuthService.SignRequest, data?: (config: Config<AuthService.SignRequest>) => Promise<AuthService.SignResponse>): Promise<AuthService.SignResponse> {
    return data!({body:request});
  }

  async signOut(data: (config?: Config<void>) => Promise<void>): Promise<void> {
    return data!();
  }

  onSimCreate() {
  }

  onSimCreateProxyCompleted(currentThis: FrontAuthService): void {
    if (ValidUtils.isBrowser()) {
      const myFetch = () => {
        currentThis.my().then(it => {
          currentThis.authStore.publish(it);
        })
      }
      myFetch();
      currentThis.apiService.observable.pipe(filter(isStoreAfterFetch)).subscribe(it =>{
        // console.log('------->',it.fetch.target, it.response.headers.get('Authorization'))
        if (it.response.status === HttpStatus.Ok && it.response.headers.get('Authorization')) {
          myFetch();
        } else if (it.response.status === HttpStatus.Unauthorized) {
          currentThis.authStore.publish(undefined);
        }
      })
    }
  }

}
```




## Aspect Oriented Programming (AOP)
<details>
  <summary>Method call AOP <strong>🔻(click)</strong></summary>

## @Before @After
```typescript
@Sim
class User {

  @Before({property: 'say'})
  sayBefore() {
    console.log('sayBefore')
  }

  @After({property: 'say'})
  sayAfter() {
    console.log('sayAfter')
  }

  say() {
    console.log(`say~ hello`);
  }
}
// 💥 call say()
// sayBefore
// say~ hello
// sayAfter
```
</details>


## @Inject
```typescript

@Sim({
  scheme: UserServiceBaseSchema
})
export class UserService extends UserServiceBase implements OnSimCreate {
...
}
export class SignInupModalComponent implements OnInit {
  containerElement?: HTMLDivElement;
  backgroundElement?: HTMLDivElement;
  public form = new PageValidator();
  // private userService?: UserServiceBase;
  // public anonService?: AnonService;
  private openParams: OpenParams | undefined;

  constructor(private navigation: Navigation,
              private alertService: AlertService,
              @Inject({scheme: UserServiceBaseSchema}) private userService: UserServiceBase,
              private petService: PetService
  ) {
  ...
  }
```

## ExceptionHandler (Global or Local)
<details>
  <summary>Local Exception Advice <strong>🔻(click)</strong></summary>

## @ExceptionHandler
```typescript
@Sim
class User {

  @ExceptionHandler()
  otherException(@Inject({situationType: ExceptionHandlerSituationType.ERROR_OBJECT}) e: any) {
    console.log(`otherException : ${e.message}`)
  }

  @ExceptionHandler({type: Error})
  errorTypeException(e: Error) {
    console.log(`errorTypeException : ${e.message}`)
  }

  say1() {
    console.log(`say~ hello`);
    throw {message: 'otherException'}
  }

  say2() {
    console.log(`say~ hello`);
    throw new Error('error');
  }

}

// 💥 call say1()
// say~ hello
// { message: 'otherException' }
// otherException : otherException

// 💥 call say2()
// say~ hello
// Error: error at ...
// errorTypeException : error

```
</details>
<details>
  <summary>Global Exception Advice <strong>🔻(click)</strong></summary>

```typescript
@Sim
class GlobalAdvice {
  @ExceptionHandler()
  otherException(@Inject({situationType: ExceptionHandlerSituationType.ERROR_OBJECT}) e: any) {
    console.log(`otherException : ${e.message}`)
  }

  @ExceptionHandler({type: Error})
  errorTypeException(e: Error) {
    console.log(`errorTypeException : ${e.message}`)
  }
}

@Sim
class User {
  say1() {
    console.log(`say~ hello`);
    throw {message: 'otherException'}
  }

  say2() {
    console.log(`say~ hello`);
    throw new Error('error');
  }

}
const option = new SimOption([GlobalAdvice])
new SimpleApplication(AppRouter, option).run().routing('/user').then(it => {
  it.getModuleInstance<User>()?.say1();
})
// 💥 call say1()
// say~ hello
// { message: 'otherException' }
// otherException : otherException

// 💥 call say2()
// say~ hello
// Error: error at ...
// errorTypeException : error

```
</details>



## Route System
<details>
  <summary>@Router<strong>🔻(click)</strong></summary>

```typescript
@Sim
@Router({
  path: '',
  route: {
    '/user': User
  }
})
class AppRouter {
}
```
</details>
<details>
  <summary>RouterAction Interface<strong>🔻(click)</strong></summary>

### route change call canActivate meehod

```typescript
@Sim
@Router({
  path: '',
  route: {
    '/user': User
  }
})
class AppRouter implements RouterAction {

  async canActivate(url: Intent, module: any) {
    console.log('--', url, module)
  }

}

const option = new SimOption([GlobalAdvice])
new SimpleApplication(AppRouter, option).run().routing('/user').then(it => {
  it.getModuleInstance<User>()?.say();
})
// output 💥
// -- Intent { uri: '/user', data: undefined, event: undefined } User { say: [Function (anonymous)], say2: [Function (anonymous)] }
// say~ hello

```
</details>


<details>
  <summary>@Route<strong>🔻(click)</strong></summary>  

```typescript
@Sim
@Router({
  path: ''
})
class AppRouter {
    
  @Route({path:'/user'})
  user1() {
    console.log('user say1~')
  }
  
  @Route({path:'/user'})
  user2() {
    console.log('user say2~')
  }
  
  @Route({path:'/user-props'})
  user2(props: string) {
    console.log('user propss', props)
  }
}

const option = new SimOption([GlobalAdvice])
new SimpleApplication(AppRouter, option).run().routing('/user').then(it => {
  it.propertyKeys?.forEach(key => {
    it.executeModuleProperty(key);
  });
})
new SimpleApplication(AppRouter, option).run().routing('/user-props').then(it => {
  // direct call
  let propertyKey = it.propertyKeys?.[0];
  let moduleInstance = routerModule.getModuleInstance<(props: string) => void>(propertyKey);
  moduleInstance('propData');
})
// output 💥
// user say1~
// user say2~

```
</details>


## Intent Event System
<details>
  <summary>Intent Message<strong>🔻(click)</strong></summary>

* transmit data between objects and generate events
* send data and generate events to @Sim scheme
  - Support Object transmission
  - Support query parameters
  - Allocate directly to variables
  -  Calling the method
```typescript
@Sim({scheme: 'AppRouter'}) @Router({path: '',route: {'/user': User}})
class AppRouter {
  say(intent: Intent) {
    console.log('say1-->', intent.data);
  }
}
```
```typescript
const app = new SimpleApplication(AppRouter).run();
app.publishIntent(new Intent('AppRouter://say1', {name: 'visualkhh', age: 99}));
// output 💥
// say1--> { name: 'visualkhh', age: 99 }
```
```typescript
const intent = new Intent('AppRouter://say2', ['visualkhh', 99]);
intent.publishType = PublishType.INLINE_DATA_PARAMETERS;
app.publishIntent(intent);
// output 💥
// say2--> visualkhh 99
```
```typescript
const global = new Intent('://say2'); // <-- global intent message event
const queryParam = new Intent('scheme://say2?age=5&name=visualkhh'); // <-- query parameter
queryParam.queryParams.name;
queryParam.queryParams.age;
```
</details>


# License
* MIT
* visualkhh@gmail.com



