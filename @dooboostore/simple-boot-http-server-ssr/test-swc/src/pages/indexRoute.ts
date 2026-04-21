import {addEventListener, afterBeginNodeThis, beforeEndLightNodeThis, attributeThis, createElement, CreateElementConfig, elementDefine, onConnected, onConnectedBefore, onInitialize} from '@dooboostore/simple-web-component';
import {inject} from "@dooboostore/simple-boot";
import {UserService} from "../services/UserService";
import {UserCard} from "../component/UserCard";


export const tagName = 'index-route';
export interface IndexRoute extends HTMLElement {
   nextCursor?: string;
}
export const IndexRoute = (w: Window, data?: CreateElementConfig) => {
  return createElement<IndexRoute>(w, tagName, data);
}
export default (w: Window) => {
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;
  @elementDefine(tagName, { window: w })
  class IndexRouteImp extends w.HTMLElement implements IndexRoute{
    @attributeThis('next-cursor')
    nextCursor?: string;
    private userService?: UserService;

    constructor() {
      super();
      console.log('IndexRouteImp constructor called');
    }

    @onInitialize
    init(@inject(UserService.SYMBOL) userService: UserService) {
     this.userService = userService;
    }

    @addEventListener('#next-btn', 'click')
    onNextClick() {
      console.log('Next button clicked');
      this.load();
    }

    @onConnectedBefore({ssrFirst: true})
    @beforeEndLightNodeThis
    async load() {
      console.log('userservice', this.userService, this.nextCursor);
      const users = await this.userService?.getUsers({nextCursor: this.nextCursor, limit: 1});
      const userElements = users?.datas.map(it => UserCard(w, {attrs: it}))
      const last = users?.datas.pop();
      if (last?.seq)
        this.nextCursor = String(last.seq);
      console.log('----------userEle', users?.datas, userElements);
      return userElements;
    }

    @onConnected({ ssrFirst: true, useShadow: true})
    render() {
      return `
      <div>
        <h1>index route!!</h1>
        <button id="next-btn">next</button>
        <slot></slot>
      </div>
    `;
    }
  }

  return tagName;
};
