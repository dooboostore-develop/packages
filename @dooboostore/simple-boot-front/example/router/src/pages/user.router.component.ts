import { Component, ComponentRouterBase, Sim } from '@dooboostore/simple-boot-front';
import { Router as DomRenderRouter } from '@dooboostore/dom-render';
import { Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { Lifecycle } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { User } from './user';


@Sim({
  scope: Lifecycle.Transient
})
@Component({
  template:'<dr-this value="${@this@?.child}$"></dr-this>'
})
@Router({
  path:'/user',
  route: {
    '': User
  }
})
export class UserRouterComponent extends ComponentRouterBase {
  constructor(private router: DomRenderRouter) {
    super();
    console.log('constructor UserRouterComponent', router)
  }

  async go() {
    this.router.go({path: '/user'})
  }

}

