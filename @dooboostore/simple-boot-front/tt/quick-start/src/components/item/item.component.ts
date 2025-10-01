import {Sim} from '@dooboostore/simple-boot/decorators/SimDecorator';
import {Component} from '@dooboostore/simple-boot-front/decorators/Component';
import template from './item.html'
import style from './item.css'
@Sim
@Component({
    selector: 'item',
    template,
    styles: [style]
})
export class ItemComponent {
    name = '';
    age = 0;

    constructor() {
        console.log('new ProfileComponent');
    }
}