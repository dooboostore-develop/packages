import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { ComponentBase } from '../ComponentBase';
import { OtherData } from '@dooboostore/dom-render/lifecycle/OnChangeAttrRender';
import { RawSet } from '@dooboostore/dom-render/rawsets/RawSet';
import { Appender as DomRenderAppender } from '@dooboostore/dom-render/operators/Appender';
import { OnInitRender } from '@dooboostore/dom-render/lifecycle/OnInitRender';
import { OnCreateRender } from '@dooboostore/dom-render/lifecycle/OnCreateRender';

export namespace Appender {
  export const selector = 'System:Appender';
  // export type AppenderInterface<D> = {
  //   push(...data:D[]):void;
  //   set(key: string, ...v:D[]):void
  //   delete(key: string):void
  //   clear():void
  // }
  export type Attribute<D> = {
    appender: DomRenderAppender;
    onCreate?: (appender: DomRenderAppender) => void;
  }

  @Component({
    template: '<div dr-appender="@this@.appender" dr-option-strip="true">#innerHTML#</div>',
    selector: `${selector}`
  })
  export class Appender<D> extends ComponentBase<Attribute<D>> implements OnInitRender {
    private appender?:DomRenderAppender

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
      if(this.equalsAttributeName(name, 'appender')) {
        this.appender = value;
      }
      // console.log('------>appender', name, value);
    }
  }
}


