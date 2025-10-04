import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { OnInitRender } from '@dooboostore/dom-render/lifecycle/OnInitRender';
import template from './about.route.component.html';
import style from './about.route.component.css';
import { ComponentBase } from '@dooboostore/simple-boot-front/component/ComponentBase';
import { RawSet } from '@dooboostore/dom-render/rawsets/RawSet';


@Sim
@Component({
  template,
  styles: [style]
})
export class AboutRouteComponent extends ComponentBase {
  async onInitRender(param: any, rawSet: RawSet) {
    await super.onInitRender(param,rawSet);

    console.log('ℹ️ About onInitRender', param);
  }
}
