import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { OnInitRender } from '@dooboostore/dom-render/lifecycle/OnInitRender';
import template from './about.html';
import style from './about.css';

@Sim
@Component({
  template,
  styles: [style]
})
export class About implements OnInitRender {
  onInitRender(...param: any[]): void {
    console.log('ℹ️ About onInitRender', param);
  }
}
