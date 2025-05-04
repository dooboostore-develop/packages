import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import template from './radio.html';
import style from './radio.css';
import { OnCreateRenderDataParams } from '@dooboostore/dom-render/lifecycle/OnCreateRenderData';
import { ComponentBase } from '../ComponentBase';
import { OtherData } from '@dooboostore/dom-render/lifecycle/OnChangeAttrRender';

export namespace Radio {
  export const selector = 'System:Radio';
  export type Attribute = {
    class?: string;
  }
  export type LabelAttribute = {
    class?: string;
    name?: string;
    value?: string;
    checked?: boolean;
    on_change_checked?: (checked: boolean, element: HTMLInputElement) => void
  }

  class RadioBase extends ComponentBase<Attribute> {
    public hidden = true;

  }

  @Component({
    template: '<div dr-if="!@this@.hidden" dr-strip="true">#innerHTML#</div>',
    styles: '',
    selector: `${selector}.Checked`
  })
  export class RadioChecked extends RadioBase {
    public name = 'Checked';

    constructor() {
      super({ onlyParentType: Radio });
    }
  }

  @Component({
    template: '<div dr-if="!@this@.hidden" dr-strip="true">#innerHTML#</div>',
    styles: '',
    selector: `${selector}.UnChecked`
  })
  export class UnChecked extends RadioBase {
    public name = 'unChecked';

    constructor() {
      super({ onlyParentType: Radio });
    }
  }

  @Component({
    template: template,
    styles: style,
    selector: `${selector}`
  })
  export class Radio extends ComponentBase<LabelAttribute> {
    private checked = false;
    private inputElement?: HTMLInputElement;

    change(checked: boolean = this.checked) {
      this.checked = checked;
      this.setChildrenHidden(checked);
      console.log('radio checked!!!!!!!',checked, this.checked, this.inputElement?.checked)
      if (this.attribute?.on_change_checked) {
        this.attribute.on_change_checked(checked, this.inputElement!);
      }
    }

    private setChildrenHidden(checked: boolean) {
      this.getChildren(RadioChecked).forEach(it => {
          it.hidden = !checked;
      });
      this.getChildren(UnChecked).forEach(it => {
        it.hidden = checked;
      });
    }

    onCreatedThisChild(child: RadioBase, childData: OnCreateRenderDataParams): void {
      super.onCreatedThisChild(child, childData);
      this.setChildrenHidden(this.checked);
    }

    onInitInputElement(element: HTMLInputElement){
      this.inputElement = element;
    }
    onChangeAttrRender(name: string, val: any, other: OtherData) {
      super.onChangeAttrRender(name, val, other);
      if (this.inputElement && this.attribute && this.attribute?.checked !== this.checked) {
        this.inputElement.checked = !!this.attribute.checked;
        console.log('----changeAttribute', this.attribute.checked)
        this.change(this.attribute.checked);
      }
    }

  }
}
