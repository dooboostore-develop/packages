import {attribute, ChildrenSet, ComponentBase} from '../ComponentBase';
import {DomRender, DomRenderRunConfig} from '../../DomRender';
import {RawSet} from '../../rawsets/RawSet';
import {OnCreateRenderData} from '../../lifecycle/OnCreateRenderData';
import {OnInitRender} from '../../lifecycle/OnInitRender';
import {OnDestroyRender} from '../../lifecycle/OnDestroyRender';
import {EventUtils} from '@dooboostore/core-web/event/EventUtils';
import {type Subscription} from '@dooboostore/core/message/Subscription';
import {ValidUtils} from '@dooboostore/core-web/valid/ValidUtils';
import {DomRenderNoProxy} from '../../decorators/DomRenderNoProxy';
import {OnCreateRender} from '../../lifecycle/OnCreateRender';
import {DomRenderConfig} from '../../configs/DomRenderConfig';
import {WindowUtils} from '@dooboostore/core-web/window/WindowUtils';
import {OnRawSetRenderedOtherData} from '../../lifecycle';

/** 사용법
 <dr-select class="card-select-container" changeSelected="${(data) => @this@.changeSelected(data)}$">  <!-- multiple attribute optional-->
 <dr-select-summary class="card-select-summary-container">
 <dr-select-summary-placeholder>
 <div class="card-select-summary-placeholder-container">카드사별 사용처 안내 페이지 선택</div>
 </dr-select-summary-placeholder>
 <dr-select-summary-selected>
 <div dr-if="@this@.selectedCard" class="card-select-summary-selected-container">
 <img dr-attr="{src:@this@.selectedCard?.iconImg}"> ${@this@.selectedCard?.name}$
 </div>
 </dr-select-summary-selected>
 </dr-select-summary>

 <dr-select-body float="bottom-left" class="card-select-body-container">
 <dr-select-option dr-for-of="@this@.cards" value="${#it#.name}$" selected="${#nearForOfIndex# === 0}$" class="card-select-body-option-container">
 <img dr-attr="{src:#it#.iconImg}"> ${#it#.name}$
 </dr-select-option>
 </dr-select-body>
 </dr-select>
 */

export namespace Select {
  export const selector = 'dr-select';

  // Base for simple hide/show components
  class StateComponent extends ComponentBase {
    public hidden = true;
    public value: string | null = null;

    constructor(config: any) {
      super(config);
    }

    setValue(value: string | null) {
      this.value = value;
    }
  }

  // --- Option Child Components ---
  export class OptionSelected extends StateComponent {
    constructor() {
      super({onlyParentType: Option});
    }
  }

  export class OptionUnselected extends StateComponent {
    constructor() {
      super({onlyParentType: Option});
    }
  }

  export class OptionDisabled extends StateComponent {
    constructor() {
      super({onlyParentType: Option});
    }
  }

  // --- Summary Child Components ---
  export class SummaryPlaceholder extends StateComponent {
    constructor() {
      super({onlyParentType: Summary});
    }
  }

  export class SummarySelected extends StateComponent {
    private selectedOptions: Select.Option[] = [];

    constructor() {
      super({onlyParentType: Summary});
    }

    setOptions(options: Option[] = []) {
      this.selectedOptions = options.filter(it => it.selected);
    }
  }

  export class SummaryDisabled extends StateComponent {
    private selectedOptions: Select.Option[] = [];

    constructor() {
      super({onlyParentType: Summary});
    }

    setOptions(options: Option[] = []) {
      this.selectedOptions = options.filter(it => it.selected);
    }
  }

  // --- Select Body Component ---
  export type SelectBodyAttribute = {
    float?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
    class?: string;
  }
  // --- Option Component ---
  export type OptionAttribute = { value: string; selected?: boolean | null; disabled?: boolean | null; class?: string; };

  export class Option extends ComponentBase<OptionAttribute> implements OnInitRender {
    public hidden = true;
    @attribute({name: 'value'}) public value: string | null = null;
    @attribute({name: 'selected', converter: v => v !== null && v === true}) public selected = false;
    @attribute({name: 'disabled', converter: v => v !== null && v === true}) public disabled = false;
    @attribute({name: 'class', converter: v => (v ? v : null)}) public classAttr: string | null = null;

    // public status: 'selected' | 'unselected' | 'disabled' = 'unselected';

    constructor() {
      super({onlyParentType: SelectBody});
    }

