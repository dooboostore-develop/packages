import 'reflect-metadata';
import { SwcAppInterface } from '@dooboostore/simple-web-component';
import { UrlUtils } from "@dooboostore/core";
import bootFactory from "./bootFactory";

const w = window;

w.document.addEventListener('DOMContentLoaded', () => {
  const container = Symbol('container');
  bootFactory(w, container);
  
  const appElement = w.document.querySelector('#app') as SwcAppInterface;
  const path = UrlUtils.getUrlPath(w.location) ?? '/';
  
  if (appElement) {
    appElement.connect({
      path: path,
      routeType: 'path',
      container: container,
      window: w,
      onEngineStarted: () => {
        console.log('[Commerce] Engine started');
        appElement.innerHTML = '<commerce-root-router></commerce-root-router>';
      }
    });
  }
});
