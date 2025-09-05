import { ComponentBase } from '../ComponentBase';
import { DomRender, DomRenderRunConfig } from '../../DomRender';
import { RawSet } from '../../rawsets/RawSet';
import { OtherData } from '../../lifecycle/OnChangeAttrRender';
import { OnInitRender } from '../../lifecycle/OnInitRender';
import { ComponentSet } from '../../components/ComponentSet';
import {drComponent} from '../index'
export namespace This {
  export const selector = 'dr-this';
  // export type AppenderInterface<D> = {
  //   push(...data:D[]):void;
  //   set(key: string, ...v:D[]):void
  //   delete(key: string):void
  //   clear():void
  // }
  export type Attribute = {
    value: ComponentSet;
    if: boolean | null;
    createArguments: any[];
    onCreated?: (value: any) => void;
  }

  // @Component({
  //   template: '<div dr-this="@this@.this" dr-option-strip="true" dr-on-create:arguments="@this@.createArguments">#innerHTML#</div>',
  //   selector: `${selector}`
  // })
  export class This extends ComponentBase<Attribute> implements OnInitRender {
    private value?: ComponentSet
    private if?: boolean | null = null;
    private createArguments?: any[]

    // onCreateRender(...param: any) {
    //   console.log('--onCreateRender')
    // }

    // test() {
    //   console.log('t', this.getAttribute('appender'))
    // }
    onInitRender(param: any, rawSet: RawSet) {
      // console.log('--onInitRender onInitRender')
      super.onInitRender(param, rawSet);


    }

    // push(...data:D[]) {
    //   console.log('push/////', data);
    //   this.appender.push(...data);
    // }
    //
    // set(key: string, v: D): void {
    //   this.appender.set(key, v)
    // }
    //
    // delete(key: string): void {
    //   this.appender.delete(key);
    // }
    //
    // clear(): void {
    //   this.appender.clear();
    // }


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

    created(component: any){
      component??=this.value?.obj;
      this.getAttribute('onCreated')?.(component);
    }
  }

}


export default {
  this: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: This.selector,
      // template: '<dr-if value="${(!!@this@?.value) && (@this@.if === null ? true : @this@.if)}$"><div dr-this="@this@?.value" dr-option-strip="true" dr-on-create:arguments="@this@.createArguments" dr-on-create:callback="@this@.created($component)">#innerHTML#</div></dr-if>',
      // template: '<dr-if value="${(!!@this@?.value) && (@this@.if === null ? true : @this@.if)}$"><div dr-this="@this@?.value" dr-option-strip="true" dr-on-create:arguments="@this@.createArguments" dr-on-create:callback="@this@.created($component)">#innerHTML#</div></dr-if>',
      template: '<div dr-this="@this@?.value" dr-detect-option-if="@this@?.if" dr-option-strip="true" dr-on-create:arguments="@this@.createArguments" dr-on-create:callback="@this@.created($component)">#innerHTML#</div>',
      // template: '${(!!@this@?.value) && (@this@.if === null ? true : @this@.if)}$<div dr-this="@this@?.value" dr-option-strip="true" dr-option-if="${(!!@this@?.value) && (@this@.if === null ? true : @this@.if)}$" dr-on-create:arguments="@this@.createArguments" dr-on-create:callback="@this@.created($component)">#innerHTML#</div>',
      objFactory: (e, o, r2, counstructorParam) => {
        return DomRender.run({rootObject: new This.This(...counstructorParam), config: config});
      }
    })
  },
}

