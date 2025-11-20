import { ComponentBase } from '../ComponentBase';
import { DomRender, DomRenderRunConfig } from '../../DomRender';
import { RawSet } from '../../rawsets/RawSet';
import { OtherData } from '../../lifecycle/OnChangeAttrRender';
import { OnInitRender } from '../../lifecycle/OnInitRender';
import { OnCreateRenderDataParams } from '../../lifecycle/OnCreateRenderData';
import { OnCreateRender } from '../../lifecycle/OnCreateRender';
import { type Subscription } from '@dooboostore/core/message/Subscription';
import { ValidUtils } from '@dooboostore/core-web/valid/ValidUtils';
import { EventUtils } from '@dooboostore/core-web/event/EventUtils';

export namespace Details {
  export const selector = 'dr-details';

  export type Attribute = {
    class?: string;
    toggle_form_reset?: boolean;
    disableOtherClickClose?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    toggle?: (open: boolean) => void;
  };
  export type BodyAttribute = {
    float?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  } & Attribute;

  export type FormAttribute = {
    disabledSubmit?: null;
    submit?: (event: SubmitEvent, element: HTMLFormElement) => void;
  } & BodyAttribute;

  // @Component({
  //   template: '<summary class="${`${@this@.getAttribute(\'class\')} details-summary-container`}$">#innerHTML#</summary>',
  //   styles: '',
  //   selector: `${selector}.Summary`
  // })
  export class Summary extends ComponentBase<Attribute> {
    constructor() {
      super({ onlyParentType: [Details] });
    }
  }

  // @Component({
  //   template: '<div class="${`${@this@.getAttribute(\'class\')} details-body-container details-body-${@this@.getAttribute(\'float\')}-container`}$" dr-on-init="@this@.$element = $element;">#innerHTML#</div>',
  //   selector: `${selector}.Body`
  // })
  export class Body extends ComponentBase<BodyAttribute> {
    private $element?: HTMLDivElement;
    constructor() {
      super({ onlyParentType: [Details] });
    }
  }

  export const isBody = (instance: any): instance is Body => {
    return instance instanceof Body;
  };

  // @Component({
  //   template: '<form class="${`${@this@.getAttribute(\'class\')} details-body-container details-body-${@this@.getAttribute(\'float\')}-container details-form-container`}$" dr-on-init="@this@.$element = $element;" dr-event-submit="@this@.submit($element,$event);">#innerHTML#</form>',
  //   styles: detailsFormStyle,
  //   selector: `${selector}.Form`
  // })
  export class Form extends ComponentBase<FormAttribute> {
    private $element?: HTMLFormElement;
    constructor() {
      super({ onlyParentType: [Details] });
    }
    submit(element: HTMLFormElement, event: SubmitEvent) {
      if (this.hasAttribute('disabledSubmit')) {
        event.preventDefault();
      }
      if (this.hasAttribute('submit')) {
        this.getAttribute('submit')?.(event, element);
      }
    }
    reset() {
      this.$element?.reset();
    }
  }
  export const isForm = (instance: any): instance is Form => {
    return instance instanceof Form;
  };

  // @Component({
  //   template: template,
  //   styles: style,
  //   // noStrip: true,
  //   selector: `${selector}`
  // })
  export class Details extends ComponentBase<Attribute> implements OnCreateRender, OnInitRender {
    // private detailsElement?: HTMLDetailsElement;
    private documentClickSubscription?: Subscription;
    private toggleSubscription?: Subscription;
    private element?: HTMLDetailsElement;
    onCreateRenderData(data: OnCreateRenderDataParams) {
      super.onCreateRenderData(data);
    }

    onCreateRender(...param: any[]): void {}