    async onInitRender(param: any, rawSet: RawSet) {
      await super.onInitRender(param, rawSet);
      // console.log('-----', this.value, this.selected)
      // this.getElement()?.addEventListener('click', (e) => {
      //   e.stopPropagation();
      //   if (!this.disabled) {
      //     this.getParentThis<Select>().handleOptionClick(this);
      //   }
      // });
      this.updateStatus();
    }

    // onCreatedThisChild(child: any, data: OnCreateRenderDataParams) {
    //   super.onCreatedThisChild(child, data);
    //   this.updateStatus();
    // }

    // async onRawSetRendered(rawSet:RawSet, otherData:OnRawSetRenderedOtherData):Promise<void>{
    //   await super.onRawSetRendered(rawSet, otherData);
    // }
    onCreatedThisChildDebounce(childrenSet: ChildrenSet[]) {
      super.onCreatedThisChildDebounce(childrenSet);
      this.updateStatus();
    }

    toggleSelected(event: Event) {
      // console.log('isMultiple', this.isMultiple())
      if (!this.disabled) {
        this.selected = this.isMultiple() ? !this.selected : true;
        // this.selected =  !this.selected;
        this.updateStatus();
        this.getParentThis<SelectBody>().changeOptionState(this);
      } else {
        event.stopPropagation();
        event.preventDefault();
      }
    }

    isMultiple() {
      return this.getParentThis<Select.SelectBody>()?.getParentThis<Select.Select>().multiple;
    }

    updateStatus() {
      if (this.disabled) {
        this.getChildren(OptionSelected).forEach(c => {
          c.hidden = true;
          c.setValue(this.value)
        });
        this.getChildren(OptionUnselected).forEach(c => {
          c.hidden = true;
          c.setValue(this.value)
        });
        this.getChildren(OptionDisabled).forEach(c => {
          c.hidden = false;
          c.setValue(this.value)
        });
        return;
      }

      if (this.selected) {
        this.getChildren(OptionSelected).forEach(c => {
          c.hidden = false;
          c.setValue(this.value)
        });
        this.getChildren(OptionUnselected).forEach(c => {
          c.hidden = true;
          c.setValue(this.value)
        });
        this.getChildren(OptionDisabled).forEach(c => {
          c.hidden = true;
          c.setValue(this.value)
        });
      }

      if (!this.selected) {
        this.getChildren(OptionSelected).forEach(c => {
          c.hidden = true;
          c.setValue(this.value)
        });
        this.getChildren(OptionUnselected).forEach(c => {
          c.hidden = false;
          c.setValue(this.value)
        });
        this.getChildren(OptionDisabled).forEach(c => {
          c.hidden = true;
          c.setValue(this.value)
        });
      }
    }
  }

  // --- Summary Component ---
  export class Summary extends ComponentBase implements OnInitRender {
    @attribute({name: 'class', converter: v => (v === '' ? null : v)}) public classAttr: string | null = null;
    private options: Select.Option[] = [];
    private disabled: boolean = false;
    public element?: HTMLElement;

    // constructor() {
    //   super({ onlyParentType: Select });
    // }

    setDisabled(disabled: boolean) {
      this.disabled = disabled;
      this.getChildren(SummaryPlaceholder).forEach(it => (it.hidden = true));
      this.getChildren(SummarySelected).forEach(it => (it.hidden = true));
      this.getChildren(SummaryDisabled).forEach(it => (it.hidden = false));
    }

    setOptions(options: Option[] = []): void {
      this.options = options;

      const selectedOptions = this.options.filter(it => it.selected && !it.disabled);
      if (!this.disabled) {
        if (selectedOptions.length > 0) {
          this.getChildren(SummaryPlaceholder).forEach(it => (it.hidden = true));
          this.getChildren(SummarySelected).forEach(c => {
            c.setOptions(options);
            c.hidden = false;
          });
          this.getChildren(SummaryDisabled).forEach(it => (it.hidden = true));
        } else {
          this.getChildren(SummaryDisabled).forEach(it => (it.hidden = true));
          this.getChildren(SummaryPlaceholder).forEach(it => (it.hidden = false));
          this.getChildren(SummarySelected).forEach(c => (c.hidden = true));
        }
      }
    }

    async onInitRender(param: any, rawSet: RawSet) {
      await super.onInitRender(param, rawSet);
      // this.getElement()?.addEventListener('click', (e) => {
      //   e.stopPropagation();
      //   this.getParentThis<Select>().toggle();
      // });
    }

    onInitSummaryElement(element: HTMLElement, event: Event) {
      this.element = element;
    }

