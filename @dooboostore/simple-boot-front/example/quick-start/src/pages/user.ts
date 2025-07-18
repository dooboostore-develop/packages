import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import {ProfileComponent} from '../components/profile/profile.component';
import template from './user.html';
import { OnInitRender } from '@dooboostore/dom-render/lifecycle/OnInitRender';
import { OnDestroyRender } from '@dooboostore/dom-render/lifecycle/OnDestroyRender';
import { CreatorMetaData } from '@dooboostore/dom-render/rawsets/CreatorMetaData';
@Sim({
    using: [ProfileComponent]
})
@Component({
    template,
})
export class User implements OnInitRender, OnDestroyRender {
    name = 'User';
    toggle = true;
    onInitRender(...param) {
        console.log('User: onInitRender', param);
    }
    onDestroyRender(metaData?: CreatorMetaData) {
        console.log('User: onDestroyRender', metaData);
    }
}
