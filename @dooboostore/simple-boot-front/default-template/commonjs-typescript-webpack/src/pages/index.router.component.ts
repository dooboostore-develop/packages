import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { ComponentRouterBase } from '@dooboostore/simple-boot-front/component/ComponentRouterBase';
import template from './index.router.component.html';
import style from './index.router.component.css';
import { HomeRouteComponent } from './home/home.route.component';
import { UserRouteComponent } from './user/user.route.component';
import { HelloComponent } from '../components/hello.component';

@Sim({
  using: [HelloComponent]
})
@Router({
  path: '',
  route: {
    '/': HomeRouteComponent,
    '/user': UserRouteComponent
  }
})
@Component({
  template,
  styles: [style]
})
export class IndexRouterComponent extends ComponentRouterBase {
  constructor() {
    super();
    console.log('🚀 Simple Boot Front App Started!');
  }
}