    toggle(element: HTMLDetailsElement) {
      const toggleAttribute = this.getAttribute('toggle');
      if (toggleAttribute) {
        toggleAttribute?.(element.open);
      }
      if (element.open) {
        this.getAttribute('onOpen')?.();
      } else {
        this.getAttribute('onClose')?.();
      }
    }
    async onInitRender(param: any, rawSet: RawSet) {
      await super.onInitRender(param, rawSet);

      if (ValidUtils.isBrowser() && this.rawSet?.dataSet.config.window) {
        const detailsElement = this.element;

        const document = this.rawSet.dataSet!.config!.window!.document!;
        this.documentClickSubscription = EventUtils.htmlElementEventObservable(document, 'click').subscribe(event => {
          if (this.getAttribute('disableOtherClickClose')) {
            return;
          }
          if (detailsElement && !detailsElement?.contains(event?.target as Node)) {
            detailsElement.open = false;
          }
        });
        if (detailsElement) {
          this.toggleSubscription = EventUtils.htmlElementEventObservable(detailsElement, 'toggle').subscribe(it => {
            if (ValidUtils.coreValidUtils.isNotNullUndefined(this.getAttribute('toggle_form_reset'))) {
              this.children?.filter(isForm).forEach(it => {
                it.reset();
              });
            }
          });
        }
      }
      // console.log('aaaaaaaaaaaaaaaaaaaaa', rawSet);
    }

    onChangeAttrRender(name: string, value: any, other: OtherData) {
      super.onChangeAttrRender(name, value, other);
    }

    onDestroyRender(...metaData: any[]): void {
      this.toggleSubscription?.unsubscribe();
      this.documentClickSubscription?.unsubscribe();
      // console.log('onDestroyRender', metaData);
      // if (ValidUtils.isBrowser()) {
      //   document.removeEventListener('click', this.ccc)
      // }
    }

    // changeAttribute(attribute: { className: string } | undefined) {
    // }
  }
}

export default {
  detailsSummary: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${Details.selector}-summary`,
      template:
        '<summary class="${`${@this@.getAttribute(\'class\')} details-summary-container`}$">#innerHTML#</summary>',
      objFactory: (e, o, r2, counstructorParam) => {
        return DomRender.run({ rootObject: new Details.Summary(), config: config });
      }
    });
  },
  detailsBody: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${Details.selector}-body`,
      template:
        '<div class="${`${@this@.getAttribute(\'class\')} details-body-container details-body-${@this@.getAttribute(\'float\')}-container`}$" dr-on-init="@this@.$element = $element;">#innerHTML#</div>',
      objFactory: (e, o, r2, counstructorParam) => {
        return DomRender.run({ rootObject: new Details.Body(), config: config });
      }
    });
  },
  detailsForm: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${Details.selector}-form`,
      template:
        '<form class="${`${@this@.getAttribute(\'class\')} details-body-container details-body-${@this@.getAttribute(\'float\')}-container details-form-container`}$" dr-on-init="@this@.$element = $element;" dr-event-submit="@this@.submit($element,$event);">#innerHTML#</form>',
      objFactory: (e, o, r2, counstructorParam) => {
        return DomRender.run({ rootObject: new Details.Form(), config: config });
      }
    });
  },
  details: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${Details.selector}`,
      styles: `
        .details-container {
            position: relative;
        }

        .details-container .details-body-container {
            position: absolute;
        }


        .details-container .details-body-bottom-left-container {
            position: absolute;
            left: 0;
            top: 100%;
            /*margin-top: 0px;*/
            /*width: max-content;*/
        }

        .details-container .details-body-bottom-right-container {
            position: absolute;
            right: 0;
            top: 100%;
            /*margin-top: 0px;*/
            /*width: max-content;*/
        }

        .details-container .details-body-top-left-container {
            position: absolute;
            left: 0;
            bottom: 100%;
            /*margin-bottom: 0px;*/
            /*width: max-content;*/
        }

        .details-container .details-body-top-right-container {
            position: absolute;
            right: 0;
            bottom: 100%;
            /*margin-bottom: 0px;*/
        }
      `,
      template:
        '<details class="${`${@this@.getAttribute(\'class\')} details-container`}$" dr-on-init="@this@.element = $element;" dr-event-toggle="@this@.toggle($element)"> #innerHTML# </details>',
      objFactory: (e, o, r2, counstructorParam) => {
        return DomRender.run({ rootObject: new Details.Details(...counstructorParam), config: config });
      }
    });
  }
};