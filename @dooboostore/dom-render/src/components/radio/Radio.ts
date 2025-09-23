import { ComponentBase } from '../ComponentBase';
import { DomRender, DomRenderRunConfig } from '../../DomRender';
import { RawSet } from '../../rawsets/RawSet';
import { OtherData } from '../../lifecycle/OnChangeAttrRender';
import { OnInitRender } from '../../lifecycle/OnInitRender';
import { ComponentSet } from '../../components/ComponentSet';
import { OnCreateRenderDataParams } from '../../lifecycle/OnCreateRenderData';



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

  export class Checked extends RadioBase {
    public name = 'Checked';

    constructor() {
      super({onlyParentType: Radio});
    }
  }

  export class UnChecked extends RadioBase {
    public name = 'unChecked';

    constructor() {
      super({onlyParentType: Radio});
    }
  }

  export class Radio extends ComponentBase<LabelAttribute> {
    private checked = false;
    private inputElement?: HTMLInputElement;

    change(checked?: boolean) { checked = checked ?? this.checked;
      this.checked = checked;
      this.setChildrenHidden(checked);
      console.log('radio checked!!!!!!!', checked, this.checked, this.inputElement?.checked)
      if (this.getAttribute('on_change_checked')) {
        this.getAttribute('on_change_checked')?.(checked, this.inputElement!);
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

    onCreatedThisChild(child: RadioBase, childData: OnCreateRenderDataParams): void {
      super.onCreatedThisChild(child, childData);
      this.setChildrenHidden(this.checked);
    }

    onInitInputElement(element: HTMLInputElement) {
      this.inputElement = element;
    }

    onChangeAttrRender(name: string, val: any, other: OtherData) {
      super.onChangeAttrRender(name, val, other);
      if (this.inputElement && this.getAttribute('checked') !== this.checked) {
        this.inputElement.checked = !!this.getAttribute('checked');
        console.log('----changeAttribute', this.getAttribute('checked'))
        this.change(!!this.getAttribute('checked'));
      }
    }

  }
}



export default {
  radioChecked: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${Radio.selector}-checked`,
      template: '<div dr-if="!@this@.hidden" dr-option-strip="true" >#innerHTML#</div>',
      objFactory: (e,o,r2, counstructorParam) => {
        return DomRender.run({rootObject: new Radio.Checked(), config: config});
      }
    })
  },
  radioUnChecked: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${Radio.selector}-unchecked`,
      template: '<div dr-if="!@this@.hidden" dr-option-strip="true" >#innerHTML#</div>',
      objFactory: (e,o,r2, counstructorParam) => {
        return DomRender.run({rootObject: new Radio.UnChecked(), config: config});
      }
    })
  },
  radio: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${Radio.selector}`,
      template: '<label class="${@this@.getAttribute(\'class\')}$">\n' +
        '  <input\n' +
        '    name="${@this@.getAttribute(\'name\')}$"\n' +
        '    checked="${@this@.getAttribute(\'checked\')}$"\n' +
        '    value="${@this@.getAttribute(\'value\')}$"\n' +
        '    dr-on-init="@this@.onInitInputElement($element)"\n' +
        '    dr-event-change="@this@.change($element.checked);"\n' +
        '    type="radio"\n' +
        '\n' +
        '  />\n' +
        '  ${@this@.getAttribute(\'checked\')}$\n' +
        '  #innerHTML#\n' +
        '</label>',
      objFactory: (e,o,r2, counstructorParam) => {
        return DomRender.run({rootObject: new Radio.Radio(...counstructorParam), config: config});
      }
    })
  },
}