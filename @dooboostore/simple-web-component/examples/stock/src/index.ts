import 'reflect-metadata';
import { defineSwcAppBody, SwcAppInterface } from '@dooboostore/simple-web-component';
import { UrlUtils } from "@dooboostore/core";
import {serviceFactories} from "./services";
import {componentFactories} from "./components";
import {pageFactories} from "./pages";

const w = window;

w.document.addEventListener('DOMContentLoaded', async () => {
  const container = Symbol('container');
  serviceFactories.forEach(it=>it(container));
  await defineSwcAppBody(w);
  
  const appElement = w.document.querySelector('#app') as SwcAppInterface;
  const path = UrlUtils.getUrlPath(w.location) ?? '/';
  
  if (appElement) {
    appElement.connect({
      path: path,
      routeType: 'path',
      onStartedLazyDefineComponent: [...componentFactories, ...pageFactories],
      container: container,
      window: w
    });
  }
});
