SIMPLE-BOOT-HTTP-SSR
===
SSR web server
* simple-boot-front + simple-boot-http-server

### dependencies
* simple-boot-front [![typescript](https://img.shields.io/badge/-npm-black?logo=npm)](https://www.npmjs.com/package/simple-boot-front)
* simple-boot-http-server [![typescript](https://img.shields.io/badge/-npm-black?logo=npm)](https://www.npmjs.com/package/simple-boot-http-server)


# 😃 examples
- [examples](./examples)


# frontend
```typescript
const using = [
    AnonServiceFront, AuthServiceFront,
    LiveServiceFront, AuthMsgServiceFront,
    AuthPetServiceFront, MyServiceFront,
    AnonPetServiceFront
];
Factory.create(MakeSimFrontOption(window), using).then(it => {
    it.run()
});

```
# server
```typescript
Promise.all([logger, transporter, new JsdomInitializer(environment.frontDistPath).run(), new DBInitializer().run()]).then(async ([log, email, jsdom, connection]) => {

    await cacheScheduleManager.run(connection);

    const otherInstanceSim = new Map<ConstructorType<any>, any>();
    otherInstanceSim.set(Connection, connection);

    const option = new HttpServerOption();
    option.listen = environment.httpServerConfig.listen;
    option.globalAdvice = new GlobalAdvice();
    option.requestEndPoints = [new RequestLogEndPoint()];
    option.closeEndPoints = [new CloseLogEndPoint()];
    option.errorEndPoints = [new ErrorLogEndPoint()];

    const using = [
        AnonServiceServer, AuthServiceServer,
        LiveServiceServer, AuthMsgServiceServer,
        AuthPetServiceServer, MyServiceServer,
        AnonPetServiceServer
    ];

    const resourceFilter = new ResourceFilter(environment.frontDistPath,
        ['\.js$', '\.map$', '\.ico$', '\.png$', '\.jpg$', '\.jpeg$', '\.gif$', 'offline\.html$', 'webmanifest$', 'manifest\.json', 'service-worker\.js$']
    );
    option.filters = [
        new ThrowFilter(new NotFoundError()),
        resourceFilter,
        new SSRFilter({
            frontDistPath: environment.frontDistPath,
            factorySimFrontOption: (window: any) => MakeSimFrontOption(window),
            factory: Factory,
            poolOption: {
                max: 50,
                min: 1,
            },
            using,
            domExcludes: [Connection, EntityManager, EntityManagerFactory]
        }, otherInstanceSim),
        SecurityFilter,
        IntentFilter,
    ];

    const ssr = new SimpleBootHttpSSRServer(IndexRouter, option);
    ssr.run(otherInstanceSim);
    return ssr;
}).then(it => {
    console.log('server startUp finish!!', it.option.listen);
});
```

# common
```typescript
export const MakeSimFrontOption = (window: any) : SimFrontOption => {
    return new SimFrontOption(window).setUrlType(UrlType.path);
}

class Factory extends SimpleBootHttpSSRFactory {
    factory(simFrontOption: SimFrontOption, using: ConstructorType<any>[] = [], domExcludes: ConstructorType<any>[] = []): Promise<SimpleBootFront> {
        const simpleBootFront = new SimpleBootFront(IndexRouterComponent, simFrontOption);
        simpleBootFront.domRendoerExcludeProxy.push(Subject, Observable, Subscription, ...domExcludes);
        return Promise.resolve(simpleBootFront);
    }
}
export default new Factory();
```