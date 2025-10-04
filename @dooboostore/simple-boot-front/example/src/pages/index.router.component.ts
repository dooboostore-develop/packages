import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { Router as DomRenderRouter } from '@dooboostore/dom-render/routers/Router';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { ComponentRouterBase } from '@dooboostore/simple-boot-front/component/ComponentRouterBase';
import { drComponent } from '@dooboostore/dom-render/components/index';
import template from './index.router.component.html';
import style from './index.router.component.css';
import { HomeRouteComponent } from 'src/pages/home/home.route.component';
import { UserRouteComponent } from 'src/pages/user/user.route.component';
import { AboutRouteComponent } from 'src/pages/about/about.route.component';
import { ItemComponent } from '../components/item/item.component';
import { ProfileComponent } from '../components/profile/profile.component';
import { RawSet } from '@dooboostore/dom-render/rawsets/RawSet';

@Sim({
  using: [ItemComponent, ProfileComponent, drComponent]
})
@Router({
  path: '',
  route: {
    '/': HomeRouteComponent,
    '/user': UserRouteComponent,
    '/about': AboutRouteComponent
  }
})
@Component({
  template,
  styles: [style]
})
export class IndexRouterComponent extends ComponentRouterBase {
  constructor(
    private router: DomRenderRouter,
    private home: HomeRouteComponent
  ) {
    super();
    console.log('✅ Index Component Initialized', router);
  }

  async onInitRender(param: any, rawSet: RawSet) {
    await super.onInitRender(param, rawSet);
    console.log('🎨 Index onInitRender', param);
  }
}
