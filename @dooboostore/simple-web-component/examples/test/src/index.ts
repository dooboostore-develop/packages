import 'reflect-metadata';
import { SwcAppInterface } from '@dooboostore/simple-web-component';
import { UrlUtils } from "@dooboostore/core";
import { componentFactories } from "./components";
import { pageFactories  } from "./pages";
import { defineSwcAppBody} from "@dooboostore/simple-web-component";
import {serviceFactories} from "./services";
const w = window;

w.document.addEventListener('DOMContentLoaded', async () => {
  const container = Symbol('container');

  serviceFactories.forEach(s => s(container));

  await defineSwcAppBody(w)
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
