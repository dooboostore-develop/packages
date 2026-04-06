import { Sim } from '@dooboostore/simple-boot';
import { elementDefine, onConnectedInnerHtml } from '@dooboostore/simple-web-component';

export const tagName = 'user-route';
export default (w: Window) => {
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;
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
  return tagName;
};
