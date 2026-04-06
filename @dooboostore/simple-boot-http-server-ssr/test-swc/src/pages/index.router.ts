import { changedAttributeThis, elementDefine, onConnectedInnerHtml, onConnectedSwcApp, query, setAttribute, subscribeSwcAppRouteChangeWhileConnected, type SwcChooseInterface, SwcUtils } from '@dooboostore/simple-web-component';
import { Router, type RouterEventType } from '@dooboostore/core-web';
import { Promises } from '@dooboostore/core';
import { inject, Inject } from '@dooboostore/simple-boot';
import { UserService } from '../services/UserService';

export const tagName = 'index-router';
export default (w: Window) => {
  const routePaths = ['/', '/user'];
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;
  @elementDefine('index-router', { window: w })
  class IndexRouterImp extends w.HTMLElement {
    private router?: Router;
    private routerPathSet?: { path: string; pathData?: { [p: string]: string } };

    @query('#router',{ root: 'light' })
    routerChooseTemplate!: SwcChooseInterface;

    constructor() {
      super();
      console.log('index.router constructor called');
    }

    @onConnectedSwcApp
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

    @setAttribute('#url-text', 'value')
    @subscribeSwcAppRouteChangeWhileConnected(routePaths)
    async routeChanged(router: RouterEventType) {
      // await Promises.sleep(2000);
      this.routerPathSet = router;
      this.routerChooseTemplate?.refresh?.();
      // console.log('index.router rrrrrrrrrrrrrrrrrrrrrrrrr', this.routerChooseTemplate?.refresh);
      // setTimeout(() => {
      //   console.log('!!', this.routerChooseTemplate?.refresh);
      // }, 1000);

      return this.routerPathSet.path;
    }

    connectedCallback(){
      // console.log('index.router render  innerhtml origin');
    };
    @onConnectedInnerHtml({ useShadow: true })
    render(router?: Router) {
      // console.log('index.router render  innerhtml');
      this.routerPathSet = SwcUtils.parsePathPatternsSet(routePaths, router?.value?.path ?? '/');
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

    @onConnectedInnerHtml
    slotHTML() {
      return `
        <template id="router" value="{{= $host?.routerPathSet }}" is="swc-choose">
          <template is="swc-when" value="{{ ['','/'].includes($value?.path) }}" skip-if-same>
            <index-route />
          </template>
          <template is="swc-when" value="{{ ['/user'].includes($value?.path) }}" skip-if-same>
            <user-route />
          </template>
        </template>
      `
    }
  }

  return tagName;
};
