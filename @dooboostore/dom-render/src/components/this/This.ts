import { ComponentBase } from '../ComponentBase';
import { DomRender, DomRenderRunConfig } from '../../DomRender';
import { RawSet } from '../../rawsets/RawSet';
import { OtherData } from '../../lifecycle/OnChangeAttrRender';
import { OnInitRender } from '../../lifecycle/OnInitRender';
import { ComponentSet } from '../../components/ComponentSet';
import { OnDestroyRenderParams } from '../../lifecycle/OnDestroyRender';

export namespace This {
  export const selector = 'dr-this';
  export type Attribute = {
    value: ComponentSet;
    if: boolean | null;
    createArguments: any[];
    onCreated?: (value: any) => void;
    onDestroyRender?: () => void;
  };

  export class This extends ComponentBase<Attribute> implements OnInitRender {
    private value?: ComponentSet;
    private if?: boolean | null = null;
    private createArguments?: any[];

    async onInitRender(param: any, rawSet: RawSet) {
      await super.onInitRender(param, rawSet);
    }

    onDestroyRender(data: OnDestroyRenderParams) {
      super.onDestroyRender(data);
    }

    onChangeAttrRender(name: string, value: any, other: OtherData) {
      super.onChangeAttrRender(name, value, other);
      if (this.equalsAttributeName(name, 'value')) {
        this.value = value;
      }
      if (this.equalsAttributeName(name, 'if')) {
        this.if = value;
      }
      if (this.equalsAttributeName(name, 'createArguments')) {
        this.createArguments = value;
      }
    }

    created(component: any) {
      component ??= this.value?.obj;
      this.getAttribute('onCreated')?.(component);
    }
  }
}

export default {
  this: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: This.selector,
      template:
        '<div dr-this="@this@.value" dr-detect-option-if="@this@?.value && @this@?.if" dr-option-strip="true" dr-on-create:arguments="@this@.createArguments" dr-on-create:callback="@this@?.created?.($component)">#innerHTML#</div>',
      objFactory: (e, o, r2, counstructorParam) => {
        return DomRender.run({ rootObject: new This.This(...counstructorParam), config: config });
      }
    });
  }
};
