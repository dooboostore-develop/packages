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

export namespace Input {
  export const selector = `Input`;
  export type Attribute = {
    name?: string;
    input_debounce_time?: number;
    input_distinct?: boolean;
    on_input_value?: (value: string, element: Element) => void

  }

  export class Base extends ComponentBase<any> {

  }

  @Component({
    selector: `${selector}`,
    noStrip: true,
  })
  export class Text extends Base implements OnCreateRender, OnDestroyRender {
    // private inputElement?: HTMLInputElement;
    private inputSubscription?: Subscription;
    private resetSubscripton?: Subscription;

    onCreateRender(...param: any[]): void {
    }


    onInitRender(param: any, rawSet: RawSet) {
      super.onInitRender(param, rawSet);
      const inputElement = this.getElement?.() as HTMLInputElement;
      const debounceTime = ValidUtils.isNotNullUndefined(this.attribute.input_debounce_time) ? Number(this.attribute.input_debounce_time) : 0;
      const distinct = ValidUtils.isNotNullUndefined(this.attribute.input_distinct);

      const makeDeboundceDistinctUtilChanged = () => {

        return Store.Observable.createDebounceDistinctUntilChanged(fromEvent(inputElement!, 'input').pipe(
          map(event => (event.target as HTMLInputElement).value.trim())
        ), {debounceTime, distinct});
      };

      this.inputSubscription = makeDeboundceDistinctUtilChanged().subscribe(it => {
        this.attribute?.on_input_value?.(it, inputElement);
      });

      if (inputElement && inputElement.form) {
        this.resetSubscripton = EventUtils.htmlElementEventObservable(inputElement.form, 'reset').subscribe(it => {
          this.inputSubscription?.unsubscribe();
          this.inputSubscription = makeDeboundceDistinctUtilChanged().subscribe(it => {
            this.attribute?.on_input_value?.(it, inputElement);
          });
        })
      }

    }

    onDestroyRender(metaData?: OnDestroyRenderParams): void {
      this.resetSubscripton?.unsubscribe();
      this.inputSubscription?.unsubscribe();
    }

  }
}