    updateView(hasSelection: boolean) {
      this.getChildren(SummaryPlaceholder).forEach(c => (c.hidden = hasSelection));
      this.getChildren(SummarySelected).forEach(c => (c.hidden = !hasSelection));
    }

    // onCreatedThisChild(child: any, data: OnCreateRenderDataParams) {
    //   super.onCreatedThisChild(child, data);
    // }
    // async onRawSetRendered(rawSet: RawSet, otherData: OnRawSetRenderedOtherData): Promise<void> {
    //   await super.onRawSetRendered(rawSet, otherData);
    // }
    onCreatedThisChildDebounce(childrenSet: ChildrenSet[]) {
      super.onCreatedThisChildDebounce(childrenSet);
      this.updateView(this.getParentThis<Select>()?.selectedValues?.length > 0);
    }

    onSummaryClick(element: HTMLElement, event: Event) {
      if (this.getParentThis<Select>()?.disabled) {
        event.stopPropagation();
        event.preventDefault();
        return;
      }
    }
  }


  export class SelectBody extends ComponentBase<SelectBodyAttribute> {
    @attribute({name: 'class', converter: v => (v === '' ? null : v)}) public classAttr: string | null = null;
    @attribute({name: 'float'}) public float: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | null = null;

    constructor() {
      super({onlyParentType: Select});
    }

    async onRawSetRendered(rawSet: RawSet, otherData: OnRawSetRenderedOtherData): Promise<void> {
      await super.onRawSetRendered(rawSet, otherData);
      // }
      // onCreatedThisChildDebounce(childrenSet: ChildrenSet[]) {
      //   super.onCreatedThisChildDebounce(childrenSet);
      this.changeOptionState();
    }

    changeOptionState(option?: Option) {
      const options = this.getChildren(Option);
      const select = this.getParentThis<Select>();
      // console.log('------opti',option, select);
      // // 멀티플이 아닐때에는 마지막 선택된값으로 처리
      if (!select.multiple) {
        // 내가 선택한게 있으면
        if (option && option.selected) {
          options.filter(it => it !== option).forEach(it => {
            it.selected = false;
            it.updateStatus();
          });
        } else {
          const selectedOptions = options.filter(it => it.selected && !it.disabled);
          selectedOptions.forEach((opt, idx) => {
            const isLast = idx === selectedOptions.length - 1;
            if (!isLast) {
              opt.selected = false;
              opt.updateStatus();
            }
          });
        }
      }
      // console.log('--------', options.map(it=>it.selected))
      select?.setOptions(options);
    }
  }


  // --- Main Select Component ---
  export type SelectAttribute = {
    multiple?: boolean | null; class?: string;
    onchange?: (value?: string) => void;
    onchangeValues?: (value: string[]) => void;
    name?: string;
    float?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
    disableOtherClickClose?: boolean;
    toggle?: (open: boolean) => void;
    disabled?: boolean | null;
  };

  export class Select extends ComponentBase<SelectAttribute> implements OnInitRender, OnCreateRender, OnCreateRenderData, OnDestroyRender {
    @attribute({name: 'multiple', converter: v => v !== null}) public multiple = false;
    @attribute({name: 'disabled', converter: v => v !== null}) public disabled = false;
    @attribute({name: 'class', converter: v => (v === '' ? null : v)}) public classAttr: string | null = null;
    @attribute({name: 'name', converter: v => (v === '' ? null : v)}) public name: string | null = null;

    // public isOpen = false;
    public selectedValues: (string | null)[] = [];
    public selectedOptions: Option[] = [];
    private value: string | (string | null)[] | null | undefined;

    @DomRenderNoProxy private element?: HTMLDetailsElement;
    @DomRenderNoProxy private documentClickSubscription?: Subscription;
    @DomRenderNoProxy private windowBlurSubscription?: Subscription;
    @DomRenderNoProxy public summaryComponent?: Summary;
    @DomRenderNoProxy public selectBodyComponent?: SelectBody;
    private options?: Select.Option[];

    constructor(config?: DomRenderConfig) {
      super();
      // console.log('----Select constructor')
    }

    // get value(): string | (string | null)[] | null | undefined {
    //   return this._value;
    // }
    // set value(val: string | (string | null)[] | null | undefined) {
    //   console.log('value set', val)
    //   this._value = val;
    // }

    get optionComponents(): Option[] {
      return this.getChildren(Option);
    }

    onCreateRender() {

    }

    onCreateRenderData() {

    }

