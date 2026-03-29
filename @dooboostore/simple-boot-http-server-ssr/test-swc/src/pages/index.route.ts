import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { Router as WebRouter } from '@dooboostore/core-web/routers/Router';
import { elementDefine, onConnectedInnerHtml } from '@dooboostore/simple-web-component';

export namespace IndexRoute {
  export const SYMBOL = Symbol.for('IndexRoute');
}

export interface IndexRoute {}

export default (w: Window) => {
  const HTMLElement = (w as any).HTMLElement as typeof globalThis.HTMLElement;
  @Sim({ symbol: IndexRoute.SYMBOL })
  @elementDefine('index-route', { window: w })
  class IndexRouteImp extends HTMLElement implements IndexRoute {
    // constructor() {
    //   super();
    //   console.log('IndexRouteImp constructor called');
    // }
    @onConnectedInnerHtml
    render() {
      return `
      <div>
        <h1>index route</h1>
      </div>
    `;
    }
  }

  return IndexRouteImp;
};
