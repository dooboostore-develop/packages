import { ComponentBase } from '../ComponentBase';
import { DomRender, DomRenderRunConfig } from '../../DomRender';
import { RawSet } from '../../rawsets/RawSet';
import { OtherData } from '../../lifecycle/OnChangeAttrRender';
import { OnInitRender } from '../../lifecycle/OnInitRender';
import { ComponentSet } from '../../components/ComponentSet';
import { OnCreateRenderDataParams } from '../../lifecycle/OnCreateRenderData';

export namespace Choose {
  export const selector = 'dr-choose';
  export type Attribute<D> = {
    data: D;
  }
  export type WhenAttribute<D> = {
    test: (data?: D | null) => boolean;
  }

  class ChildOtherWiseBase<A> extends ComponentBase<A> {
    public hidden = true;
  }

  class ChildBase<D> extends ChildOtherWiseBase<WhenAttribute<D>> {
    data?: D;
  }

  export class When<D> extends ChildBase<D> {
    constructor() {
      super({onlyParentType: Choose<D>});
    }
  }

  export class OtherWise<D> extends ChildBase<D> {
    constructor() {
      super({onlyParentType: Choose<D>});
    }
  }

  export class Choose<D> extends ComponentBase<Attribute<D>> {

    private choose?: When<D> | OtherWise<D>;

    onCreatedThisChild(child: any, data: OnCreateRenderDataParams) {
      super.onCreatedThisChild(child, data);
      this.setChange(child);
    }

    onChangeAttrRender(name: string, value: any, other: OtherData) {
      super.onChangeAttrRender(name, value, other);
      if (this.equalsAttributeName(name, 'data')) {
        this.choose = undefined;
        const children = this.getChildren([When, OtherWise]).sort((a, b) => (a instanceof OtherWise ? 1 : 0) - (b instanceof OtherWise ? 1 : 0));
        children.forEach(it => this.setChange(it as any));

      }
    }

    private setChange(child: When<D> | OtherWise<D>) {
      child.data = this.getAttribute('data') as any;
      // when.hidden = true;

      console.log('eeeeeee?', child, child.getAttribute('test'), this.getAttribute('data'));
      if (!this.choose && child instanceof When && child.getAttribute('test')?.(this.getAttribute('data'))) {
      console.log('eeeeeee?2');
        // console.log('------------', child.attribute?.test?.(this.attribute?.data))
        this.choose = child;
        if (child.hidden) {
          child.hidden = false;
        }
        // console.log('--------', when)
      } else if (this.choose !== child) {
        child.hidden = true;
      }

      console.log('eeeeeee?3');
      if (!this.choose && child instanceof OtherWise) {
        this.choose = child;
        if (child.hidden) {
          child.hidden = false;
        }
      }
      console.log('eeeeeee?34');
    }
  }
}


export default {
  chooseWhen: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${Choose.selector}-when`,
      template: '<div dr-if="!@this@.hidden" dr-option-strip="true" >#innerHTML#</div>',
      objFactory: (e, o, r2, counstructorParam) => {
        return DomRender.run({rootObject: new Choose.When(), config: config});
      }
    })
  },
  chooseOtherWise: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${Choose.selector}-other-wise`,
      template: '<div dr-if="!@this@.hidden" dr-option-strip="true" >#innerHTML#</div>',
      objFactory: (e, o, r2, counstructorParam) => {
        return DomRender.run({rootObject: new Choose.OtherWise(), config: config});
      }
    })
  },
  choose: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${Choose.selector}`,
      template: '#innerHTML#',
      objFactory: (e, o, r2, counstructorParam) => {
        return DomRender.run({rootObject: new Choose.Choose(...counstructorParam), config: config});
      }
    })
  },
}