import {
  publishSwcAppMessage,
  subscribeSwcAppMessageWhileConnected,
  type SwcAppMessage,
  changedAttribute,
  applyNode,
  addEventListenerThis,
  emitCustomEventThis,
  updateClass,
  innerHtml,
  addEventListener,
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
} from '@dooboostore/simple-web-component';
import {IndexRoute} from "../pages/indexRoute";



export const tagName = 'user-card';
export interface UserCard {
}
export const UserCard = (w: Window, data?: CreateElementConfig) => {
  return createElement<IndexRoute>(w, tagName, data);
}
export default (w: Window) => {
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;
  @elementDefine(tagName, { window: w })
  class Imp extends w.HTMLElement  implements UserCard{
    @attribute
    name?: string;
    @attribute
    email?: string;

    say() {
      return 'hello';
    }

    @onConnected({ useShadow: true})
    render() {
      return `
      <style>
      </style>
      <div>
        <h1>user info</h1>
               <h1>${this.name}</h1>
       <p>${this.email}</p>
<!--        <slot></slot>-->
      </div>
    `;
    }

    // @onConnected({ ssrFirst: true , useShadow: false})
    // rr () {
    //   return `
    //    <h1>${this.name}</h1>
    //    <p>${this.email}</p>
    //
    //   `
    // }


    @addEventListener('#btn', 'click', { root: 'light' })
    aa() {
      alert(1);
    }
  }

  return tagName;
}
