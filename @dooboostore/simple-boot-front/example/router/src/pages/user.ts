import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { Lifecycle, Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { ProfileComponent } from '../components/profile/profile.component';
import template from './user.html';
import { OnInitRender } from '@dooboostore/dom-render/lifecycle/OnInitRender';
import { OnDestroyRender } from '@dooboostore/dom-render/lifecycle/OnDestroyRender';
import { CreatorMetaData } from '@dooboostore/dom-render/rawsets/CreatorMetaData';
import { Router } from '@dooboostore/dom-render/routers/Router';

@Sim({
  scope: Lifecycle.Transient,
    using: [ProfileComponent]
})
@Component({
    template,
})
export class User implements OnInitRender, OnDestroyRender {
    name = 'User';
    toggle = true;
    constructor(router: Router) {
      console.log('constructor , User')
      // console.log('router-->',router);
    }
    onInitRender(...param) {
        console.log('User: onInitRender', param);
    }
    onDestroyRender(metaData?: CreatorMetaData) {
        console.log('User: onDestroyRender', metaData);
    }
}
