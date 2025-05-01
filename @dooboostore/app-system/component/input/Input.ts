import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { ComponentBase } from '../ComponentBase';
import { debounceTime, distinctUntilChanged, fromEvent, map, OperatorFunction, Subscription, switchMap } from 'rxjs';
import { ValidUtils } from '@dooboostore/core/valid/ValidUtils';
import { OnDestroyRender, OnDestroyRenderParams } from '@dooboostore/dom-render/lifecycle/OnDestroyRender';
import { OnCreateRender } from '@dooboostore/dom-render/lifecycle/OnCreateRender';
import { Store } from '../../store/Store';

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
    selector: `${selector}.Text`,
    template: '<input name="${@this@.attribute.name}$" dr-on-init="@this@.onCreateInputElement($element)">'
  })
  export class Text extends Base implements OnCreateRender, OnDestroyRender {
    public name = 'input';
    private inputElement?: HTMLInputElement;
    private inputSubscription?: Subscription;

    onCreateRender(...param: any[]): void {
    }

    onCreateInputElement(element: HTMLInputElement) {
      this.inputElement = element;
      const debounceTime = ValidUtils.isNotNullUndefined(this.attribute.input_debounce_time) ? Number(this.attribute.input_debounce_time) : 0;
      const distinct = ValidUtils.isNotNullUndefined(this.attribute.input_distinct);
      this.inputSubscription = Store.Observable.createDebounceDistinctUntilChanged(fromEvent(element, 'input').pipe(
        map(event => (event.target as HTMLInputElement).value.trim())
      ),{debounceTime, distinct}).subscribe((it: string) => {
        this.attribute?.on_input_value?.(it, element);
      });
    }

    onDestroyRender(metaData?: OnDestroyRenderParams): void {
      this.inputSubscription?.unsubscribe();
    }

  }
}