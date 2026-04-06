import swcRegister, {elementDefine, onConnectedBefore, onConnectedInnerHtml, onInitialize, SwcAppInterface} from '@dooboostore/simple-web-component';
import {SimpleApplication} from "@dooboostore/simple-boot";
import {Router} from "@dooboostore/core-web";

(async ()=> {

  const win = window;

  const indexRouterFactory = (w: Window) => {
    @elementDefine('app-router', { window: w })
    class AppRouter extends HTMLElement {
      constructor() {
        super();
        console.log('-------------------------')
      }

      @onInitialize
      aaaaa(router: Router) {
        console.log('aaaaaa--->', router)
      }
      @onConnectedBefore
      aaa(router: Router) {
        console.log('--->', router)
      }
      @onConnectedInnerHtml({ useShadow: true })
      render() {
        return `aaaaaaa<slot></slot>`;
      }
    }
  }
  const factories = [indexRouterFactory];
  swcRegister(win, factories);
  await win.customElements.whenDefined('swc-app-body');

  const app = document.querySelector('#app') as SwcAppInterface;

  app.connect({
    path:'/',
    routeType: 'path',
    window:win,
    onEngineStarted:(sp: SimpleApplication, app: SwcAppInterface) => {
      console.log('vvv')
      app.innerHTML = app.innerHTML;//`<app-router/>`;
    }
  })
})();

