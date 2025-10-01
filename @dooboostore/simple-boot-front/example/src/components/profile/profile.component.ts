import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { OnInitRender } from '@dooboostore/dom-render/lifecycle/OnInitRender';
import template from './profile.html';
import style from './profile.css';

@Sim
@Component({
  selector: 'profile',
  template,
  styles: [style]
})
export class ProfileComponent implements OnInitRender {
  name = 'Guest';
  age = 0;

  constructor() {
    console.log('👤 ProfileComponent created');
  }

  onInitRender(...param: any[]) {
    console.log('👤 ProfileComponent onInitRender', param);
    if (param.length > 0) {
      this.name = param[0];
      this.age = param[1] || 0;
    }
  }
}
