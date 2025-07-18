import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import template from './checkBox.html';
import style from './checkBox.css';
import { OnCreateRenderDataParams } from '@dooboostore/dom-render/lifecycle/OnCreateRenderData';
import { ComponentBase } from '../ComponentBase';
import { OtherData } from '@dooboostore/dom-render/lifecycle/OnChangeAttrRender';

export namespace CheckBox {
  export const selector = 'System:CheckBox';
  export type Attribute = {
    class?: string;
  }
  export type ChangeOption = { type: 'initialize' | 'event' | 'attributeChange' };
  export type WrapAttribute = {
    class?: string;
    name?: string;
    checked?: boolean;
    change?: (checked: boolean, option:ChangeOption) => void
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
      super({ onlyParentType: CheckBox });
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
      super({ onlyParentType: CheckBox });
    }
  }

  @Component({
    template: template,
    styles: style,
    selector: `${selector}`
  })
  export class CheckBox extends ComponentBase<WrapAttribute> {
    private checked = false;
    private inputElement?: HTMLInputElement;

    change(option: ChangeOption, checked: boolean = this.checked) {
      this.checked = checked;
      this.setChildrenHidden(checked);
      this.attribute?.change?.(checked, option);
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
      // console.log('---cr', element)
      this.inputElement = element;
      this.inputElement.checked = !!this.attribute?.checked;
      this.change({type: 'initialize'},this.attribute?.checked);
    }
    onChangeAttrRender(name: string, val: any, other: OtherData) {
      super.onChangeAttrRender(name, val, other);
      // console.log('Checkbox ChangeAttr------', name, val, this.inputElement)
      if (this.inputElement && this.attribute && this.attribute?.checked !== this.checked) {
        this.inputElement.checked = !!this.attribute.checked;
        this.change({type: 'attributeChange'},this.attribute.checked);
      }
    }

  }
}
