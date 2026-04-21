import {
  setAttribute,
  publishSwcAppMessage,
  subscribeSwcAppMessageWhileConnected,
  type SwcAppMessage,
  changedAttributeThis,
  applyNode,
  addEventListenerThis,
  emitCustomEventThis,
  updateClass,
  innerHtmlNode,
  addEventListener,
  applyNodeThis,
  attributeThis,
  query,
  replaceChildrenNodeThis,
  onConnected,
  elementDefine,
  onConnectedBefore,
  setProperty,
  subscribeSwcAppRouteChangeWhileConnected,
  SwcChooseInterface,
  SwcUtils,
  innerHtmlLightNodeThis, replaceChildrenLightNodeThis, htmlFragment
} from '@dooboostore/simple-web-component';
import { Router, type RouterEventType } from '@dooboostore/core-web';
import {IndexRoute} from "./indexRoute";
import {UserRoute} from "./userRoute";

export const tagName = 'index-router';
export default (w: Window) => {
  const routePaths = ['/', '/user', '/{other:.*}'];
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;
  @elementDefine('index-router', { window: w })
  class IndexRouterImp extends w.HTMLElement {
    private router?: Router;


    constructor() {
      super();
      console.log('index.router constructor called');
    }

    @onConnectedBefore
    async onConnectedSwcApp(router: Router
                            // , @inject(UserService.SYMBOL) gg: UserService
    ) {
      this.router = router;
      // this.titlea(new Date().toISOString());
      // await Promises.sleep(0);
      // gg?.sayHello();
      // console.log('vvvvvvvvvvvvvvvvvvvvv', gg);

      // console.log('index.router onConnectedSwcApp', router.value);
    }

    @setAttribute('#title', 'value')
    titlea(title: string) {
      return title;
    }

    @setAttribute('#url-text', 'value')
    go(url: string) {
      this.router?.go(url);
      return url;
    }

    static get observedAttributes() {
      return ['c', 'l'];
    }

    attributeChangedCallback(na: any, o: any, n: any) {
      // console.log('-----------------index.router attr origin', na, o, n);
    }

    @changedAttributeThis('c')
    tt22(tt: any) {
      // console.log('----->', tt);
    }

    @subscribeSwcAppRouteChangeWhileConnected(routePaths)
    @replaceChildrenLightNodeThis
    async routeChanged(router: RouterEventType) {
      console.log('rrrrrrrrrrrr', router);
      if (['','/'].includes(router.path)) {
        return IndexRoute(w);
      } else if (['/user'].includes(router.path)) {
        return UserRoute(w)
      } else {
        return htmlFragment(`<div class="aa-error">
        <i class="fa-solid fa-compass aa-error-icon" aria-hidden="true"></i>
        <h1>404</h1>
        <p>요청한 경로가 없습니다.</p>
        `, w.document)
      }
    }

    connectedCallback(){
      // console.log('index.router render  innerhtml origin');
    };
    @onConnected({ ssrFirst: true, useShadow: true })
    render() {
      return `
      <div>
        <h1>Hello from Simple Web Component SSR!</h1>
        <p><input id="title" type="text"></p>
        <p><input id="url-text" type="text"></p>
      <nav>
        <button swc-on-click="$host.go('/')">/</button>
        <button swc-on-click="$host.go('/user')">/user</button>
      </nav>
      <section>
        <slot></slot>
      </section>
      </div>
    `;
    }

  }

  return tagName;
};
