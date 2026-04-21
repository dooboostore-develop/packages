import {registerSwcApp, SwcAppInterface} from '@dooboostore/simple-web-component';
import {componentFactories} from './component';
import {pageFactories} from './pages';
import {serviceFactories} from './services';
import {ValidUtils} from '@dooboostore/core-web';

export default async (w: Window, other: Map<symbol, any> | ((c:symbol)=>void)[], path?: string) => {
  const container = Symbol('container');
  const otherServiceFactories = Array.isArray(other) ? other : [];
  const otherInstanceSim = !Array.isArray(other) ? other : new Map<symbol, any>();
  [...otherServiceFactories, ...serviceFactories].forEach(it => it(container));
  const { promise, resolve, reject } = Promise.withResolvers();
  // SSR 감지: DomParser 환경에서는 isClient가 false
  const isClient = ValidUtils.isBrowser();
  const isServer = !isClient;
  console.log('11')
  await registerSwcApp(w);
  console.log('1122')
  const appElement = w.document.querySelector('#app') as SwcAppInterface;
  if (appElement && typeof appElement.connect === 'function') {
    let onChildrenConnectedDoneInvoked = false;
    let onChildrenRouteChangedInvoked = false;
    if (isClient) { // client경우는 처음에 라우트가 된 상태이므로, onChildrenRouteChanged가 먼저 호출될 수 있음. (서버 사이드 렌더링된 페이지에서 클라이언트 사이드로 전환될 때)
      onChildrenRouteChangedInvoked = true;
    }
    const checkAndResolve = () => {
      if (onChildrenConnectedDoneInvoked && onChildrenRouteChangedInvoked) {
        console.log('[Root] Both callbacks invoked, resolving promise',isServer);
        resolve({app: appElement});
      }
    };

    // if (isServer) {
    appElement.connect({
      path: isServer ? path ?? '/' : undefined,
      routeType: 'path',
      // connectMode: isClient ? 'swap' : 'direct',
      ssr: isServer,
      container: container,
      window: w,
      otherInstanceSim: otherInstanceSim,
      onStartedLazyDefineComponent: [...componentFactories, ...pageFactories],
      // onStartedLazyComponent: [...componentFactories, ...pageFactories] ,
      onChildrenConnectedDone: (app) => {
        console.log('[Root] Children connected');
        onChildrenConnectedDoneInvoked = true;
        checkAndResolve();
      },
      onChildrenRouteChanged: (route, app) => {
        console.log('[Root] Route changed:');
        onChildrenRouteChangedInvoked = true;
        checkAndResolve();
      }
    });
    // }
  } else {
    const error = new Error('[Root]! Failed to initialize SWC App: appElement.connect is not a function. Check Safari polyfill.');
    console.error(error);
    reject(error);
  }
  return promise;
};
