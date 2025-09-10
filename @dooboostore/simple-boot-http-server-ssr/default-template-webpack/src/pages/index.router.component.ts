import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { IndexComponent } from './index.component';
import { ComponentRouterBase } from '@dooboostore/simple-boot-front/component/ComponentRouterBase';
import template from './index.router.component.html';
import ProjectComponent from '@src/component';
import {drComponent} from '@dooboostore/dom-render/components';

@Sim
@Router({route: {'/': IndexComponent}})
@Component({
  template: template,
  using: [drComponent, ProjectComponent]
})
export class IndexRouterComponent extends ComponentRouterBase {
}
