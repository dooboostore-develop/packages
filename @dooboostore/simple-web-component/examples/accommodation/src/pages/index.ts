import LandingPage from './LandingPage';
import ListPage from './ListPage';
import DetailPage from './DetailPage';
import EventDetailPage from './EventDetailPage';
import { Inject, RouterAction, RoutingDataSet } from '@dooboostore/simple-boot';
import { onConnectedSwcApp, applyInnerHtmlNodeHost, subscribeSwcAppRouteChange, onInitialize, elementDefine, applyReplaceChildrenNodeHost, onConnectedInnerHtml } from '@dooboostore/simple-web-component';
import { Router, type RouterEventType } from '@dooboostore/core-web';
import { AccommodationService, EventService } from '../services';

export * from './LandingPage';
export * from './ListPage';
export * from './DetailPage';
export * from './EventDetailPage';


const indexPageFactory = (w: Window) => {
  const tagName = 'accommodation-root-router';
  const existing = w.customElements.get(tagName);
  if (existing) {
    return tagName;
    //   Sim({ container: container })(existing);
    //   return existing;
  }

  @elementDefine(tagName, { window: w })
  class RootRouter extends w.HTMLElement {
    private router: Router;
    private accommodationService: AccommodationService;
    private eventService: EventService;

    constructor() {
      super();
      console.log('vvvvv');
    }

    @onConnectedSwcApp
    onInitialize(router: Router, @Inject({ symbol: AccommodationService.SYMBOL }) accommodationService: AccommodationService, @Inject({ symbol: EventService.SYMBOL }) eventService: EventService) {
      this.router = router;
      this.accommodationService = accommodationService;
      this.eventService = eventService;
      console.log('onInitialize', this.router, this.accommodationService, this.eventService);
    }

    @subscribeSwcAppRouteChange('/detail/{productId}')
    @applyInnerHtmlNodeHost({ root: 'light' })
    detailRoute(a: RouterEventType, pathData: any) {
      return `<swc-example-accommodation-detail-page product-id="${pathData.productId}"/>`;
    }

    @subscribeSwcAppRouteChange('/event/{eventId}')
    @applyInnerHtmlNodeHost({ root: 'light' })
    eventRoute(a: RouterEventType, pathData: any) {
      return `<swc-example-accommodation-event-detail-page event-id="${pathData.eventId}"/>`;
    }

    @subscribeSwcAppRouteChange('/list')
    @applyInnerHtmlNodeHost({ root: 'light' })
    listRoute(a: RouterEventType, pathData: any) {
      return `<swc-example-accommodation-list-page/>`;
    }

    @subscribeSwcAppRouteChange(['', '/'])
    @applyInnerHtmlNodeHost({ root: 'light' })
    indexRoute(a: RouterEventType, pathData: any) {
      return `<swc-example-accommodation-landing-page/>`;
    }

    @applyReplaceChildrenNodeHost({
      root: 'light',
      filter: (host, newNode) => !host.contains(newNode)
    })
    renderContent(node: Node) {
      return node;
    }
    @onConnectedInnerHtml({ useShadow: true })
    render() {
      return `
          <style>
            * { box-sizing: border-box; }
            :host { display: flex; flex-direction: column; min-height: 100vh; width: 100%; background: #fff; }
            #page-container { flex: 1; display: flex; flex-direction: column; width: 100%; }
            footer { 
              padding: 48px 80px; 
              border-top: 1px solid #EEE; 
              background: #F7F7F7; 
              color: #717171; 
              font-size: 14px;
            }
            @media (max-width: 768px) {
              footer { padding: 32px 20px; }
            }
          </style>
          <swc-example-accommodation-header on-navigate="$host.onHeaderNavigate(event, $data)"></swc-example-accommodation-header>
          <main id="page-container">
            <slot></slot>
          </main>
          <footer>
            <div style="max-width: 1440px; margin: 0 auto; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
              <div>© 2024 STAY LUXE, Inc. · 개인정보 처리방침 · 이용약관 · 사이트맵</div>
              <div style="display: flex; gap: 24px; font-weight: 600; color: #222;">
                <span>한국어 (KR)</span>
                <span>KRW</span>
              </div>
            </div>
          </footer>
        `;
    }

    onHeaderNavigate(event: CustomEvent, data: any) {
      if (data?.path) {
        this.router.go(data.path);
      }
    }
  }

  return tagName;
};
export const pageFactories = [indexPageFactory, LandingPage, ListPage, DetailPage, EventDetailPage];
