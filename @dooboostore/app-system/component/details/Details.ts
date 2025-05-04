import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import template from './details.html';
import style from './details.css';
import detailsFormStyle from './detailsForm.css';
import { ValidUtils } from '@dooboostore/core-web/valid/ValidUtils';
import { EventUtils } from '@dooboostore/core-web/event/EventUtils';
import { Subscription } from '@dooboostore/core/message';
import { ComponentBase } from '../ComponentBase';
import { OnCreateRender } from '@dooboostore/dom-render/lifecycle/OnCreateRender';
import { OnCreateRenderDataParams } from '@dooboostore/dom-render/lifecycle/OnCreateRenderData';
import { OnInitRender } from '@dooboostore/dom-render/lifecycle/OnInitRender';
import { RawSet } from '@dooboostore/dom-render/rawsets/RawSet';
import { Config } from '@dooboostore/dom-render/configs/Config';
import { OtherData } from '@dooboostore/dom-render/lifecycle/OnChangeAttrRender';

export namespace Details {
  export const selector = 'System:Details';

  export type Attribute = {
    class?: string;
    toggle_form_reset?: boolean;
    disableOtherClickClose?: boolean;
    toggle?: (open: boolean) => void;
  }
  export type BodyAttribute = {
    float?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  } & Attribute

  @Component({
    template: '<summary class="${`${@this@.attribute.class} details-summary-container`}$">#innerHTML#</summary>',
    styles: '',
    selector: `${selector}.Summary`
  })
  export class Summary extends ComponentBase<Attribute> {
    constructor() {
      super({onlyParentType: [Details]});
    }
  }

  @Component({
    template: '<form class="${`${@this@.attribute.class} details-body-container details-form-${@this@.attribute.float}-container form`}$" dr-on-init="@this@.$element = $element;">#innerHTML#</form>',
    styles: detailsFormStyle,
    selector: `${selector}.Form`
  })
  export class Form extends ComponentBase<BodyAttribute> {
    private $element?: HTMLFormElement;
    constructor() {
      super({onlyParentType: [Details]});
    }
    reset() {
      this.$element?.reset();
    }
  }
  export const isForm = (instance: any): instance is Form => {
    return instance instanceof Form;
  }

  @Component({
    template: template,
    styles: style,
    // noStrip: true,
    selector: `${selector}`
  })
  export class Details extends ComponentBase<Attribute> implements OnCreateRender, OnInitRender {
    // private detailsElement?: HTMLDetailsElement;
    private documentClickSubscription?: Subscription;
    private toggleSubscription?: Subscription;
    private element?: HTMLDetailsElement;
    onCreateRenderData(data: OnCreateRenderDataParams) {
      super.onCreateRenderData(data);
    }

    onCreateRender(...param: any[]): void {
    }

    toggle(element: HTMLDetailsElement) {
      if (this.attribute?.toggle) {
        this.attribute.toggle(element.open);
      }
    }
    onInitRender(param: any, rawSet: RawSet): void {
      super.onInitRender(param,rawSet);

      if (ValidUtils.isBrowser() && this.rawSet?.dataSet.config.window) {
        const detailsElement = this.element;

        const document = this.rawSet.dataSet!.config!.window!.document!;
        this.documentClickSubscription = EventUtils.htmlElementEventObservable(document, 'click').subscribe(event => {
          if (this.attribute?.disableOtherClickClose) {
            return;
          }
          if (detailsElement && !detailsElement?.contains(event?.target as Node)){
            detailsElement.open = false;
          }
        })
        if (detailsElement) {
          this.toggleSubscription = EventUtils.htmlElementEventObservable(detailsElement, 'toggle').subscribe(it => {
            if (ValidUtils.coreValidUtils.isNotNullUndefined(this.attribute?.toggle_form_reset)) {
              this.children?.filter(isForm).forEach(it => {
                it.reset();
              })
            }
          })
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
