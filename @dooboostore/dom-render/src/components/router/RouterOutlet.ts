import { ChildrenSet, ComponentBase } from '../ComponentBase';
import { DomRenderRunConfig } from '../../DomRender';
import { RawSet } from '../../rawsets/RawSet';
import { isOnChangeAttrRender, OtherData } from '../../lifecycle/OnChangeAttrRender';
import { OnInitRender } from '../../lifecycle/OnInitRender';
import { ComponentSet } from '../../components/ComponentSet';
import { OnDestroyRenderParams } from '../../lifecycle/OnDestroyRender';
import { ComponentRouterBase, isOnCreatedOutletDebounce } from '../../components/ComponentRouterBase';
import { OnCreateRenderDataParams } from '../../lifecycle';

export namespace RouterOutlet {
  export const selector = 'dr-router-outlet';
  export type Attribute = {
    value: ComponentSet | string;
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
    private childObject?: any;
    private childRawSet?: RawSet;

    setValue(value: ComponentSet) {
      this.value = value;
      // console.log('sssssssssss');
    }

    async onInitRender(param: any, rawSet: RawSet) {
      await super.onInitRender(param, rawSet);
      const c = this.getParentThis<any>();
      const userValue = this.getAttribute('value');
      if (typeof userValue === 'string') {
        this.value = c[userValue];
      } else if (userValue instanceof ComponentSet) {
        this.value = userValue;
      } else if (!userValue && c instanceof ComponentRouterBase) {
        this.value = c.child;
      }
      // console.log('------',c);
    }

    onDestroyRender(data: OnDestroyRenderParams) {
      super.onDestroyRender(data);
    }

    onChangeAttrRender(name: string, value: any, other: OtherData) {
      super.onChangeAttrRender(name, value, other);
      console.log('--------------', name, value);
      if (this.equalsAttributeName(name, 'value')) {
        this.value = value;
      }
      if (this.equalsAttributeName(name, 'if')) {
        this.if = value;
      }
      if (this.equalsAttributeName(name, 'createArguments')) {
        this.createArguments = value;
      }

      if (this.childObject && this.childRawSet && isOnChangeAttrRender(this.childObject)) {
        this.childObject.onChangeAttrRender(name, value, { rawSet: this.childRawSet });
      }
    }

    onCreatedThisChild(child: any, data: OnCreateRenderDataParams) {
      super.onCreatedThisChild(child, data);
      // console.log('outlet--oncreatedThisChild',child);
    }

    onCreatedThisChildDebounce(childrenSet: ChildrenSet[]) {
      super.onCreatedThisChildDebounce(childrenSet);
      let parentThis = this.getParentThis();
      // console.log('---', parentThis);
      if (isOnCreatedOutletDebounce(parentThis)) {
        parentThis.onCreatedOutletDebounce(this.value?.obj);
      }
      this.getAttribute('onCreatedDebounce')?.(this.value?.obj);
    }


    onCreateDrThis($component: any, $rawSet: RawSet) {
      this.childObject = $component ??= this.value?.obj;
      this.childRawSet = $rawSet;
      if ($component) {
        this.getAttribute('onCreated')?.($component);
        // console.log('21222');
        if (isOnChangeAttrRender($component)) {
          this.getAttributeNames()
            .filter(it => it.startsWith('attribute-'))
            .forEach(it => {
              const attrName = it.replace(/^attribute-/, '');
              const attrValue = this.getAttribute(it as any);
              $component.onChangeAttrRender(attrName, attrValue, { rawSet: $rawSet });
            });
        }
        // console.log(' vv');
      }
    }
  }
}

export default {
  // TODO: 왜 이놈만 webpack에서 순환참조 에러나는지모르겠다.. 왜 이놈만.. 그래서 이렇게 하긴함.
  routerOutlet: (config?: DomRenderRunConfig, executer?: { run: (...data: any[]) => any }) => {
    return RawSet.createComponentTargetElement({
      name: RouterOutlet.selector,
      template:
        '<div dr-this="@this@.value" dr-detect-option-if="@this@?.value && @this@?.if" dr-option-strip="true" dr-on-create:arguments="@this@.createArguments" dr-on-create:callback="@this@?.onCreateDrThis?.($component, $rawSet)">#innerHTML#</div>',
      objFactory: (e, o, r2, counstructorParam) => {
        return executer?.run({ rootObject: new RouterOutlet.RouterOutlet(...counstructorParam), config: config });
      }
    });
  }
};
