import {Sim} from '@dooboostore/simple-boot/decorators/SimDecorator';
import {Component} from '@dooboostore/simple-boot-front/decorators/Component';
import template from './profile.html'
import { OnInitRender } from '@dooboostore/dom-render/lifecycle/OnInitRender.ts';
@Sim
@Component({
    selector: 'profile',
    template
})
export class ProfileComponent implements OnInitRender {
    name = '';
    age = 0;

    constructor() {
        console.log('new ProfileComponent');
    }

    change(data: any) {
        console.log('-------', data)
    }
    onInitRender(...param) {
        console.log('ProfileComponent: onInitRender', param);
        this.name = param[0];
        this.age = param[1];
    }
}