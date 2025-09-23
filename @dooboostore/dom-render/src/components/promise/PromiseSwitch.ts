import { ComponentBase } from '../ComponentBase';
import { DomRender, DomRenderRunConfig } from '../../DomRender';
import { RawSet } from '../../rawsets/RawSet';
import { OtherData } from '../../lifecycle/OnChangeAttrRender';


import { ValidUtils } from '@dooboostore/core/valid/ValidUtils';
import { Promises  } from '@dooboostore/core/promise/Promises';
import { OnCreateRenderDataParams } from '../../lifecycle/OnCreateRenderData';

export namespace PromiseSwitch {
  export const selector = 'dr-promise-switch';
  export type ChangeParams<T> = { status: 'pending' } | { status: 'finally' } | { status: 'fulfilled', data: T } | { status: 'rejected', data: any };
  export type Attribute = {
    // trigger?: boolean;
    data: Promise<any> | (() => Promise<any>);
    change?: <T>(data: ChangeParams<T>) => void;
  }

  class ChildBase<T = any> extends ComponentBase<T> {
    public hidden = true;
  }

  // @Component({
  //   template: '<div dr-if="!@this@.hidden" dr-strip="true">#innerHTML#</div>',
  //   selector: `${selector}.Default`
  // })
  export class Default extends ChildBase {
  }

  // @Component({
  //   template: '<div dr-if="!@this@.hidden" dr-strip="true">#innerHTML#</div>',
  //   selector: `${selector}.Pending`
  //   // selector: `System-PromiseSwitch.Pending`
  // })
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

  // @Component({
  //   template: '<div dr-if="!@this@.hidden" dr-strip="true">#innerHTML#</div>',
  //   selector: `${selector}.Fulfilled`
  // })
  export class Fulfilled<T = any> extends ChildBase {
    private data?: T;

    setData(data: T) {
      this.data = data;
    }
  }

  // @Component({
  //   template: '<div dr-if="!@this@.hidden" dr-strip="true">#innerHTML#</div>',
  //   selector: `${selector}.Rejected`
  // })
  export class Rejected<T = any> extends ChildBase {
    private data?: T;

    setData(data: T) {
      this.data = data;
    }
  }


  /*
      <dr-promise-switch data="${@this@.pickWorldPromise}$">
        ${@nearThis@.promiseState.status}$
        <dr-promise-switch-default>
            <button class="random-world-button" dr-event-click="@this@.pickWorld()">
                <i class="fa-solid fa-dice"></i>
            </button>
        </dr-promise-switch-default>
        <dr-promise-switch-pending>
            <button class="random-world-button disabled spin" >
                <i class="fa-solid fa-dice"></i>
            </button>
        </dr-promise-switch-pending>
    </dr-promise-switch>
   */
  // @Component({
  //   template: '#innerHTML#',
  //   selector: `${selector}`
  // })
  export class PromiseSwitch extends ComponentBase<Attribute> {
    // private promise?:  {
    //   state: 'reject' | 'resolve',
    //
    // }
    private promiseState?: Promises.Result.PromiseState<any, unknown>;
    private status?: Promises.Result.PromiseState<any, unknown>["status"];

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
        this.status = undefined;
        full.filter(it => !it.hidden).forEach(it => it.hidden = true)
        defaults.filter(it => it.hidden).forEach(it => it.hidden = false);
        pendings.filter(it => it.getAttribute('defaultView') && it.hidden).forEach(it => it.hidden = false);
      } else if (this.promiseState.status === 'pending') {
        this.status = 'pending';
        full.filter(it => !it.hidden).forEach(it => it.hidden = true)
        pendings.filter(it => it.hidden).forEach(it => it.hidden = false);
      } else if (this.promiseState.status === 'fulfilled') {
        this.status = 'fulfilled';
        const value = this.promiseState.value;
        // console.log('-----------fulfilled promises', value);
        full.filter(it => !it.hidden).forEach(it => it.hidden = true)
        fulfilleds.forEach(it => {
          it.setData(value)
        })
        fulfilleds.filter(it => it.hidden).forEach(it => it.hidden = false);
      } else if (this.promiseState.status === 'rejected') {
        this.status = 'rejected';
        const value = this.promiseState.reason;
        full.filter(it => !it.hidden).forEach(it => it.hidden = true)
        rejecteds.forEach(it => {
          it.setData(value)
        })
        rejecteds.filter(it => it.hidden).forEach(it => it.hidden = false);
      }
      return this.status;
      // console.log('----!!!!!!-end------', this.promiseState, full.map(it=>it.hidden))
    }

    onChangeAttrRender(name: string, value: any, other: OtherData) {
      super.onChangeAttrRender(name, value, other);
      // console.log('-----------changer promises', name, value, this.getChildren(Default));
      if (this.equalsAttributeName(name, 'data') && value) {
        // this.childStateChange();
        this.promiseState = undefined;
        this.status = undefined;
        this.promiseState = Promises.Result.wrap(typeof value === 'function' ? value() : value as Promise<any>);
        this.getAttribute('change')?.({status: 'pending'});
        this.childStateChange();
        // console.log('----?', this.promiseState)
        this.promiseState.then(data => {
          // console.log('------------then', data);
          this.childStateChange();
          this.getAttribute('change')?.({status: 'fulfilled', data: data});
          return data;
        }).catch((e) => {
          // console.log('catch', e)
          this.childStateChange();
          this.getAttribute('change')?.({status: 'rejected', data: e});
          throw e;
        }).finally(() => {
          // console.log('-------------finally--------rrrrrrrrrrr', this.promiseState)
          // this.childStateChange();
          this.getAttribute('change')?.({status: 'finally'});
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


export default {
  promiseDefault: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${PromiseSwitch.selector}-default`,
      template: '<div dr-if="!@this@.hidden" dr-option-strip="true">#innerHTML#</div>',
      objFactory: (e,o,r2, counstructorParam) => {
        return DomRender.run({rootObject: new PromiseSwitch.Default(...counstructorParam), config: config});
      }
    })
  },
  promisePending: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${PromiseSwitch.selector}-pending`,
      template: '<div dr-if="!@this@.hidden" dr-option-strip="true">#innerHTML#</div>',
      objFactory: (e,o,r2, counstructorParam) => {
        return DomRender.run({rootObject: new PromiseSwitch.Pending(...counstructorParam), config: config});
      }
    })
  },
  promiseFulfilled: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${PromiseSwitch.selector}-fulfilled`,
      template: '<div dr-if="!@this@.hidden" dr-option-strip="true">#innerHTML#</div>',
      objFactory: (e,o,r2, counstructorParam) => {
        return DomRender.run({rootObject: new PromiseSwitch.Fulfilled(...counstructorParam), config: config});
      }
    })
  },
  promiseRejected: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${PromiseSwitch.selector}-rejected`,
      template: '<div dr-if="!@this@.hidden" dr-option-strip="true">#innerHTML#</div>',
      objFactory: (e,o,r2, counstructorParam) => {
        return DomRender.run({rootObject: new PromiseSwitch.Rejected(...counstructorParam), config: config});
      }
    })
  },
  promiseSwitch: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${PromiseSwitch.selector}`,
      template: '#innerHTML#',
      objFactory: (e,o,r2, counstructorParam) => {
        return DomRender.run({rootObject: new PromiseSwitch.PromiseSwitch(...counstructorParam), config: config});
      }
    })
  },

}
