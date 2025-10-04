import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { OnInitRender } from '@dooboostore/dom-render/lifecycle/OnInitRender';
import template from './profile.component.html';
import style from './profile.component.css';
import { ComponentBase } from '@dooboostore/simple-boot-front/component/ComponentBase';
import { RawSet } from '@dooboostore/dom-render/rawsets/RawSet';

@Sim
@Component({
  selector: 'profile',
  template,
  styles: [style]
})
export class ProfileComponent extends ComponentBase{
  name = 'Guest';
  age = 0;

  constructor() {
    super();
    console.log('👤 ProfileComponent created');
  }

  async onInitRender(param: any, rawSet: RawSet) {
    await super.onInitRender(param,rawSet);
    console.log('👤 ProfileComponent onInitRender', param);
    if (param.length > 0) {
      this.name = param[0];
      this.age = param[1] || 0;
    }
  }
}
