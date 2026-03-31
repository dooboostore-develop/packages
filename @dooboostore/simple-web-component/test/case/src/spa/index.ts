import { Inject } from '@dooboostore/simple-boot/decorators/inject/Inject';

console.log('rootstart');
import swcRegister, { addEventListener, elementDefine, HostSet, InjectSituationType, onConnectedInnerHtml, onAdopted, onConnected, onDisconnected, query } from '@dooboostore/simple-web-component';

swcRegister(window);
import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { Sim } from '@dooboostore/simple-boot';
import { Router as WebRouter } from '@dooboostore/core-web/routers/Router';
import { Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { RouterAction } from '@dooboostore/simple-boot/route/RouterAction';
import { RoutingDataSet } from '@dooboostore/simple-boot/route/RouterManager';
import createMyComponent from './MyComponent';
import { SwcAttributeConfigType } from '@dooboostore/simple-web-component/elements/SwcAppEngine';

const w = window;
const MyComponent = createMyComponent(w);

@Sim
@elementDefine('my-component2', { window: w })
class MyComponent2 extends HTMLElement {
  say() {
    console.log('hello MyComponent2');
  }

  @onConnectedInnerHtml
  render() {
    return `
      <div style="padding: 10px; border: 1px solid #ccc;">
        <h3>My Component2</h3>
      </div>
    `;
  }
}

@Sim
@Router({
  path: '/hello',
  route: {
    '/good': MyComponent,
    '/good2': MyComponent2
  }
})
@elementDefine('my-router', { window: w })
class MyRouter extends HTMLElement implements RouterAction.CanActivate {
  @query('#my-route')
  myRoute!: HTMLElement;

  @onConnectedInnerHtml
  render() {
    return `
      <div style="padding: 10px; border: 1px solid #ccc;">
        <h3>My Router</h3>
        <div id="my-route"></div>
      </div>
    `;
  }

  async canActivate(url: RoutingDataSet, data?: any): Promise<void> {
    console.log('canActivate', url, data, '---');
    if (data instanceof Node && !this.myRoute.contains(data)) {
      this.myRoute.replaceChildren(data);
    }
  }
}

@Sim
@Router({
  routers: [MyRouter]
})
@elementDefine('root-router', { window: w })
class RootRouter extends HTMLDivElement implements RouterAction.CanActivate {
  route = '';
  name = 'Root Name';

  constructor(
    private router: WebRouter,
    private sim: SimpleApplication
  ) {
    super();
    console.log('----------', this.router, this.sim);
  }

  async canActivate(url: RoutingDataSet, data?: any): Promise<void> {
    console.log('canActivate', url, data, '---');
    this.route = url.intent.pathname;
    if (data instanceof Node && !this.contains(data)) {
      this.replaceChildren(data);
    }
  }

  @addEventListener('#route-btn', 'click')
  onRouteBtnClick() {
    this.name = 'Changed Root ' + new Date().getSeconds();
    this.router.go('/hello/good');
  }

  @onConnectedInnerHtml({ useShadow: true })
  render() {
    return `
      <div class="container">
        <h3>Root Router</h3>
        <p>Current Route: <strong>${this.route}</strong></p>
        <p>Current Name: <strong>${this.name}</strong></p>
        <button id="route-btn">Route to /hello/good</button>
        <slot></slot>
      </div>
    `;
  }
}

@elementDefine('test-component', { window: w })
class TestComponent extends HTMLElement {
  @onConnectedInnerHtml
  render() {
    return `<div>test-component</div>`;
  }

  @onDisconnected
  ttt(@Inject({ situationType: InjectSituationType.HOST_SET }) hostSet: HostSet, @Inject({ type: WebRouter }) router: WebRouter) {
    console.log('TestComponent onDisconnected', hostSet, router);
  }

  @onConnected
  good(@Inject({ situationType: InjectSituationType.HOST_SET }) hostSet: HostSet, @Inject({ type: WebRouter }) router: WebRouter) {
    console.log('TestComponent onConnected', hostSet, router);
  }
}

console.log('startss');
export const wow = () => {
  console.log('wow');
};
export const applicationConfig = (app: any): SwcAttributeConfigType => {
  return {
    rootRouter: RootRouter,
    path: '/hello/good2',
    window: w
  };
};
(w as any).applicationConfig = applicationConfig;
(w as any).wow = wow;

document.addEventListener('DOMContentLoaded', () => {
  const config = {
    rootRouter: RootRouter,
    path: '/hello/good2',
    window: w
  };;
  const app = document.querySelector('#app');
  (app as any).connect(config)
})