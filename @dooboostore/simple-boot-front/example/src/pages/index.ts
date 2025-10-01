import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { Router as DomRenderRouter } from '@dooboostore/dom-render/routers/Router';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { ComponentRouterBase } from '@dooboostore/simple-boot-front/component/ComponentRouterBase';
import { drComponent } from '@dooboostore/dom-render/components/index';
import template from './index.html';
import style from './index.css';
import { Home } from './home/home';
import { User } from './user/user';
import { About } from './about/about';
import { ItemComponent } from '../components/item/item.component';
import { ProfileComponent } from '../components/profile/profile.component';

@Sim({
  using: [ItemComponent, ProfileComponent, drComponent]
})
@Router({
  path: '',
  route: {
    '/': Home,
    '/user': User,
    '/about': About
  }
})
@Component({
  template,
  styles: [style]
})
export class Index extends ComponentRouterBase {
  constructor(
    private router: DomRenderRouter,
    private home: Home
  ) {
    super();
    console.log('✅ Index Component Initialized', router);
  }

  onInitRender(...param: any[]) {
    console.log('🎨 Index onInitRender', param);
  }
}
