import {
  elementDefine,
  onConnectedBodyShadow,
  onConnectedBefore,
  subscribeSwcAppRouteChangeWhileConnected,
  replaceChildrenLight,
  htmlFragment, onInitialize
} from '@dooboostore/simple-web-component';
import { Router, type RouterEventType } from '@dooboostore/core-web';
import { IndexRoute } from './indexRoute';
import { UserRoute } from './userRoute';

export const tagName = 'index-router';

export default (w: Window) => {
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class IndexRouterImp extends w.HTMLElement {
    private router?: Router;

    @onInitialize
    onInit(router: Router) {
      this.router = router;
    }

    @onConnectedBefore
    async onConnectedSwcApp() {
      console.log('[test-swc] IndexRouter connected (SSR)');
    }

    @replaceChildrenLight
    @subscribeSwcAppRouteChangeWhileConnected(['', '/'])
    handleHome() {
      console.log('[test-swc] IndexRouter handleHome');
      return IndexRoute(w);
    }

    @replaceChildrenLight
    @subscribeSwcAppRouteChangeWhileConnected('/user')
    handleUser() {
      console.log('[test-swc] IndexRouter handleUser');
      return UserRoute(w);
    }

    @replaceChildrenLight
    @subscribeSwcAppRouteChangeWhileConnected(['/{tail:.*}'], { order: 999 })
    handle404(routerPathSet: RouterEventType) {
      console.log('[test-swc] IndexRouter handle404:', routerPathSet.path);
      return htmlFragment(`
        <div style="padding: 40px; text-align: center;">
          <h1 style="font-size: 64px; color: #ff385c;">404</h1>
          <p>Page Not Found: ${routerPathSet.path}</p>
          <button swc-on-click="$host.go('/')" style="margin-top: 20px; padding: 10px 20px; border-radius: 8px; border: none; background: #222; color: white; cursor: pointer;">Go Home</button>
        </div>
      `, w.document);
    }

    go(url: string) {
      console.log('------>', url)
      this.router?.go(url);
    }

    @onConnectedBodyShadow
    render() {
      console.log('vvvvvvvvvvvvvvv')
      return `
      <style>
        :host { display: block; min-height: 100vh; background: #f7f7f7; }
        header { 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          padding: 0 40px; 
          height: 80px; 
          background: #fff; 
          border-bottom: 1px solid #eee; 
          position: sticky; 
          top: 0; 
          z-index: 10;
        }
        .logo { font-size: 24px; font-weight: 800; color: #ff385c; cursor: pointer; }
        nav { display: flex; gap: 24px; }
        nav button { background: none; border: none; font-size: 16px; font-weight: 600; cursor: pointer; color: #222; }
        nav button:hover { color: #ff385c; }
        main { padding: 40px; }
      </style>
      <header>
        <div class="logo" swc-on-click="$host.go('/')">SWC-SSR</div>
        <nav>
          <button swc-on-click="$host.go('/')">Home</button>
          <button swc-on-click="$host.go('/user')">Users</button>
        </nav>
      </header>
      <main>
        <slot></slot>
      </main>
    `;
    }
  }

  return tagName;
};
