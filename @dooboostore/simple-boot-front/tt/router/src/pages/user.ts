import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { Lifecycle, Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import template from './user.html';
import { CreatorMetaData } from '@dooboostore/dom-render/rawsets/CreatorMetaData';
import { Router } from '@dooboostore/dom-render/routers/Router';
import { ComponentBase } from '@dooboostore/dom-render';

@Sim({
  scope: Lifecycle.Transient
})
@Component({
  template
})
export class User extends ComponentBase {
  name = 'User';
  toggle = true;
  constructor(router: Router) {
    super();
    console.log('constructor , User');
    // console.log('router-->',router);
  }

  onDrThisBind() {
    super.onDrThisBind();
    console.log('User - onDrThisBind');
  }
  onDrThisUnBind() {
    super.onDrThisUnBind();
    console.log('User - onDrThisUnBind');
  }

  onDomRenderInitRender(...param) {
    console.log('User: onInitRender', param);
  }
  onDestroyRender(metaData?: CreatorMetaData) {
    console.log('User: onDestroyRender', metaData);
  }
}
