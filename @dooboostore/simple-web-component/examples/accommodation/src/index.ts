import 'reflect-metadata';
import { SwcAppInterface } from '@dooboostore/simple-web-component';
import bootFactory from "./bootFactory";

const w = window;

w.document.addEventListener('DOMContentLoaded', () => {
  const container = Symbol('container');
  const tagName = bootFactory(w, container);
  // const z = document.createElement('accommodation-root-router');
  const appElement = w.document.querySelector('#app') as SwcAppInterface;
  if (appElement) {
    appElement.connect({
      // rootRouter: RootRouter,
      path: window.location.pathname === '/' ? '/' : window.location.pathname,
      routeType: 'path',
      container: container,
      window: w,
      onEngineStarted:(a, e) => {
        // e.innerHTML = `<accommodation-root-router/>`;
      }
    });
  }
});
