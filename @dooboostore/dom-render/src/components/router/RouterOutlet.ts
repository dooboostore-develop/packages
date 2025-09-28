import { ComponentBase } from '../ComponentBase';
import { DomRender, DomRenderRunConfig } from '../../DomRender';
import { RawSet } from '../../rawsets/RawSet';
import { OtherData } from '../../lifecycle/OnChangeAttrRender';
import { OnInitRender } from '../../lifecycle/OnInitRender';
import { ComponentSet } from '../../components/ComponentSet';
import { OnDestroyRenderParams } from '../../lifecycle/OnDestroyRender';
import { ComponentRouterBase, isOnCreatedOutletDebounce } from '../../components/ComponentRouterBase';
export namespace RouterOutlet {
  export const selector = 'dr-router-outlet';
  export type Attribute = {
    value: ComponentSet;
    if: boolean | null;
    createArguments: any[];
    onCreated?: (value: any) => void;
    onCreatedDebounce?: (value: any) => void;
    onDestroyRender?: () => void;
  };

  export class RouterOutlet extends ComponentBase<Attribute> implements OnInitRender {
    private value?: ComponentSet;
    private if?: boolean | null = null;
    private createArguments?: any[];

    setValue(value: ComponentSet) {
      this.value = value;
    }

    onInitRender(param: any, rawSet: RawSet) {
      super.onInitRender(param, rawSet);
      const c = this.getParentThis();
      if (c instanceof ComponentRouterBase) {
        this.value = c.child;
      }
      // console.log('------',c);
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

    onCreatedThisChildDebounce() {
      let parentThis = this.getParentThis();
      // console.log('---', parentThis);
      if (isOnCreatedOutletDebounce(parentThis)) {
        parentThis.onCreatedOutletDebounce(this.value?.obj);
      }
      this.getAttribute('onCreatedDebounce')?.(this.value?.obj);
    }
    created(component: any) {
      component ??= this.value?.obj;
      this.getAttribute('onCreated')?.(component);
    }
  }
}

export default {
  // TODO: 왜 이놈만 webpack에서 순환참조 에러나는지모르겠다.. 왜 이놈만.. 그래서 이렇게 하긴함.
  routerOutlet: (config?: DomRenderRunConfig, executer?: { run: (...data: any[]) => any }) => {
    return RawSet.createComponentTargetElement({
      name: RouterOutlet.selector,
      template:
        '<div dr-this="@this@.value" dr-detect-option-if="@this@?.value && @this@?.if" dr-option-strip="true" dr-on-create:arguments="@this@.createArguments" dr-on-create:callback="@this@?.created?.($component)">#innerHTML#</div>',
      objFactory: (e, o, r2, counstructorParam) => {
        return executer?.run({ rootObject: new RouterOutlet.RouterOutlet(...counstructorParam), config: config });
      }
    });
  }
};