    async onInitRender(param: any, rawSet: RawSet) {
      await super.onInitRender(param, rawSet);
      // console.log('select onInitRender', this.multiple)

      if (ValidUtils.isBrowser() && this.rawSet?.dataSet.config.window) {
        const detailsElement = this.element;

        const window = this.rawSet.dataSet!.config!.window!;
        const document = window.document;
        this.documentClickSubscription = EventUtils.htmlElementEventObservable(document, 'click').subscribe(event => {
          const isSummaryClick = this.getChildren(Summary).some(it => event.target && it.element?.contains(event.target as Node) || it.element === event.target)
          if (!isSummaryClick && this.getAttribute('disableOtherClickClose')) {
            return;
          }
          if (!isSummaryClick && !this.multiple && detailsElement) {
            detailsElement.open = false;
            return;
          }
          if (!isSummaryClick && detailsElement && !detailsElement?.contains(event?.target as Node)) {
            detailsElement.open = false;
          }
        })

        this.windowBlurSubscription = WindowUtils.eventObservable(window, 'blur').subscribe(() => {
          if (detailsElement?.open && window.document.activeElement?.tagName === 'IFRAME') {
            detailsElement.open = false;
          }
        });
      }
    }


    toggle(element: HTMLDetailsElement, event: Event) {
      // console.log('------>', this.disabled, event)
      // if (this.disabled) {
      //   event.stopPropagation();
      //   event.preventDefault();
      //   return;
      // }
      const toggleAttribute = this.getAttribute('toggle');
      if (toggleAttribute) {
        toggleAttribute?.(element.open);
      }
    }

    setOptions(options: Option[]) {
      const summaries = this.getChildren(Summary);

      this.options = options;

      const values = this.options.filter(it => it.selected && !it.disabled).map(it => it.value)
      summaries?.forEach(it => {
        it.setDisabled(this.disabled);
        if (!this.disabled) {
          it.setOptions(options);
        }
      });
      this.selectedValues = values;
      this.selectedOptions = this.options.filter(it => it.selected && !it.disabled);
      this.value = this.selectedValues[0];
      this.getAttribute('onchange')?.(this.value);
      this.getAttribute('onchangeValues')?.(values);
    }

    onInitDetailsElement(detailsElement: HTMLDetailsElement) {
      // console.log('detailsElement oninit', detailsElement);
      this.element = detailsElement;
    }

    onDrThisUnBind() {
      super.onDrThisUnBind();
      this.onDestroyRender();
    }

    onDestroyRender() {
      super.onDestroyRender();
      this.documentClickSubscription?.unsubscribe();
      this.windowBlurSubscription?.unsubscribe();
    }

    @attribute('value')
    setValue(value: string | null | undefined) {
      this.value = value;
      if (this.options) {

        // clear
        this.options.forEach(it=> {
          it.selected = false;
          it.updateStatus();
        });
        for (let option of this.options) {
          if (option.value === value) {
            option.selected = true;
            if (!this.multiple) {
              // 하나만 선택
              break;
            }
          } else {
            option.selected = false;
          }
          option.updateStatus()
        }
      }
      console.log('value set', value)
    }

    test() {
      console.log('tttttttt')
    }
  }
}

const stateComponentFactory = (name: string, type: any) => {
  return (config?: DomRenderRunConfig) =>
    RawSet.createComponentTargetElement({
      name,
      template: '<div dr-if="!@this@.hidden" dr-option-strip="true">#innerHTML#</div>\n',
      objFactory: (e, o, r2, constructorParam) => DomRender.run({rootObject: new type(), config})
    });
};

