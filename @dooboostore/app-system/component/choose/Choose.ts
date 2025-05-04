import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { ComponentBase } from '../ComponentBase';
import { OtherData } from '@dooboostore/dom-render/lifecycle/OnChangeAttrRender';
import { Promises } from '@dooboostore/core/promise';
import { OnCreateRenderDataParams } from '@dooboostore/dom-render/lifecycle/OnCreateRenderData';

export namespace Choose {
  export const selector = 'System:Choose';
  export type ChangeParams<T> = { status: 'pending' } | { status: 'finally' } | { status: 'fulfilled', data: T } | { status: 'rejected', data: any };
  export type Attribute<D> = {
    data: D;
  }
  export type WhenAttribute<D> = {
    test: (data?: D) => boolean;
  }

  class ChildOtherWiseBase<A> extends ComponentBase<A> {
    public hidden = true;
  }

  class ChildBase<D> extends ChildOtherWiseBase<WhenAttribute<D>> {
    data?: D;
  }


  @Component({
    template: '<div dr-if="!@this@.hidden" dr-strip="true" >#innerHTML#</div>',
    selector: `${selector}.When`
  })
  export class When<D> extends ChildBase<D> {
    constructor() {
      super({onlyParentType: Choose<D>});
    }
  }

  @Component({
    template: '<div dr-if="!@this@.hidden" dr-strip="true" >#innerHTML#</div>',
    selector: `${selector}.OtherWise`
  })
  export class OtherWise<D> extends ChildBase<D> {
    constructor() {
      super({onlyParentType: Choose<D>});
    }
  }

  @Component({
    template: '#innerHTML#',
    selector: `${selector}`
  })
  export class Choose<D> extends ComponentBase<Attribute<D>> {

    // constructor() {
    //   super();
    //   console.log('!!!!!!!PromiseSwitch!!!!!constructor')
    // }

    // onCreateRenderData(data: OnCreateRenderDataParams) {
    //   super.onCreateRenderData(data);
    //   console.log('---------', this.children)
    // }
    private choose?: When<D> | OtherWise<D>;

    onCreatedThisChild(child: any, data: OnCreateRenderDataParams) {
      super.onCreatedThisChild(child, data);
      this.setChange(child);
    }

    onChangeAttrRender(name: string, value: any, other: OtherData) {
      super.onChangeAttrRender(name, value, other);
      // console.log('-----------changer Choose', name, value);
      // this.getChildren(Pending).forEach(it => {
      //   console.log('------------asdasd', it, it.attribute?.defaultView)
      // })
      if (this.equalsAttributeName(name, 'data')) {
        this.choose = undefined;
        const children = this.getChildren([When, OtherWise]).sort((a, b) => (a instanceof OtherWise ? 1 : 0) - (b instanceof OtherWise ? 1 : 0));
        children.forEach(it => this.setChange(it as any));

      }
    }

    private setChange(child: When<D> | OtherWise<D>) {
      child.data = this.attribute?.data;
      // when.hidden = true;
      // console.log('ccccc', this.choose)
      // console.log('---------', !this.done , when.attribute?.test?.(this.attribute?.data))
      if (!this.choose && child instanceof When && child.attribute?.test?.(this.attribute?.data)) {
        // console.log('------------', child.attribute?.test?.(this.attribute?.data))
        this.choose = child;
        if (child.hidden) {
          child.hidden = false;
        }
        // console.log('--------', when)
      } else if (this.choose !== child) {
        child.hidden = true;
      }

      if (!this.choose && child instanceof OtherWise) {
        this.choose = child;
        if (child.hidden) {
          child.hidden = false;
        }
      }
    }

    //   // const children = this.getChildren([When, OtherWise]).sort((a, b) => (a instanceof OtherWise ? 1 : 0) - (b instanceof OtherWise ? 1 : 0));
    //   const children = this.getChildren(When);
    //   const otherWiseChildren = this.getChildren(OtherWise);
    //
    //   otherWiseChildren.forEach(it => it.hidden = true);
    //
    //
    //   // console.log('--------', children)
    //   for (const when of children) {
    //     // when.hidden = true;
    //     // console.log('-----------', when, this.attribute?.data, when.attribute?.test?.(this.attribute?.data), this.done)
    //     // console.log('---------', !this.done , when.attribute?.test?.(this.attribute?.data))
    //     if (!this.choose && when.attribute?.test?.(this.attribute?.data)) {
    //       this.choose = when;
    //       when.hidden = false;
    //       // console.log('--------', when)
    //     } else if (this.choose !==  when) {
    //       when.hidden = true;
    //     }
    //   }
    //
    //
    //   if (!this.choose) {
    //     otherWiseChildren.forEach(it => {
    //       it.hidden = false;
    //     })
    //   }
    //
    // }
  }
}


