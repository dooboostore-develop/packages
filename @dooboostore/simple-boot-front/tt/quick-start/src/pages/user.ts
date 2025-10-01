import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import {ProfileComponent} from '../components/profile/profile.component';
import template from './user.html';
// import { OnDomRenderInitRender } from 'packages/@dooboostore/dom-render/src/lifecycle/OnDomRenderInitRender.ts';
import { OnDestroyRender } from '@dooboostore/dom-render/lifecycle/OnDestroyRender';
import { CreatorMetaData } from '@dooboostore/dom-render/rawsets/CreatorMetaData';
import { Router } from '@dooboostore/dom-render/routers/Router';
@Sim({
    using: [ProfileComponent]
})
@Component({
    template,
})
export class User implements  OnDestroyRender {
    name = 'User';
    toggle = true;
    constructor(router: Router) {
      console.log('router-->',router);
    }
    onInitRender(...param) {
        console.log('User: onInitRender', param);
    }
    onDestroyRender(metaData?: CreatorMetaData) {
        console.log('User: onDestroyRender', metaData);
    }
}
