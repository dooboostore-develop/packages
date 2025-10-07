import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { IndexRouteComponent } from './index.route.component';
import { ComponentRouterBase } from '@dooboostore/simple-boot-front/component/ComponentRouterBase';
import template from './index.router.component.html';
import ProjectComponent from '@src/component';
import {drComponent} from '@dooboostore/dom-render/components/index';

@Sim
@Router({route: {'/': IndexRouteComponent}})
@Component({
  template: template,
  using: [drComponent, ProjectComponent]
})
export class IndexRouterComponent extends ComponentRouterBase {
    user = [1,2,3,4]
}
