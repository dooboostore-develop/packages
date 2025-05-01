import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { ComponentBase } from '../ComponentBase';
import { OnCreateRender } from '@dooboostore/dom-render/lifecycle/OnCreateRender';

export namespace Select {
  export const selector = 'Select';

  export type Attribute = {
    class?: string;
  }


  @Component({
    template: '<option class="${`${@this@.attribute.class} select-option-container`}$">#innerHTML#</option>',
    styles: '',
    selector: `${selector}.Option`
  })
  export class Body extends ComponentBase<Attribute> {
    constructor() {
      super({onlyParentType: [Wrap]});
    }
  }

  @Component({
    template: '<select class="${`${@this@.attribute.class} select-container`}$">#innerHTML#</select>',
    styles: '',
    selector: `${selector}.Wrap`
  })
  export class Wrap extends ComponentBase<Attribute> implements OnCreateRender{
    onCreateRender(...param: any[]): void {
    }
    onDestroyRender(...metaData: any[]): void {
    }
  }
}
