import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { ComponentBase } from '../ComponentBase';
import { fromEvent, map  } from 'rxjs';
import { ValidUtils } from '@dooboostore/core/valid/ValidUtils';
import { OnDestroyRender, OnDestroyRenderParams } from '@dooboostore/dom-render/lifecycle/OnDestroyRender';
import { OnCreateRender } from '@dooboostore/dom-render/lifecycle/OnCreateRender';
import { Store } from '../../store/Store';
import { RawSet } from '@dooboostore/dom-render/rawsets/RawSet';
import { EventUtils } from '@dooboostore/core-web/event/EventUtils';
import { Subscription } from '@dooboostore/core/message';
import template from './input.html'
import styles from './input.css'
import { OtherData } from '@dooboostore/dom-render/lifecycle/OnChangeAttrRender';
export namespace Input {
  export const selector = `System:Input`;
  export type Attribute = {
    name?: string;
    type?: string;
    id?: string;
    class?: string;
    debounceTime?: number;
    distinct?: boolean;
    input?: (value: string, element: Element) => void

  }

  export class Base extends ComponentBase<any> {

  }

  @Component({
    selector: `${selector}`,
    template,
    styles,
  })
  export class Input extends Base implements OnCreateRender, OnDestroyRender {
    private element?: HTMLInputElement;
    private inputSubscription?: Subscription;
    private resetSubscripton?: Subscription;

    private wow:any ={};
    private name='ssvvvvv'
    onCreateRender(...param: any[]): void {
    }


    onInitRender(param: any, rawSet: RawSet) {
      super.onInitRender(param, rawSet);
      const inputElement = this.element;
      const debounceTime = ValidUtils.isNotNullUndefined(this.attribute.debounceTime) ? Number(this.attribute.debounceTime) : 0;
      const distinct = ValidUtils.isNotNullUndefined(this.attribute.distinct);

      const makeDeboundceDistinctUtilChanged = () => {

        return Store.Observable.createDebounceDistinctUntilChanged(fromEvent(inputElement!, 'input').pipe(
          map(event => (event.target as HTMLInputElement).value.trim())
        ), {debounceTime, distinct});
      };

      this.inputSubscription = makeDeboundceDistinctUtilChanged().subscribe(it => {
        this.attribute?.input?.(it, inputElement);
      });

      if (inputElement && inputElement.form) {
        this.resetSubscripton = EventUtils.htmlElementEventObservable(inputElement.form, 'reset').subscribe(it => {
          this.inputSubscription?.unsubscribe();
          this.inputSubscription = makeDeboundceDistinctUtilChanged().subscribe(it => {
            this.attribute?.input?.(it, inputElement);
          });
        })
      }
    }

    onChangeAttrRender(name: string, value: any, other: OtherData) {
      super.onChangeAttrRender(name, value, other);
      // console.log('-------->',name, value)
      if (name==='value') {
        // console.log('changeAttribu', name, value)
        // this.wow = {value: value};
        // this.name = value;
      }
    }

    onDestroyRender(metaData?: OnDestroyRenderParams): void {
      this.resetSubscripton?.unsubscribe();
      this.inputSubscription?.unsubscribe();
    }

  }
}