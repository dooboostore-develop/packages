import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import template from './checkBox.html';
import style from './checkBox.css';
import { OnCreateRenderDataParams } from '@dooboostore/dom-render/lifecycle/OnCreateRenderData';
import { ComponentBase } from '../ComponentBase';
import { OtherData } from '@dooboostore/dom-render/lifecycle/OnChangeAttrRender';

export namespace CheckBox {
  export const selector = 'CheckBox';
  export type Attribute = {
    class?: string;
  }
  export type WrapAttribute = {
    class?: string;
    name?: string;
    checked?: boolean;
    on_change_checked?: (checked: boolean) => void
  }

  class CheckBoxBase extends ComponentBase<Attribute> {
    public hidden = true;

  }

  @Component({
    template: '<div dr-if="!@this@.hidden" dr-strip="true">#innerHTML#</div>',
    styles: '',
    selector: `${selector}.Checked`
  })
  export class Checked extends CheckBoxBase {
    public name = 'Checked';

    constructor() {
      super({ onlyParentType: Label });
    }
  }

  @Component({
    template: '<div dr-if="!@this@.hidden" dr-strip="true">#innerHTML#</div>',
    styles: '',
    selector: `${selector}.UnChecked`
  })
  export class UnChecked extends CheckBoxBase {
    public name = 'unChecked';

    constructor() {
      super({ onlyParentType: Label });
    }
  }

  @Component({
    template: template,
    styles: style,
    selector: `${selector}.Label`
  })
  export class Label extends ComponentBase<WrapAttribute> {
    private name = 'wrap';
    private checked = false;
    private inputElement?: HTMLInputElement;

    change(checked: boolean = this.checked) {
      this.checked = checked;
      this.setChildrenHidden(checked);
      if (this.attribute?.on_change_checked) {
        this.attribute.on_change_checked(checked);
      }
    }

    private setChildrenHidden(checked: boolean) {
      this.getChildren(Checked).forEach(it => {
          it.hidden = !checked;
      });
      this.getChildren(UnChecked).forEach(it => {
        it.hidden = checked;
      });
    }

    onCreatedThisChild(child: CheckBoxBase, childData: OnCreateRenderDataParams): void {
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
        this.change(this.attribute.checked);
      }
    }

  }
}
