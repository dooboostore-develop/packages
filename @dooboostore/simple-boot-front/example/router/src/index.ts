import { Lifecycle, Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { Router as DomRenderRouter } from '@dooboostore/dom-render/routers/Router';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import template from './index.html'
import style from './index.css'
import { Home } from './pages/home/home';
import { RouterAction, RoutingDataSet } from '@dooboostore/simple-boot/route/RouterAction';
import { ComponentRouterBase } from '@dooboostore/simple-boot-front/component/ComponentRouterBase.ts';
import { drComponent } from '@dooboostore/dom-render/components'
import { User } from './pages/user.ts';
import { RandomUtils } from '@dooboostore/core';
import { ProductorRouter } from './pages/productor/productor.router';

@Sim({
  scope: Lifecycle.Transient,
  using: [drComponent]
})
@Router({
  path: '',
  route: {
    '/': Home,
    '/home': Home,
    '/user': User
  },
  routers: [ProductorRouter]
})
@Component({
  template,
  styles: [style]
})
export class Index extends ComponentRouterBase {
  name=RandomUtils.uuid4();
  sw = true;
  constructor(private router: DomRenderRouter) {
    super();
    console.log('constructor IndexComponent', router)
  }

  async go() {
    this.router.go({path: '/user'})
  }

  async test() {
    console.log('test')
  }

  async canActivate(url: RoutingDataSet, data?: any): Promise<void> {
    console.log('canActivate1')
    await super.canActivate(url, data);
    setTimeout(() => {

    console.log('canActivate2', this.child)
    }, 10)
  }

  toggleSw() {
   this.sw=!this.sw;

   // if (!this.sw) {
   //   this.setChild(undefined);
   // }
  }

  onInitRender(...param) {
    // this.child = new ComponentSet(this.home);
    // this.child = new DomRenderComponentSet({name:'sub1'}, '<div><h1>11subthis</h1><div>${@this@.name}$  ${console.log("asas${@this@.name}$")}$ <!-- ${#this#}$--></div></div>')
    // this.child = new DomRenderComponentSet(this.home, '<div><h1>11subthis</h1><div>${@this@.name}$  ${console.log("asas${@this@.name}$")}$ <!-- ${#this#}$--></div></div>')
    // console.log('222222', this.navigation, this.home.name)
    // console.log('33333333333', this.child.obj);
  }
}