export default {
  select: (config?: DomRenderConfig) => {
    return RawSet.createComponentTargetElement({
      name: Select.selector,
      styles:
        '.dr-select-container {\n' +
        '  position: relative;\n' +
        '\n' +
        '}\n' +
        '.dr-select-options-container {\n' +
        '  display: none;\n' +
        '  position: absolute;\n' +
        '  top: 100%;\n' +
        '  left: 0;\n' +
        '  right: 0;\n' +
        '  z-index: 10;\n' +
        '}\n' +
        '.dr-select-container.is-open .dr-select-options-container {\n' +
        '  display: block;\n' +
        '}\n' +
        'summary::-webkit-details-marker {\n' +
        '    display: none;\n' +
        '}\n' +
        '/* Floating styles for dr-select-body */\n' +
        '.dr-select-body-container {\n' +
        '    position: absolute;\n' +
        '}\n' +
        '\n' +
        '.dr-select-body-bottom-left-container {\n' +
        '    position: absolute;\n' +
        '    left: 0;\n' +
        '    top: 100%;\n' +
        '}\n' +
        '\n' +
        '.dr-select-body-bottom-right-container {\n' +
        '    position: absolute;\n' +
        '    right: 0;\n' +
        '    top: 100%;\n' +
        '}\n' +
        '\n' +
        '.dr-select-body-top-left-container {\n' +
        '    position: absolute;\n' +
        '    left: 0;\n' +
        '    bottom: 100%;\n' +
        '}\n' +
        '\n' +
        '.dr-select-body-top-right-container {\n' +
        '    position: absolute;\n' +
        '    right: 0;\n' +
        '    bottom: 100%;\n' +
        '}\n' +
        '\n' +
        '/* Reset default details/summary styles */\n' +
        '.dr-select-container details {\n' +
        '  display: block; /* Ensure it behaves like a block element */\n' +
        '}\n' +
        '\n' +
        '.dr-select-container summary {\n' +
        '  display: block; /* Ensure it behaves like a block element */\n' +
        '  list-style: none; /* Remove default marker */\n' +
        "  cursor: pointer; /* Indicate it's clickable */\n" +
        '}\n' +
        '\n' +
        '.dr-select-container summary::-webkit-details-marker,\n' +
        '.dr-select-container summary::marker {\n' +
        '  display: none; /* Hide marker for Webkit and standard */\n' +
        '}',
      template:
        '<details dr-class="{\n' +
        "        'dr-select-container': true,\n" +
        "        'is-open': @this@.isOpen,\n" +
        '        [@this@.classAttr]: @this@.classAttr\n' +
        '     }" dr-on-init="@this@.onInitDetailsElement($element)" dr-option-complete="@this@.test()"  dr-event-toggle="@this@.toggle($element, $event)">\n' +
        '\n' +
        '    #innerHTML#\n' +
        '</details>\n' +
        '<select hidden="hidden" name="${@this@.name}$" disabled="${@this@.disabled ? \'disabled\' : null}$"  style="width: 1500px; height:500px"  multiple>\n' +
        '    <option dr-for-of="@this@.options" value="${#it#.value}$" selected="${#it#.selected ? \'selected\' : null}$">#it# ${#it#.value}$</option>\n' +
        '</select>',
      objFactory: (e, o, r2, constructorParam) => DomRender.run({rootObject: new Select.Select(config), config})
    });
  },
  selectSummary: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${Select.selector}-summary`,
      template:
        '<summary dr-class="{[@this@.classAttr]: @this@.classAttr}"\n' +
        '         dr-on-init="@this@.onInitSummaryElement($element, $event)"\n' +
        '         dr-event-click="@this@.onSummaryClick($element, $event)"\n' +
        '>\n' +
        '#innerHTML#\n' +
        '</summary>',
      objFactory: (e, o, r2, constructorParam) => DomRender.run({rootObject: new Select.Summary(), config})
    });
  },
  selectSummaryPlaceholder: stateComponentFactory(`${Select.selector}-summary-placeholder`, Select.SummaryPlaceholder),
  selectSummarySelected: stateComponentFactory(`${Select.selector}-summary-selected`, Select.SummarySelected),
  selectSummaryDisabled: stateComponentFactory(`${Select.selector}-summary-disabled`, Select.SummaryDisabled),

  selectBody: (config?: DomRenderRunConfig) => { // New export
    return RawSet.createComponentTargetElement({
      name: `${Select.selector}-body`,
      template: '<div dr-class="{[@this@.classAttr]: @this@.classAttr, \'dr-select-body-container\': true,  [\'dr-select-body-\'+@this@.float+\'-container\']: @this@.float}">#innerHTML#</div>',
      objFactory: (e, o, r2, constructorParam) => {
        return DomRender.run({rootObject: new Select.SelectBody(), config: config});
      }
    })
  },

  selectOption: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${Select.selector}-option`,
      template:
        '<a dr-class="{[@this@.classAttr]: @this@.classAttr}" dr-event-click="@this@.toggleSelected($event)">#innerHTML#</a>\n',
      objFactory: (e, o, r2, constructorParam) => DomRender.run({rootObject: new Select.Option(), config})
    });
  },
  selectOptionSelected: stateComponentFactory(`${Select.selector}-option-selected`, Select.OptionSelected),
  selectOptionUnselected: stateComponentFactory(`${Select.selector}-option-unselected`, Select.OptionUnselected),
  selectOptionDisabled: stateComponentFactory(`${Select.selector}-option-disabled`, Select.OptionDisabled),
};