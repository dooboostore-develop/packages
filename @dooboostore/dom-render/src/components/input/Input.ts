import { ComponentBase } from '../ComponentBase';
import { DomRender, DomRenderRunConfig } from '../../DomRender';
import { RawSet } from '../../rawsets/RawSet';
import { OtherData } from '../../lifecycle/OnChangeAttrRender';
import { OnCreateRender } from '../../lifecycle/OnCreateRender';
import { OnDestroyRender, OnDestroyRenderParams } from '../../lifecycle/OnDestroyRender';
import { Subscription } from '@dooboostore/core/message/Subscription';
import { ValidUtils } from '@dooboostore/core/valid/ValidUtils';
import { map } from '@dooboostore/core/message/operators/map';
import { EventUtils } from '@dooboostore/core-web/event/EventUtils';
import { debounceTime } from '@dooboostore/core/message/operators/debounceTime';
import { distinctUntilChanged } from '@dooboostore/core/message/operators/distinctUntilChanged';

export namespace Input {
  export const selector = `dr-input`;
  export type Attribute = {
    name?: string;
    type?: string;
    id?: string;
    class?: string;
    debounceTime?: number;
    distinct?: boolean;
    input?: (value: string, element: Element) => void;
  };

  export class Base extends ComponentBase<any> {}

  // @Component({
  //   selector: `${selector}`,
  //   template,
  //   styles,
  // })
  export class Input extends Base implements OnCreateRender, OnDestroyRender {
    private element?: HTMLInputElement;
    private inputSubscription?: Subscription;
    private resetSubscripton?: Subscription;

    onCreateRender(...param: any[]): void {}

    async onInitRender(param: any, rawSet: RawSet) {
      await super.onInitRender(param, rawSet);
      // console.log('dr-input, rawSet', rawSet)
      const inputElement = this.element;
      const debounceTimeAttribute = this.getAttribute('debounceTime');
      const debounceTimeValue = ValidUtils.isNotNullUndefined(debounceTimeAttribute)
        ? Number(debounceTimeAttribute)
        : 0;
      const distinct = ValidUtils.isNotNullUndefined(this.getAttribute('distinct'));

      if (inputElement) {
        const makeDeboundceDistinctUtilChanged = () => {
          // let result$ = EventUtils.htmlElementEventObservable(inputElement,'input');

          let result$ = EventUtils.htmlElementEventObservable(inputElement, 'input').pipe(
            map((event: Event) => {
              const target = event.target;
              if (target instanceof HTMLInputElement) {
                return target.value.trim();
              }
              console.warn('Input event target is not an HTMLInputElement:', target);
              return '';
            })
          );

          if (ValidUtils.isNotNullUndefined(debounceTimeValue) && debounceTimeValue > 0) {
            result$ = result$.pipe(debounceTime(debounceTimeValue));
          }
          if (ValidUtils.isNotNullUndefined(distinct) && distinct === true) {
            result$ = result$.pipe(distinctUntilChanged());
          }
          return result$;
        };
        this.inputSubscription = makeDeboundceDistinctUtilChanged().subscribe(it => {
          // console.log('change?????????????', it);
          this.getAttribute('input')?.(it, inputElement);
        });

        if (inputElement.form) {
          this.resetSubscripton = EventUtils.htmlElementEventObservable(inputElement.form, 'reset').subscribe(it => {
            // console.log('rrrraaa?,', this.inputSubscription, it)
            this.inputSubscription?.unsubscribe();
            this.inputSubscription = makeDeboundceDistinctUtilChanged().subscribe(it => {
              // console.log('rrrr?')
              this.getAttribute('input')?.(it, inputElement);
            });
          });
        }
      }
    }

    onChangeAttrRender(name: string, value: any, other: OtherData) {
      super.onChangeAttrRender(name, value, other);
      // console.log('-------->',name, value)
      if (name === 'value') {
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

export default {
  input: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${Input.selector}`,
      template:
        '<Input type="${@this@.getAttribute(\'type\')}$" class="${@this@.getAttribute(\'class\')}$" id="${@this@.getAttribute(\'id\')}$" name="${@this@.getAttribute(\'name\')}$" dr-on-init="@this@.element=$element" >#innerHTML#',
      objFactory: (e, o, r2, counstructorParam) => {
        return DomRender.run({ rootObject: new Input.Input(...counstructorParam), config: config });
      }
    });
  }
};