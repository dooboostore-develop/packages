import LandingPage from './LandingPage';
import ListPage from './ListPage';
import DetailPage from './DetailPage';
import EventDetailPage from './EventDetailPage';
import { Inject, RouterAction, RoutingDataSet } from '@dooboostore/simple-boot';
import { onConnectedBefore, applyInnerHtmlNodeThis, subscribeSwcAppRouteChangeWhileConnected, onInitialize, elementDefine, applyReplaceChildrenNodeThis, onConnectedInnerHtml, setProperty } from '@dooboostore/simple-web-component';
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
      // console.log('vvvvv');
    }

    @onConnectedBefore
    onInitialize(router: Router, @Inject({ symbol: AccommodationService.SYMBOL }) accommodationService: AccommodationService, @Inject({ symbol: EventService.SYMBOL }) eventService: EventService) {
      this.router = router;
      this.accommodationService = accommodationService;
      this.eventService = eventService;
      console.log('onInitialize', this.router, this.accommodationService, this.eventService);
    }

    @setProperty('#router', 'value')
    @subscribeSwcAppRouteChangeWhileConnected(['', '/', '/list', '/event/{eventId}', '/detail/{productId}'])
    routeChanged(re: RouterEventType) {
      console.log('----------------------!@@@@');
      return re;
    }

    @applyReplaceChildrenNodeThis({
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
            <template id="router" is="swc-choose" skip-if-same>
              <!-- Home / Landing -->
              <template is="swc-when" value="{{ ['', '/'].includes($value?.path) }}">
                <swc-example-accommodation-landing-page/>
              </template>
              
              <!-- List -->
              <template is="swc-when" value="{{ $value?.path === '/list' }}">
                <swc-example-accommodation-list-page/>
              </template>
              
              <!-- Event Detail -->
              <template is="swc-when" value="{{ $value?.path.startsWith('/event/') }}">
                <swc-example-accommodation-event-detail-page event-id="{{$value.pathData.eventId}}"/>
              </template>
              
              <!-- Product Detail -->
              <template is="swc-when" value="{{ $value?.path.startsWith('/detail/') }}">
                <swc-example-accommodation-detail-page product-id="{{$value.pathData.productId}}"/>
              </template>
              
              <!-- Not Found / Default -->
              <template is="swc-otherwise">
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; padding: 40px; text-align: center; color: #666;">
                  <h2 style="font-size: 24px; margin: 0 0 10px 0; color: #333;">404 - Page Not Found</h2>
                  <p style="margin: 0 0 20px 0; color: #999;">The page you're looking for doesn't exist.</p>
                  <a href="/" style="padding: 12px 24px; background: #1976d2; color: white; text-decoration: none; border-radius: 4px; font-weight: 600; transition: background 0.3s;">Go Home</a>
                </div>
              </template>
            </template>
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
