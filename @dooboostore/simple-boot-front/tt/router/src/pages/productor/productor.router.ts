import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { Router as DomRenderRouter } from '@dooboostore/dom-render/routers/Router';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { ComponentRouterBase } from '@dooboostore/simple-boot-front';
import { Lifecycle} from '@dooboostore/simple-boot/decorators/SimDecorator';
import { IphoneRoute } from './iphone.route';
@Sim({
  scope: Lifecycle.Transient,
})
@Router({
  path: '/productor',
  route: {
    '/iphone': IphoneRoute
  }
})
@Component({
  template: '[<dr-this value="${@this@.child}$"></dr-this>]',
})
export class ProductorRouter extends ComponentRouterBase {
  constructor(private router: DomRenderRouter) {
    super();
    // console.log('constructor ProductorRouter', router)
  }

  async go() {
    this.router.go({path: '/user'})
  }

  async test() {
    console.log('test')
  }

  onInitRender(...param) {
    // this.child = new ComponentSet(this.home);
    // this.child = new DomRenderComponentSet({name:'sub1'}, '<div><h1>11subthis</h1><div>${@this@.name}$  ${console.log("asas${@this@.name}$")}$ <!-- ${#this#}$--></div></div>')
    // this.child = new DomRenderComponentSet(this.home, '<div><h1>11subthis</h1><div>${@this@.name}$  ${console.log("asas${@this@.name}$")}$ <!-- ${#this#}$--></div></div>')
    // console.log('222222', this.navigation, this.home.name)
    // console.log('33333333333', this.child.obj);
  }
}

