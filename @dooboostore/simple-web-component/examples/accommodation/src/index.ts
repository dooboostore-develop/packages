import 'reflect-metadata';
import { defineSwcAppBody, SwcAppInterface } from '@dooboostore/simple-web-component';
import {pageFactories} from "./pages";
import {componentFactories} from "./components";
import serviceFactories from "./services";

const w = window;

w.document.addEventListener('DOMContentLoaded', async () => {

  const container = Symbol('container');
  const services = serviceFactories(container);
  await defineSwcAppBody(w)
  // const z = document.createElement('accommodation-root-router');
  const appElement = w.document.querySelector('#app') as SwcAppInterface;
  if (appElement) {
    appElement.connect({
      path: window.location.pathname === '/' ? '/' : window.location.pathname,
      routeType: 'path',
      container: container,
      onStartedLazyDefineComponent:  [...pageFactories, ...componentFactories],
      window: w,
      onEngineStarted:(a, e) => {
      }
    });
  }
});
