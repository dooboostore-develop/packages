import {
  addEventListener,
  insertBeforeEndLight,
  createElement,
  CreateElementConfig,
  elementDefine,
  onConnectedBodyShadow,
  onConnectedBefore,
  onInitialize,
  attribute
} from '@dooboostore/simple-web-component';
import { inject } from '@dooboostore/simple-boot';
import { UserService } from '../services/UserService';
import { UserCard } from '../component/UserCard';

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
  class IndexRouteImp extends w.HTMLElement implements IndexRoute {
    @attribute('next-cursor')
    nextCursor?: string;

    private userService?: UserService;

    @onInitialize
    init(@inject(UserService.SYMBOL) userService: UserService) {
      this.userService = userService;
    }

    @addEventListener('#next-btn', 'click', { root: 'shadow' })
    onNextClick() {
      this.load();
    }

    @onConnectedBefore({ ssrFirst: true })
    @insertBeforeEndLight()
    async load() {
      if (!this.userService) return;
      
      const users = await this.userService.getUsers({
        nextCursor: this.nextCursor, 
        limit: 1
      });

      const userElements = users.datas.map(it => UserCard(w, { attrs: it }));
      const last = users.datas[users.datas.length - 1];
      if (last?.seq) {
        this.nextCursor = String(last.seq);
      }
      
      return userElements;
    }

    @onConnectedBodyShadow({ ssrFirst: true })
    render() {
      return `
      <style>
        .page-header { margin-bottom: 24px; }
        #next-btn { 
          padding: 12px 24px; 
          border-radius: 8px; 
          border: none; 
          background: #ff385c; 
          color: white; 
          font-weight: 700; 
          cursor: pointer;
          transition: transform 0.2s;
        }
        #next-btn:active { transform: scale(0.95); }
      </style>
      <div>
        <div class="page-header">
          <h1>Index Route</h1>
          <p>Click the button to load more users via SSR/Client mixed flow.</p>
          <button id="next-btn">Load Next User</button>
        </div>
        <div class="user-list">
          <slot></slot>
        </div>
      </div>
    `;
    }
  }

  return tagName;
};
