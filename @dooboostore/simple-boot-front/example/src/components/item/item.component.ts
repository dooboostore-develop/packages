import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import template from './item.component.html';
import style from './item.component.css';

@Sim
@Component({
  selector: 'item',
  template,
  styles: [style]
})
export class ItemComponent {
  name = 'Sample Item';
  age = 0;
  status = 'Active';

  constructor() {
    console.log('📦 ItemComponent created');
  }
}
