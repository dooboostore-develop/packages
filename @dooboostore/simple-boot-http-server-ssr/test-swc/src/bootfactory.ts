import register, { SwcAppInterface } from '@dooboostore/simple-web-component';
import { componentFactories } from './component';
import { pageFactories } from './pages';
import { serviceFactories } from './services';
import { ConstructorType, Promises } from '@dooboostore/core';
import { ValidUtils } from '@dooboostore/core-web';

export default (w: Window, other: Map<symbol, any> | ((c:symbol)=>void)[], path?: string) => {
  console.log('bootfactory==');
  const container = Symbol('container');
  const otherServiceFactories = Array.isArray(other) ? other : [];
  const otherInstanceSim = !Array.isArray(other) ? other : new Map<symbol, any>();
  [...otherServiceFactories, ...serviceFactories].forEach(it => it(container));
  register(w, [...componentFactories, ...pageFactories]);

  const isClient = ValidUtils.isBrowser();
  console.log('-------->', isClient);
  const { promise, resolve, reject } = Promise.withResolvers();
  const appElement = w.document.querySelector('#app') as SwcAppInterface;
  if (appElement && typeof appElement.connect === 'function') {
    appElement.connect({
      path: path ?? '/',
      routeType: 'path',
      connectMode: isClient ? 'swap' : 'direct',
      container: container,
      window: w,
      otherInstanceSim: otherInstanceSim,
      onEngineStarted: (app, component) => {
        component.innerHTML = `<index-router l="22"/>`;
        // w.customElements.upgrade(component);
        console.log('[Root] Engine started');
        // console.log('Router:', component.router);
      },
      onChildrenRouteChanged: (route, app) => {
        console.log('[Root] Route changed:', route);
        w.document.querySelector('index-router')?.setAttribute('l', route.path);
        resolve({app, route});
      }
    });
  } else {
    const error = new Error('[Root]! Failed to initialize SWC App: appElement.connect is not a function. Check Safari polyfill.');
    console.error(error);
    reject(error);
  }
  return promise;
};
