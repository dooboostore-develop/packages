import swcRegister, { type SwcAppInterface } from '@dooboostore/simple-web-component';
import {componentFactories} from './component';
import {pageFactories} from './pages';
import {serviceFactories} from './services';
import {ValidUtils} from '@dooboostore/core-web';
import {UrlUtils} from '@dooboostore/core';

export default async (w: Window, other: Map<symbol, any> | ((c: symbol) => void)[] = [], path?: string) => {
  const container = Symbol('container');
  const isClient = ValidUtils.isBrowser();
  const isServer = !isClient;

  // 1. Initialize Services
  const otherServiceFactories = Array.isArray(other) ? other : [];
  const otherInstanceSim = !Array.isArray(other) ? other : new Map<symbol, any>();
  [...otherServiceFactories, ...serviceFactories].forEach(it => it(container));

  // 2. Register SWC App
  await swcRegister(w);

  const appElement = w.document.querySelector('#app') as SwcAppInterface | null;
  if (!appElement || typeof appElement.connect !== 'function') {
    throw new Error('[test-swc] Failed to initialize SWC App: #app element not found.');
  }

  const currentPath = path ?? UrlUtils.getUrlPath(w.location) ?? '/';

  return new Promise<{ app: SwcAppInterface }>((resolve, reject) => {
    let onChildrenConnectedDoneInvoked = false;
    let onChildrenRouteChangedInvoked = false;

    if (isClient) {
      // onChildrenRouteChangedInvoked = true;
    }

    const checkAndResolve = () => {
      if (onChildrenConnectedDoneInvoked && onChildrenRouteChangedInvoked) {
        resolve({ app: appElement });
      }
    };

    // SSR Safety Timeout
    let timeout: NodeJS.Timeout;
    if (isServer) {
      timeout = setTimeout(() => {
        console.warn('[test-swc] SSR Timeout reached, resolving with current state');
        resolve({ app: appElement });
      }, 3000);
    }

    try {
      appElement.connect({
        path: currentPath,
        routeType: 'path',
        ssr: true,
        container: container,
        window: w,
        otherInstanceSim: otherInstanceSim,
        onStartedLazyDefineComponent: [...componentFactories, ...pageFactories],
        onChildrenConnectedDone: () => {
          onChildrenConnectedDoneInvoked = true;
          checkAndResolve();
        },
        onChildrenRouteChanged: (route) => {
          console.log(`[test-swc] onChildrenRouteChanged: ${route?.path}`);
          onChildrenRouteChangedInvoked = true;
          checkAndResolve();
        }
      });
    } catch (error) {
      if (timeout!) clearTimeout(timeout);
      reject(error);
    }
  });
};
