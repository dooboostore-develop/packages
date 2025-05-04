import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { ComponentBase } from '../ComponentBase';
import { OtherData } from '@dooboostore/dom-render/lifecycle/OnChangeAttrRender';
import { Promises } from '@dooboostore/core/promise';
import { OnCreateRenderDataParams } from '@dooboostore/dom-render/lifecycle/OnCreateRenderData';
import { ValidUtils } from '@dooboostore/core/valid/ValidUtils';

export namespace PromiseSwitch {
  export const selector = 'System:PromiseSwitch';
  export type ChangeParams<T> = { status: 'pending' } | { status: 'finally' } | { status: 'fulfilled', data: T } | { status: 'rejected', data: any };
  export type Attribute = {
    // trigger?: boolean;
    data: Promise<any> | (() => Promise<any>);
    change?: <T>(data: ChangeParams<T>) => void;
  }

  class ChildBase<T = any> extends ComponentBase<T> {
    public hidden = true;
  }

  @Component({
    template: '<div dr-if="!@this@.hidden" dr-strip="true">#innerHTML#</div>',
    selector: `${selector}.Default`
  })
  export class Default extends ChildBase {
  }

  @Component({
    template: '<div dr-if="!@this@.hidden" dr-strip="true">#innerHTML#</div>',
    selector: `${selector}.Pending`
  })
  export class Pending extends ChildBase<{ defaultView?: null }> {
    // onChangeAttrRender(name: string, value: any, other: OtherData) {
    //   super.onChangeAttrRender(name, value, other);
    //   if (this.equalsAttributeName(name, 'defaultView')) {
    //     // console.log('--------------', value)
    //     if (value !== null) {
    //       this.hidden = false;
    //     } else {
    //       this.hidden = true;
    //     }
    //     // console.log('--------------', this.hidden)
    //   }
    // }
  }

  @Component({
    template: '<div dr-if="!@this@.hidden" dr-strip="true">#innerHTML#</div>',
    selector: `${selector}.Fulfilled`
  })
  export class Fulfilled<T = any> extends ChildBase {
    private data?: T;

    setData(data: T) {
      this.data = data;
    }
  }

  @Component({
    template: '<div dr-if="!@this@.hidden" dr-strip="true">#innerHTML#</div>',
    selector: `${selector}.Rejected`
  })
  export class Rejected<T = any> extends ChildBase {
    private data?: T;

    setData(data: T) {
      this.data = data;
    }
  }

  @Component({
    template: '#innerHTML#',
    selector: `${selector}`
  })
  export class PromiseSwitch extends ComponentBase<Attribute> {
    // private promise?:  {
    //   state: 'reject' | 'resolve',
    //
    // }
    private promiseState?: Promises.Result.PromiseState<any, unknown>;

    onCreatedThisChild(child: any, data: OnCreateRenderDataParams) {
      super.onCreatedThisChild(child, data);
      this.childStateChange();
    }

    childStateChange() {
      const defaults = this.getChildren(Default);
      const pendings = this.getChildren(Pending);
      const fulfilleds = this.getChildren(Fulfilled);
      const rejecteds = this.getChildren(Rejected);
      const full = [...fulfilleds, ...rejecteds, ...pendings, ...defaults]
      // console.log('----!!!!!!-------', this.promiseState, full)
      if (this.promiseState === undefined) {
        full.filter(it => !it.hidden).forEach(it => it.hidden = true)
        defaults.filter(it => it.hidden).forEach(it => it.hidden = false);
        pendings.filter(it => it.attribute?.defaultView && it.hidden).forEach(it => it.hidden = false);
      } else if (this.promiseState.status === 'pending') {
        full.filter(it => !it.hidden).forEach(it => it.hidden = true)
        pendings.filter(it => it.hidden).forEach(it => it.hidden = false);
      } else if (this.promiseState.status === 'fulfilled') {
        const value = this.promiseState.value;
        console.log('-----------fulfilled promises', value);
        full.filter(it => !it.hidden).forEach(it => it.hidden = true)
        fulfilleds.forEach(it => {
          it.setData(value)
        })
        fulfilleds.filter(it => it.hidden).forEach(it => it.hidden = false);
      } else if (this.promiseState.status === 'rejected') {
        const value = this.promiseState.reason;
        full.filter(it => !it.hidden).forEach(it => it.hidden = true)
        rejecteds.forEach(it => {
          it.setData(value)
        })
        rejecteds.filter(it => it.hidden).forEach(it => it.hidden = false);
      }
    }

    onChangeAttrRender(name: string, value: any, other: OtherData) {
      super.onChangeAttrRender(name, value, other);
      console.log('-----------changer promises', name, value, this.getChildren(Default));
      if (this.equalsAttributeName(name, 'data') && value) {
        this.childStateChange();
        this.attribute?.change?.({status: 'pending'});
        this.promiseState = undefined;
        this.promiseState = Promises.Result.wrap(typeof value === 'function' ? value() : value as Promise<any>);
        // console.log('----?', this.promiseState)
        this.promiseState.then(data => {
          // console.log('------------then', data);
          this.childStateChange();
          this.attribute?.change?.({status: 'fulfilled', data: data});
          return data;
        }).catch((e) => {
          // console.log('catch', e)
          this.childStateChange();
          this.attribute?.change?.({status: 'rejected', data: e});
          throw e;
        }).finally(() => {
          // console.log('-------------finally--------rrrrrrrrrrr', this.promiseState)
          // this.childStateChange();
          this.attribute?.change?.({status: 'finally'});
        })
        // await this.promiseState;


        // console.log('---------------------rrrrrrrrrrr', this.promiseState)
      } else if(this.equalsAttributeName(name, 'data') && ValidUtils.isNullOrUndefined(value)) {
        this.promiseState = undefined;
        this.childStateChange();
      }
    }
  }
}


