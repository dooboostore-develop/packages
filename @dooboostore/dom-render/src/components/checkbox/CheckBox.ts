import { ComponentBase } from '../ComponentBase';
import { DomRender, DomRenderRunConfig } from '../../DomRender';
import { RawSet } from '../../rawsets/RawSet';
import { OtherData } from '../../lifecycle/OnChangeAttrRender';
import { OnInitRender } from '../../lifecycle/OnInitRender';
import { ComponentSet } from '../../components/ComponentSet';
import { OnCreateRenderDataParams } from '../../lifecycle/OnCreateRenderData';

export namespace CheckBox {
  export const selector = 'dr-checkbox';
  export type Attribute = {
    class?: string;
  }
  export type ChangeOption = { type: 'initialize' | 'event' | 'attributeChange' };
  export type WrapAttribute = {
    class?: string;
    name?: string;
    checked?: boolean;
    change?: (checked: boolean, option: ChangeOption) => void
  }

  class CheckBoxBase extends ComponentBase<Attribute> {
    public hidden = true;
  }

  // @Component({
  //   template: '<div dr-if="!@this@.hidden" dr-strip="true">#innerHTML#</div>',
  //   styles: '',
  //   selector: `${selector}.Checked`
  // })
  export class Checked extends CheckBoxBase {
    public name = 'checked';

    constructor() {
      super({onlyParentType: CheckBox});
    }
  }

  // @Component({
  //   template: '<div dr-if="!@this@.hidden" dr-strip="true">#innerHTML#</div>',
  //   styles: '',
  //   selector: `${selector}.UnChecked`
  // })
  export class UnChecked extends CheckBoxBase {
    public name = 'unChecked';

    constructor() {
      super({onlyParentType: CheckBox});
    }
  }

  // @Component({
  //   template: template,
  //   styles: style,
  //   selector: `${selector}`
  // })
  export class CheckBox extends ComponentBase<WrapAttribute> {
    private checked = false;
    private inputElement?: HTMLInputElement;

    change(option: ChangeOption, checked?: boolean) { checked = checked ?? this.checked;
      this.checked = checked;
      this.setChildrenHidden(checked);
      this.getAttribute('change')?.(checked, option);
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

    onInitInputElement(element: HTMLInputElement) {
      // console.log('---cr', element)
      this.inputElement = element;
      this.inputElement.checked = !!this.getAttribute('checked');
      this.change({type: 'initialize'}, !!this.getAttribute('checked'));
    }

    onChangeAttrRender(name: string, val: any, other: OtherData) {
      super.onChangeAttrRender(name, val, other);
      // console.log('Checkbox ChangeAttr------', name, val, this.inputElement)
      if (this.inputElement && this.getAttribute('checked') !== this.checked) {
        this.inputElement.checked = !!this.getAttribute('checked');
        this.change({type: 'attributeChange'}, !!this.getAttribute('checked'));
      }
    }

  }
}



export default {
  checkBoxChecked: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${CheckBox.selector}-checked`,
      template: '<div dr-if="!@this@.hidden" dr-option-strip="true">#innerHTML#</div>',
      objFactory: (e,o,r2, counstructorParam) => {
        return DomRender.run({rootObject: new CheckBox.Checked(), config: config});
      }
    })
  },
  checkBoxUnchecked: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${CheckBox.selector}-unchecked`,
      template: '<div dr-if="!@this@.hidden" dr-option-strip="true" >#innerHTML#</div>',
      objFactory: (e,o,r2, counstructorParam) => {
        return DomRender.run({rootObject: new CheckBox.UnChecked(), config: config});
      }
    })
  },
  checkBox: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${CheckBox.selector}`,
      template: '<label class="${@this@.getAttribute(\'class\')}$">\n' +
        '  <input\n' +
        '    name="${@this@.getAttribute(\'name\')}$"\n' +
        '    dr-on-init="@this@.onInitInputElement($element)"\n' +
        '    dr-event-change="@this@.change({type: \'event\'},$element.checked);"\n' +
        '    type="checkbox" hidden="hidden"/>\n' +
        '  #innerHTML#\n' +
        '</label>',
      objFactory: (e,o,r2, counstructorParam) => {
        return DomRender.run({rootObject: new CheckBox.CheckBox(...counstructorParam), config: config});
      }
    })
  },
}