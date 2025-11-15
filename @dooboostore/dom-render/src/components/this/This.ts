import { ComponentBase } from '../ComponentBase';
import { DomRender, DomRenderRunConfig } from '../../DomRender';
import { RawSet } from '../../rawsets/RawSet';
import { isOnChangeAttrRender, OtherData } from '../../lifecycle/OnChangeAttrRender';
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
    private childObject?: any;
    private childRawSet?: RawSet;
    private sw = false;

    setValue(value: ComponentSet) {
      this.sw = false;
      setTimeout(() => {
        this.value = value;
      }, 0)

      setTimeout(() => {
        this.sw = true;
      }, 0)
    }

    async onInitRender(param: any, rawSet: RawSet) {
      await super.onInitRender(param, rawSet);
    }

    onDestroyRender(data: OnDestroyRenderParams) {
      super.onDestroyRender(data);
    }

    onChangeAttrRender(name: string, value: any, other: OtherData) {
      super.onChangeAttrRender(name, value, other);
      if (this.equalsAttributeName(name, 'value')) {
        this.setValue(value);
      }
      if (this.equalsAttributeName(name, 'if')) {
        this.if = value;
      }
      if (this.equalsAttributeName(name, 'createArguments')) {
        this.createArguments = value;
      }
    }

    created($component: any, $rawSet: RawSet) {
      this.childObject = $component ??= this.value?.obj;
      this.childRawSet = $rawSet;
      
      if ($component) {
        this.getAttribute('onCreated')?.($component);
        
        // attribute 전달 처리
        if (isOnChangeAttrRender($component)) {
          this.getAttributeNames()
            .filter(it => it.startsWith('attribute-'))
            .forEach(it => {
              const attrName = it.replace(/^attribute-/, '');
              const attrValue = this.getAttribute(it as any);
              $rawSet.dataSet.render.attribute ??= {};
              $rawSet.dataSet.render.attribute[attrName] = attrValue;
              $component.onChangeAttrRender(attrName, attrValue, {rawSet: $rawSet});
            });
        }
      }
    }
  }
}

export default {
  this: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: This.selector,
      template:
        `
        <dr-if value="\${@this@.sw}$">
            <div dr-this="@this@.value" dr-detect-option-if="@this@?.value && @this@?.if" dr-option-strip="true" dr-on-create:arguments="@this@.createArguments" dr-on-create:callback="@this@?.created?.($component, $rawSet)">#innerHTML#</div>
        </dr-if>
        `,
      objFactory: (e, o, r2, counstructorParam) => {
        return DomRender.run({ rootObject: new This.This(...counstructorParam), config: config });
      }
    });
  }
};
