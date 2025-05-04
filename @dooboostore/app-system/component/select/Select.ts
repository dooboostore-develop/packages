import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { ComponentBase } from '../ComponentBase';
import { OnCreateRender } from '@dooboostore/dom-render/lifecycle/OnCreateRender';

export namespace Select {
  export const selector = 'System:Select';

  export type Attribute = {
    class?: string;
  }


  @Component({
    template: '<option class="${`${@this@.attribute.class} select-option-container`}$">#innerHTML#</option>',
    styles: '',
    selector: `${selector}.Option`
  })
  export class SelectOption extends ComponentBase<Attribute> {
    constructor() {
      super({onlyParentType: [Select]});
    }
  }

  @Component({
    template: '',
    styles: '',
    selector: `${selector}`
  })
  export class Select extends ComponentBase<Attribute> implements OnCreateRender{
    private element?: HTMLSelectElement;
    onCreateRender(...param: any[]): void {
    }
    onDestroyRender(...metaData: any[]): void {
    }
  }
}
