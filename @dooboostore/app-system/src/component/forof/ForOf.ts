import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { ComponentBase } from '../ComponentBase';
import { OtherData } from '@dooboostore/dom-render/lifecycle/OnChangeAttrRender';
import { OnCreateRenderDataParams } from '@dooboostore/dom-render/lifecycle/OnCreateRenderData';

export namespace ForOf {
  export const selector = 'System:ForOf';
  export type Attribute<D> = {
    data: D;
  }

  @Component({
    template: '<div dr-for-of="@this@.data" dr-option-strip="true">#innerHTML#</div>',
    selector: `${selector}`
  })
  export class ForOf<D> extends ComponentBase<Attribute<D>> {
    private data?: D;

    onChangeAttrRender(name: string, value: any, other: OtherData) {
      super.onChangeAttrRender(name, value, other);
      if (this.equalsAttributeName(name, 'data')) {
        this.data = value;
      }
    }

  }
}


