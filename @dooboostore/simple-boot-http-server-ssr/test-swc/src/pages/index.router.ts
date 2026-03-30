import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { Router as WebRouter } from '@dooboostore/core-web/routers/Router';
import {elementDefine, onConnectedInnerHtml, setAttribute} from '@dooboostore/simple-web-component';
import { RouterAction } from '@dooboostore/simple-boot/route/RouterAction';
import { HTMLElement } from '../../../../dom-parser/src/node';
import { RoutingDataSet } from '@dooboostore/simple-boot/route/RouterManager';
import ww, { IndexRoute } from './index.route';
import uu, { UserRoute } from './user.route';

export namespace IndexRouter {
  export const SYMBOL = Symbol.for('IndexRouter');
}

export interface IndexRouter {}

export default (w: Window) => {
  const HTMLElement = (w as any).HTMLElement as typeof globalThis.HTMLElement;

  console.log('router factory called', HTMLElement)
  @Sim({ symbol: IndexRouter.SYMBOL })
  @Router({
    path: '',
    route: {
      '': '/',
      '/': IndexRoute.SYMBOL,
      '/user': UserRoute.SYMBOL,
      // '/': ww(w),
      // '/user': uu(w) //UserRoute.SYMBOL,
    }
  })
  @elementDefine('index-router', { window: w })
  class IndexRouterImp extends HTMLElement implements IndexRouter, RouterAction.CanActivate {
    constructor(private router: WebRouter) {
      super();
      console.log('IndexRouter constructor called', router)
    }

    @setAttribute('#url-text', 'value')
    go(url: string) {
      this.router.go(url);
      return url;
    }
    async canActivate(url: RoutingDataSet, data?: any): Promise<void> {
      console.log('-------ac', data);
      if (data instanceof Node && !this.contains(data)) {
        // data.nodeName='RR-RR'
        console.log('chgange-->', data.nodeName)
        this.replaceChildren(data);
      }
    }


    @onConnectedInnerHtml({ useShadow: true })
    render() {
      return `
      <div>
        <h1>Hello from Simple Web Component SSR!</h1>
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

  return IndexRouterImp;
};
