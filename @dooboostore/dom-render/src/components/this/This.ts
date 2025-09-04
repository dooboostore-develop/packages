import { ComponentBase } from '../ComponentBase';
import { DomRender, DomRenderRunConfig } from '../../DomRender';
import { RawSet } from '../../rawsets/RawSet';
import { OtherData } from '../../lifecycle/OnChangeAttrRender';
import { OnInitRender } from '../../lifecycle/OnInitRender';
import { ComponentSet } from '../../components/ComponentSet';

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
    createArguments: any[];
    onCreated?: (value: any) => void;
  }

  // @Component({
  //   template: '<div dr-this="@this@.this" dr-option-strip="true" dr-on-create:arguments="@this@.createArguments">#innerHTML#</div>',
  //   selector: `${selector}`
  // })
  export class This extends ComponentBase<Attribute> implements OnInitRender {
    private value?: ComponentSet
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
      console.log('change Attribute', value, value);
      if (this.equalsAttributeName(name, 'value')) {
        this.value = value;
      }
      if (this.equalsAttributeName(name, 'createArguments')) {
        this.createArguments = value;
      }
      // console.log('------>appender', name, value);
    }

    created(component: any){
      component??=this.value?.obj;
      console.log('created!!', component)
      this.getAttribute('onCreated')?.(component);
    }
  }

}


export default {
  this: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: This.selector,
      template: '<div dr-this="@this@.value" dr-option-strip="true" dr-on-create:arguments="@this@.createArguments" dr-on-create:callback="@this@.created($component)">#innerHTML#</div>',
      objFactory: (e, o, r2, counstructorParam) => {
        return DomRender.run({rootObject: new This.This(...counstructorParam), config: config});
      }
    })
  },
}

