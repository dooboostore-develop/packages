import { ComponentBase } from '../ComponentBase';
import { DomRender, RunConfig } from '../../DomRender';
import { RawSet } from '../../rawsets/RawSet';
import { OtherData } from '../../lifecycle/OnChangeAttrRender';
import { OnInitRender } from '../../lifecycle/OnInitRender';
import { ComponentSet } from '../../components/ComponentSet';
import { If } from 'components/if/If';


export namespace ForOf {
  export const selector = 'System:ForOf';
  export type Attribute<D> = {
    value: D;
  }

  // @Component({
  //   template: '<div dr-for-of="@this@.data" dr-option-strip="true">#innerHTML#</div>',
  //   selector: `${selector}`
  // })
  export class ForOf<D> extends ComponentBase<Attribute<D>> {
    private value?: D;

    onChangeAttrRender(name: string, value: any, other: OtherData) {
      super.onChangeAttrRender(name, value, other);
      if (this.equalsAttributeName(name, 'value')) {
        this.value = value;
      }
    }

  }
}


export default {
  forOf: (config?: RunConfig) => {
    return RawSet.createComponentTargetElement({
      name: ForOf.selector,
      template: '<div dr-for-of="@this@.data" dr-option-strip="true">#innerHTML#</div>',
      objFactory: (e,o,r2, counstructorParam) => {
        return DomRender.run({rootObject: new ForOf.ForOf(...counstructorParam), config: config});
      }
    })
  },
}