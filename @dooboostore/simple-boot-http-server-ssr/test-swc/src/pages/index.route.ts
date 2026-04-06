import { Sim } from '@dooboostore/simple-boot';
import { elementDefine, onConnectedInnerHtml } from '@dooboostore/simple-web-component';


export const tagName = 'index-route';
export default (w: Window) => {
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;
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

  return tagName;
};
