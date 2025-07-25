import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { ComponentBase } from '../ComponentBase';
import { OtherData } from '@dooboostore/dom-render/lifecycle/OnChangeAttrRender';
import { RawSet } from '@dooboostore/dom-render/rawsets/RawSet';
import { Appender as DomRenderAppender } from '@dooboostore/dom-render/operators/Appender';
import { OnInitRender } from '@dooboostore/dom-render/lifecycle/OnInitRender';
import { OnCreateRender } from '@dooboostore/dom-render/lifecycle/OnCreateRender';

export namespace If {
  export const selector = 'System:If';
  // export type AppenderInterface<D> = {
  //   push(...data:D[]):void;
  //   set(key: string, ...v:D[]):void
  //   delete(key: string):void
  //   clear():void
  // }
  export type Attribute<D> = {
    data?: (appender: DomRenderAppender) => void;
  }

  @Component({
    template: '<div dr-if="@this@.sw" dr-option-strip="true">#innerHTML#</div>',
    selector: `${selector}`
  })
  export class Appender<D> extends ComponentBase<Attribute<D>> implements OnInitRender {
    private appender = new DomRenderAppender();

    // onCreateRender(...param: any) {
    //   console.log('--onCreateRender')
    // }
    private sw: boolean = false;

    onInitRender(param: any, rawSet: RawSet) {
      // console.log('--onInitRender onInitRender')
      super.onInitRender(param, rawSet);

      // const onCreate = this.attribute?.if;
      // if (onCreate && typeof onCreate === 'function') {
      //   onCreate(this.appender);
      // }
      // setInterval(() => {
      //   this.ddd.push('a'+ (new Date().toISOString()));
      // }, 1000)
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

      if (this.equalsAttributeName(name, 'data')) {
        this.sw = value;
      }
    }
  }
}


