import {describe, test} from 'node:test';
import assert from 'node:assert/strict';
import {DomParser} from '../../../src/DomParser';
import register, {elementDefine, onConnectedInnerHtml, registerSwcAppBody, SwcAppInterface, SwcUtils} from '@dooboostore/simple-web-component'
import {Router} from "@dooboostore/core-web";

describe('DomParser Template Parsing', () => {
  test('simple web component test', async () => {
    const html = `<!DOCTYPE html>
     <html lang="ko">
     <head></head>
     <body id="app" is="swc-app-body">
     <index-router></index-router>
     </body>
     </html>
    `;

    const parser = new DomParser(html);
    const window = parser.window;
    const document = parser.document;

    // const t = (w: Window) => {
    //   @elementDefine('swc-appss-body', {window: w})
    //   class Test extends w.HTMLElement {
    //
    //   }
    //   return Test;
    // }

    const mainPageFactory = (w: Window) => {
      @elementDefine('main-page', {window: w})
      class MainPageRouter extends w.HTMLElement {
        @onConnectedInnerHtml({useShadow: true})
        render() {
          return `<div>Main Page</div>`;
        }
      }
      return MainPageRouter;
    }

    const indexRouterFactory = (w: Window) => {
      const routePaths = ['/', '/threads', '/spaces', '/spaces/{seq}', '/agents', '/agents/{seq}', '/agents/{seq}'];
      @elementDefine('index-router', {window: w})
      class IndexRouter extends w.HTMLElement {
        private routerPathSet?: { path: string; searchParams: URLSearchParams; pathData?: { [p: string]: string } };
        @onConnectedInnerHtml({useShadow: true})
        render(router?: Router) {
          this.routerPathSet = SwcUtils.parsePathPatternsSet(routePaths, router);
          w.console.log('vvvvvvvvvvvvvv', this.routerPathSet);
          return `
          <div>Router Content</div>
          <template id="router" value="{{= $host?.routerPathSet }}" is="swc-choose" skip-if-same>
            <template is="swc-when" test="['','/','/threads'].includes($value?.path)" skip-if-same>
              <main-page></main-page>
            </template>
          </template>
          `;
        }
      }
      return IndexRouter;
    }


    console.log('vvvvvvvvvvv')
    // await register(window, [indexRouterFactory,mainPageFactory]);
    await registerSwcAppBody(window);

    const app = await new Promise(resolve => {
      const app = document.querySelector('#app') as SwcAppInterface;
      // console.log('---------->', app.connect)
      app.connect({
        path:'/',
        window: window,
        routeType: 'path',
        childrenRouteChangedCheckIntervalTime: 300,
        childrenConnectedDoneCheckIntervalTime: 300,
        onEngineStarted: async (app, component) => {
          console.log('Engine started, app connected');
          await register(window, [indexRouterFactory, mainPageFactory]);
          // component.innerHTML = `<index-router/>`;
        }, onChildrenRouteChanged: () => {
          console.log('Children route changed');
          resolve(app);
        }
      })
    })

    // console.log('----vvvv', app)


    console.log(window.customElements.get('swc-app-body'));
    console.log(window.customElements.get('main-page'));
    console.log(window.customElements.get('index-router'));
    console.log(window.customElements.get('swc-choose'));


    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('Document body innerHTML:', document.body.innerHTML);
    //
    // const routerTemplate = doc.body.querySelector('#router');
    // console.log('Router Template exists:', !!routerTemplate);
    // assert.ok(routerTemplate, 'Router template should exist in document');
    //
    // if (routerTemplate) {
    //   const childTemplates = (routerTemplate as any).content.querySelectorAll('template');
    //   console.log('Child templates count:', childTemplates.length);
    //   console.log('Content innerHTML:', (routerTemplate as any).content.innerHTML);
    // }
  });

});
