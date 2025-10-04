import { ComponentBase } from '../ComponentBase';
import { OtherData } from '../../lifecycle/OnChangeAttrRender';
import { DomRender } from '../../DomRender';
import { OnInitRender } from '../../lifecycle/OnInitRender';
import { RawSet } from '../../rawsets/RawSet';
import { DomRenderConfig } from '../../configs/DomRenderConfig';

export namespace If {
  export const selector = 'dr-if';
  // export type AppenderInterface<D> = {
  //   push(...data:D[]):void;
  //   set(key: string, ...v:D[]):void
  //   delete(key: string):void
  //   clear():void
  // }
  export type Attribute<D> = {
    value?: null | boolean;
  };

  export class If<D> extends ComponentBase<Attribute<D>> implements OnInitRender {
    private sw: boolean = false;

    async onInitRender(param: any, rawSet: RawSet) {
      super.onInitRender(param, rawSet);
    }

    onChangeAttrRender(name: string, value: any, other: OtherData) {
      super.onChangeAttrRender(name, value, other);

      if (this.equalsAttributeName(name, 'value')) {
        // console.log('--', value, typeof value);
        this.sw = value;
      }
    }
  }
}

// const iif = DomRender.createComponent({
//   type: If.If,
//   tagName: If.selector,
//   template: '<div dr-if="@this@.sw" dr-option-strip="true">#innerHTML#</div>' });
export default {
  if: (config?: DomRenderConfig) => {
    // if (!customElements.get(If.selector)) {
    //   customElements.define(If.selector, class extends HTMLElement {
    //     constructor() {
    //       super();
    //       this.hidden = true;
    //     }
    //   });
    // }

    return RawSet.createComponentTargetElement({
      name: If.selector,
      template: '<div dr-if="@this@.sw" >#innerHTML#</div>',
      objFactory: (e, o, r2, counstructorParam) => {
        return DomRender.run({ rootObject: new If.If(...counstructorParam), config: config });
      }
    });
  }
};
