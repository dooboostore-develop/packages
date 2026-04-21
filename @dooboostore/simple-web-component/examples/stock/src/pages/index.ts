import MainPage from './MainPage';
import DetailPage from './DetailPage';
import {replaceChildrenNodeThis, elementDefine, onConnectedBefore, onConnectedShadow, setProperty, subscribeSwcAppRouteChangeWhileConnected} from '@dooboostore/simple-web-component';
import {Inject} from '@dooboostore/simple-boot';
import {Router, type RouterEventType} from '@dooboostore/core-web';
import {StockService} from '../services/StockService';
import {innerHtmlLightNodeThis} from "../../../../src";

export * from './MainPage';
export * from './DetailPage';

/**
 * Root Router Factory - Main routing hub
 */
export const rootRouterFactory = (w: Window) => {
  const tagName = 'stock-root-router';
  const existing = w.customElements.get(tagName);
  if (existing) {
    return tagName;
  }
  @elementDefine(tagName, { window: w })
  class RootRouter extends w.HTMLElement {
    private stockService: StockService;
    private router: Router;

    constructor() {
      super();
      console.log('stock-root-routerstock-root-routerstock-root-router');
    }

    @onConnectedBefore
    onconstructor(@Inject({ symbol: StockService.SYMBOL }) stockService: StockService, router: Router) {
      this.stockService = stockService;
      this.router = router;
    }

    @innerHtmlLightNodeThis
    @subscribeSwcAppRouteChangeWhileConnected(['','/', '/detail/{id}'])
    routeChanged(routerPathSet: RouterEventType) {
      if (['', '/'].includes(routerPathSet.path)) {
        return `<swc-example-stock-main-page/>`
      } else if (routerPathSet.path.startsWith('/detail/')) {
        return `<swc-example-stock-detail-page stock-id="${routerPathSet.pathData.id}"/>`
      } else {
        return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; padding: 40px; text-align: center; color: #666;">
                <h2 style="font-size: 24px; margin: 0 0 10px 0; color: #333;">404 - Page Not Found</h2>
                <p style="margin: 0 0 20px 0; color: #999;">The page you're looking for doesn't exist.</p>
                <a href="/" style="padding: 12px 24px; background: #1976d2; color: white; text-decoration: none; border-radius: 4px; font-weight: 600; transition: background 0.3s;">Go Home</a>
              </div>`
      }


    }

    @replaceChildrenNodeThis({
      root: 'light',
      filter: (host, newNode) => !host.contains(newNode)
    })
    renderContent(node: Node) {
      return node;
    }

    navigate(path: string): void {
      this.router.go(path);
    }

    @onConnectedShadow
    render() {
      return `
        <style>
          * { box-sizing: border-box; }
          :host { display: flex; flex-direction: column; min-height: 100vh; width: 100%; background: #fff; }
          #page-container { flex: 1; display: flex; flex-direction: column; width: 100%; }
        </style>
        <swc-example-stock-stock-header on-navigate="$host.navigate($data.path)"></swc-example-stock-stock-header>
        <main id="page-container">
          <slot></slot>
        </main>
      `;
    }
  }

  return tagName;
};

export const pageFactories = [MainPage, DetailPage, rootRouterFactory];
