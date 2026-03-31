import MainPage from './MainPage';
import DetailPage from './DetailPage';
import { applyReplaceChildrenNodeHost, applyInnerHtmlNodeHost, subscribeSwcAppRouteChange, onInitialize, elementDefine, onConnectedInnerHtml } from '@dooboostore/simple-web-component';
import { Inject } from '@dooboostore/simple-boot';
import { Router, type RouterEventType } from '@dooboostore/core-web';
import { StockService } from '../services/StockService';

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

    @onInitialize
    onconstructor(
      @Inject({ symbol: StockService.SYMBOL }) stockService: StockService,
      router: Router
    ) {
      this.stockService = stockService;
      this.router = router;
    }

    @subscribeSwcAppRouteChange(['', '/'])
    @applyInnerHtmlNodeHost({ root: 'light' })
    mainRoute(a: RouterEventType, pathData: any) {
      return `<swc-example-stock-main-page/>`;
    }

    @subscribeSwcAppRouteChange('/detail/{id}')
    @applyInnerHtmlNodeHost({ root: 'light' })
    detailRoute(a: RouterEventType, pathData: any) {
      return `<swc-example-stock-detail-page stock-id="${pathData.id}"/>`;
    }

    @applyReplaceChildrenNodeHost({
      root: 'light',
      filter: (host, newNode) => !host.contains(newNode)
    })
    renderContent(node: Node) {
      return node;
    }

    navigate(path: string): void {
      this.router.go(path);
    }

    @onConnectedInnerHtml({ useShadow: true })
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
