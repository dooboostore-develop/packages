import { Sim } from '@dooboostore/simple-boot';
import {
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
  appendHtmlSlot,
  applyNodeThis,
  attributeThis,
  query,
  replaceChildrenNodeThis,
  onConnected,
  elementDefine,
  onConnectedBefore,
  setProperty,
  subscribeSwcAppRouteChangeWhileConnected,
  CreateElementConfig,
  createElement,
  onConnectedLight,
  onConnectedShadow, state,
} from '@dooboostore/simple-web-component';
import {IndexRoute} from "./indexRoute";

export const tagName = 'user-route';
export interface UserRoute extends HTMLElement {

}
export const UserRoute = (w: Window, data?: CreateElementConfig) => {
  return createElement<UserRoute>(w, tagName, data);
}
export default (w: Window) => {
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;
  @elementDefine(tagName, { window: w })
  class Imp extends w.HTMLElement implements UserRoute{
    constructor() {
      super();
      console.log('UserRoute constructor called', w.customElements.get('index-router'));
    }



    @addEventListener('.test-btn', 'click')
    // @applyNodeThis
    @appendHtmlSlot('zzz')
    onTestClick() {
      console.log('test button clicked');
      this.ggg = new Date().toISOString()+'----------'
      return '<div>aaaaaaaa</div>'
    }

    connectedCallback() {
      console.log('-------user-route connectedCallback')
    }

    @state
    ggg = 'zzzzz';

    @state
    ccc(a: any) {
      console.log('------>',a, this)
    }

    @onConnectedLight
    gg(){
      return `
      <div>777777777777777777</div>
      `
    }


    @onConnectedShadow
    render() {
      console.log('UserRoute render called');
      return `
      <div>
        <h1>user!!!!</h1>
        <button class="test-btn">dddddddddddddd</button>
        <!--[[ zzz ]] -->
        [<slot></slot>]
        <!--[text @ggg@]-->
        <input type="text" size="5555"  a::value="@ggg@" e::click="@$this@.ggg = (11+this)" >
      </div>
    `;
    }
  }
  return tagName;
};
