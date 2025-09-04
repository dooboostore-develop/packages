import { ComponentBase } from '../ComponentBase';
import { DomRender, DomRenderRunConfig } from '../../DomRender';
import { RawSet } from '../../rawsets/RawSet';
import { OtherData } from '../../lifecycle/OnChangeAttrRender';
import { OnInitRender } from '../../lifecycle/OnInitRender';
import { Appender as DomRenderAppender } from '../../operators/Appender';


export namespace Appender {
  export const selector = 'dr-appender';
  // export type AppenderInterface<D> = {
  //   push(...data:D[]):void;
  //   set(key: string, ...v:D[]):void
  //   delete(key: string):void
  //   clear():void
  // }
  export type Attribute<D> = {
    value: DomRenderAppender<D>;
    onCreate?: (appender: DomRenderAppender) => void;
  }

  // @Component({
  //   template: '<div dr-appender="@this@.appender" dr-option-strip="true">#innerHTML#</div>',
  //   selector: `${selector}`
  // })
  export class Appender<D> extends ComponentBase<Attribute<D>> implements OnInitRender {
    private value?:DomRenderAppender

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
      if(this.equalsAttributeName(name, 'value')) {
        this.value = value;
      }
      // console.log('------>appender', name, value);
    }
  }
}


export default {
  appender: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: Appender.selector,
      template: '<div dr-appender="@this@.value" dr-option-strip="true">#innerHTML#</div>',
      objFactory: (e,o,r2, counstructorParam) => {
        return DomRender.run({rootObject: new Appender.Appender(...counstructorParam), config: config});
      }
    })
  },
}


