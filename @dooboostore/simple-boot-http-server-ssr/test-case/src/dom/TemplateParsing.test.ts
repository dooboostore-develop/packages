import {describe, test} from 'node:test';
import assert from 'node:assert/strict';
import {DomParser} from '@dooboostore/dom-parser';
import register, {onConnectedSwcApp, elementDefine, onConnectedInnerHtml, setAttribute, subscribeSwcAppRouteChangeWhileConnected, SwcAppInterface, SwcUtils, query, type SwcChooseInterface, changedAttributeThis} from '@dooboostore/simple-web-component';
import {tagName} from "../../../test-swc/src/pages/index.route";
import {Router, type RouterEventType} from '@dooboostore/core-web'
import {inject} from "@dooboostore/simple-boot/decorators/inject/Inject";
import {UserService} from "../../../test-swc/src/services/UserService";
import {Promises} from "@dooboostore/core";

describe('DomParser Template Parsing',  () => {

  test('swc template in custom element ', async() => {
    const html = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Simple Web Component SSR Test</title>
    </head>
    <body id="app" is="swc-app-body">
        
    </body>
</html>
    `;
    const parser = new DomParser(html);
    const window = parser.window as any;
    const w = window as any;
    const document = parser.document;
    register(window, []);

    /////////////////////////
    const tagName = 'index-route';
    const routePaths = ['/', '/user'];
    @elementDefine(tagName, { window: w })
    class IndexRouteImp extends w.HTMLElement {
      constructor() {
        super();
        console.log('IndexRouteImp constructor called');
      }
      @onConnectedInnerHtml
      render() {
        return `
      <div>
        <h1>index route!!</h1>
      </div>
    `;
      }
    }
    @elementDefine(tagName, { window: w })
    class Imp extends w.HTMLElement {
      constructor() {
        super();
        console.log('UserRoute constructor called', w.customElements.get('index-router'));
      }



      connectedCallback() {
        console.log('-------user-route connectedCallback')
      }

      @onConnectedInnerHtml
      render() {
        console.log('UserRoute render called');
        return `
      <div>
        <h1>user!!!!</h1>
      </div>
    `;
      }
    }
    /////////////////


    @elementDefine('index-router', { window: w })
    class IndexRouterImp extends w.HTMLElement {
      private router?: Router;
      private routerPathSet?: { path: string; pathData?: { [p: string]: string } };

      @query('#router', {root:'all'})
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





    const container = Symbol.for('container')
    const appElement = document.querySelector('#app') as SwcAppInterface;;
    
    console.log('[TEST] appElement found:', appElement?.tagName);
    console.log('[TEST] appElement.connect method exists:', typeof appElement?.connect);
    
    // Use Promise to wait for route change to complete
    await new Promise<void>((resolve, reject) => {
      let routeChangeCount = 0;
      
      appElement.connect({
        path: '/',
        routeType: 'path',
        connectMode: 'direct',
        container: container,
        window: window,
        onEngineStarted: (app, component) => {
          console.log('[TEST] onEngineStarted called, setting innerHTML');
          component.innerHTML = `<index-router l="22"/>`;
          console.log('[TEST] innerHTML set, DOM content:', component.innerHTML);
          const indexRouter = document.querySelector('index-router');
          console.log('[TEST] index-router element found:', indexRouter?.tagName, indexRouter?.constructor.name);
          // w.customElements.upgrade(component);
          console.log('[Root] Engine started');
          // console.log('Router:', component.router);
        },
        onChildrenRouteChanged: (route, app) => {
          routeChangeCount++;
          console.log('[Root] Route changed:', route);
          window.document.querySelector('index-router')?.setAttribute('l', route.path);
          const bodyHTML = document.body.innerHTML;
          console.log('html', bodyHTML)
          console.log(`[TEST] onRouteChanged count ${routeChangeCount}, bodyHTML length: ${bodyHTML.length}`);
          console.log(`[TEST] bodyHTML includes "index route!!": ${bodyHTML.includes('index route!!')}`);
          
          // Assert includes "index route!!" on first route change
          try {
            assert.ok(bodyHTML.includes('index route!!'), 'Body HTML should include "index route!!"');
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      });
    });

  });
});
