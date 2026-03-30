import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { Router as WebRouter } from '@dooboostore/core-web/routers/Router';
import { elementDefine, onConnectedInnerHtml } from '@dooboostore/simple-web-component';

export namespace UserRoute {
  export const SYMBOL = Symbol.for('UserRoute');
}

export interface UserRoute {}

export default (w: Window) => {
  const HTMLElement = (w as any).HTMLElement as typeof globalThis.HTMLElement;
  console.log('UserRoute factory called', HTMLElement);
  @Sim({ symbol: UserRoute.SYMBOL })
  @elementDefine('user-route', { window: w })
  class Imp extends HTMLElement implements UserRoute {
    constructor() {
      super();
      console.log('UserRoute constructor called', w.customElements.get('index-router'));
    }
    @onConnectedInnerHtml
    render() {
      return `
      <div>
        <h1>user!!!!</h1>
      </div>
    `;
    }
  }

  return Imp;
};
