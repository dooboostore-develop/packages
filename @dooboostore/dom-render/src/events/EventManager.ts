import { DomRenderConfig } from '../configs/DomRenderConfig';
import { ScriptUtils } from '@dooboostore/core-web/script/ScriptUtils';
import { ElementUtils } from '@dooboostore/core-web/element/ElementUtils';
import { Range } from '../iterators/Range';
import { getDomRenderConfig } from '../DomRenderProxy';
import { ObjectUtils } from '@dooboostore/core/object/ObjectUtils';

type HandlerInfo = {
  element: HTMLElement;
  attr: string;
  type: 'link' | 'event' | 'event-param';
  priority: number;
  property?: string; // for link type
};
export type NormalAttrDataType = {
  originalAttrValue: string;
  isStringTemplate: boolean;
  variablePaths: {origin: string, inner: string}[];
}
export class EventManager {
  public static readonly attrPrefix = 'dr-';
  public readonly eventNames = [
    'click', 'mousedown', 'mouseup', 'dblclick', 'mouseover', 'mouseout', 'mousemove', 'mouseenter', 'mouseleave', 'contextmenu',
    'keyup', 'keydown', 'keypress', 'toggle',
    'change', 'input', 'submit', 'resize', 'focus', 'blur',
    'close', 'cancel'
  ];

  private readonly delegatableEventMap: { [key: string]: string } = {
    mouseleave: 'mouseout',
    mouseenter: 'mouseover',
    focus: 'focusin',
    blur: 'focusout',
  };
  private readonly directAttachEvents = new Set(['close']);

  public static ownerVariablePathAttrName = EventManager.attrPrefix + 'owner-variable-path';

  public static readonly eventParam = EventManager.attrPrefix + 'event';
  public static readonly onInitAttrName = EventManager.attrPrefix + 'on-init';
  public static readonly valueAttrName = EventManager.attrPrefix + 'value';
  public static readonly checkedAttrName = EventManager.attrPrefix + 'checked';
  public static readonly selectedAttrName = EventManager.attrPrefix + 'selected';
  public static readonly readonlyAttrName = EventManager.attrPrefix + 'readonly';
  public static readonly disabledAttrName = EventManager.attrPrefix + 'disabled';
  public static readonly hiddenAttrName = EventManager.attrPrefix + 'hidden';
  public static readonly requiredAttrName = EventManager.attrPrefix + 'required';
  public static readonly openAttrName = EventManager.attrPrefix + 'open';

  // link는 쓰지 않는걸 추천한다 라이프 사이클 꼬인다 다른 프레임워크에서도 양방향은 지양 한다
  public static linkAttrs = [
    {name: EventManager.attrPrefix + 'value-link', property: 'value', event: 'input'},
    {name: EventManager.attrPrefix + 'hidden-link', property: 'value', event: 'input'},
    {name: EventManager.attrPrefix + 'required-link', property: 'value', event: 'input'},
    {name: EventManager.attrPrefix + 'checked-link', property: 'checked', event: 'change'},
    {name: EventManager.attrPrefix + 'open-link', property: 'open', event: 'toggle'},
  ]
  // @ts-ignore  합성이벤트(Synthetic) 처리하면서 의미가 없어졌다
  public static readonly linkTargetMapAttrName = EventManager.attrPrefix + 'link-variables';

  public static readonly onRenderedInitAttrName = EventManager.attrPrefix + 'on-rendered-init';

  public static readonly attrAttrName = EventManager.attrPrefix + 'attr';
  public static readonly normalAttrMapAttrName = EventManager.attrPrefix + 'normal-attr-map';
  public static readonly styleAttrName = EventManager.attrPrefix + 'style';
  public static readonly classAttrName = EventManager.attrPrefix + 'class';

  public static readonly VALUE_VARNAME = '$value';
  public static readonly SCRIPTS_VARNAME = '$scripts';
  public static readonly FAG_VARNAME = '$fag';
  public static readonly RAWSET_VARNAME = '$rawSet';
  public static readonly RENDER_VARNAME = '$render';
  public static readonly NEAR_THIS_VARNAME = '$nearThis';
  public static readonly PARENT_THIS_VARNAME = '$parentThis';
  public static readonly ROOT_OBJECT_VARNAME = '$rootObject';
  public static readonly SCRIPT_UTILS_VARNAME = '$scriptUtils';
  public static readonly RANGE_VARNAME = '$range';
  public static readonly ROUTER_VARNAME = '$router';
  public static readonly INNER_HTML_VARNAME = '$innerHTML';
  public static readonly ELEMENT_VARNAME = '$element';
  public static readonly TARGET_VARNAME = '$target';
  public static readonly EVENT_VARNAME = '$event';
  public static readonly COMPONENT_VARNAME = '$component';
  public static readonly INNERHTML_VARNAME = '$innerHTML';
  public static readonly ATTRIBUTE_VARNAME = '$attribute';
  public static readonly CREATOR_META_DATA_VARNAME = '$creatorMetaData';
  public static readonly PARENT_THIS_PATH_VARNAME = '$parentPath';
  public static readonly CURRENT_THIS_VARNAME = '$currentThis';
  public static readonly CURRENT_THIS_PATH_VARNAME = '$currentThisPath';
  public static readonly NEAR_THIS_PATH_VARNAME = '$nearThisPath';
  public static readonly VARNAMES = [EventManager.SCRIPTS_VARNAME, EventManager.FAG_VARNAME, EventManager.RAWSET_VARNAME, EventManager.RANGE_VARNAME, EventManager.ROUTER_VARNAME, EventManager.ELEMENT_VARNAME, EventManager.TARGET_VARNAME, EventManager.EVENT_VARNAME, EventManager.COMPONENT_VARNAME, EventManager.INNERHTML_VARNAME, EventManager.ATTRIBUTE_VARNAME, EventManager.ATTRIBUTE_VARNAME, EventManager.CREATOR_META_DATA_VARNAME, EventManager.PARENT_THIS_PATH_VARNAME, EventManager.PARENT_THIS_VARNAME];

  public static readonly WINDOW_EVENT_POPSTATE = 'popstate';
  public static readonly WINDOW_EVENT_RESIZE = 'resize';
  public static readonly WINDOW_EVENTS = [EventManager.WINDOW_EVENT_POPSTATE, EventManager.WINDOW_EVENT_RESIZE];
  public static readonly noDetectAttr = [EventManager.normalAttrMapAttrName]
  public static readonly attrNames = [
    EventManager.valueAttrName,
    EventManager.checkedAttrName,
    EventManager.selectedAttrName,
    EventManager.readonlyAttrName,
    EventManager.disabledAttrName,
    EventManager.hiddenAttrName,
    EventManager.requiredAttrName,
    EventManager.openAttrName,
    EventManager.attrAttrName,
    EventManager.normalAttrMapAttrName,
    EventManager.styleAttrName,
    EventManager.classAttrName,
    EventManager.attrPrefix + 'window-event-' + EventManager.WINDOW_EVENT_POPSTATE,
    EventManager.attrPrefix + 'window-event-' + EventManager.WINDOW_EVENT_RESIZE,
    EventManager.onInitAttrName,
    ...EventManager.linkAttrs.map(it => it.name),
    this.eventParam
  ];
  readonly bindScript = `
        const ${EventManager.VALUE_VARNAME} = this.__render.value;
        const ${EventManager.SCRIPTS_VARNAME} = this.__render.scripts;
        const ${EventManager.RANGE_VARNAME} = this.__render.range;
        const ${EventManager.ROUTER_VARNAME} = this.__render.router;
        const ${EventManager.ATTRIBUTE_VARNAME} = this.__render.attribute;
        const ${EventManager.ELEMENT_VARNAME} = this.__render.element;
        const ${EventManager.COMPONENT_VARNAME} = this.__render.element.component;
        const ${EventManager.TARGET_VARNAME} = this.__render.target;
        const ${EventManager.EVENT_VARNAME} = this.__render.event;
    `;

  constructor(private window: Window) {
    this.eventNames.forEach(it => {
      EventManager.attrNames.push(EventManager.attrPrefix + 'event-' + it);
    });
    EventManager.attrNames.push(EventManager.onRenderedInitAttrName);

    if (typeof window !== 'undefined') {
      EventManager.WINDOW_EVENTS.forEach(eventName => {
        window?.addEventListener(eventName, (event) => {
          const targetAttr = `dr-window-event-${eventName}`;
          document.querySelectorAll(`[${targetAttr}]`).forEach(it => {
            const script = it.getAttribute(targetAttr);
            if (script) {
              const obj = this.findComponentInstance(it as HTMLElement);
              const config = getDomRenderConfig(obj);
              ScriptUtils.evaluate(`${this.bindScript} ${script} `, this.createExecutionContext(event, it as HTMLElement, obj, config));
            }
          });
        });
      });

      const rootElement = this.window.document;
        const listeningEvents = new Set<string>();
        this.eventNames.forEach(eventName => {
          if (this.directAttachEvents.has(eventName)) {
            return;
          }
          const delegatedEventName = this.delegatableEventMap[eventName] || eventName;

          if (listeningEvents.has(delegatedEventName)) {
            return;
          }
          listeningEvents.add(delegatedEventName);
          rootElement.addEventListener(delegatedEventName, this.handleEvent.bind(this), true);
        });
    }
  }

  private handleEvent(event: Event) {
    const handlers = this.collectHandlers(event);
    // console.log('handlers', handlers, event);
    for (const handler of handlers) {
      if (event.cancelBubble) {
        break;
      }

      const componentInstance = this.findComponentInstance(handler.element);
      if (!componentInstance) {
        continue;
      }
      // console.log('executeHandler', event,handler,componentInstance)
      this.executeHandler(event, handler, componentInstance);
    }
  }

  private collectHandlers(event: Event): HandlerInfo[] {
    const handlers: HandlerInfo[] = [];
    const root =  this.window.document;
    if (!root) return handlers;

    const initialTarget = event.target as Node;
    let currentTarget: HTMLElement | null = (initialTarget.nodeType === 1)
      ? (initialTarget as HTMLElement)
      : initialTarget.parentElement;
    const collectedElements = new Set<HTMLElement>();

    const eventMap: { [key: string]: string } = {
      mouseout: 'mouseleave',
      mouseover: 'mouseenter',
      focusout: 'blur',
      focusin: 'focus'
    };
    const mappedEventName = eventMap[event.type] || event.type;

    while (currentTarget) {
      if (collectedElements.has(currentTarget)) {
        break;
      }

      // Priority 1: Link attributes
      const matchingLinkAttr = EventManager.linkAttrs.find(la => la.event === mappedEventName && currentTarget?.hasAttribute(la.name));
      if (matchingLinkAttr) {
        handlers.push({
          element: currentTarget,
          attr: matchingLinkAttr.name,
          type: 'link',
          priority: 1,
          property: matchingLinkAttr.property
        });
      }

      // Priority 2: dr-event-* attributes
      const eventAttr = `${EventManager.attrPrefix}event-${mappedEventName}`;
      if (currentTarget.hasAttribute(eventAttr)) {
        handlers.push({
          element: currentTarget,
          attr: eventAttr,
          type: 'event',
          priority: 2
        });
      }

      // Priority 3: dr-event with params
      const eventParamAttr = EventManager.eventParam;
      if (currentTarget.hasAttribute(eventParamAttr)) {
        const bindEvents = currentTarget.getAttribute(`${eventParamAttr}:bind`);
        if (bindEvents && bindEvents.split(',').map(s => s.trim()).includes(mappedEventName)) {
          handlers.push({
            element: currentTarget,
            attr: eventParamAttr,
            type: 'event-param',
            priority: 3
          });
        }
      }

      collectedElements.add(currentTarget);

      if (currentTarget === root.documentElement) {
        break;
      }

      currentTarget = currentTarget.parentElement;
    }

    return handlers.sort((a, b) => a.priority - b.priority);
  }

  private findComponentInstance(element: HTMLElement | null): any {
    let current = element;
    const root =  this.window.document;
    while (current) {
      if ((current as any).obj) {
        return (current as any).obj;
      }
      if (current === root.documentElement) {
        break;
      }
      current = current.parentElement;
    }
    return this.window;
  }

  private createExecutionContext(event: Event, element: HTMLElement, componentInstance: any, config: DomRenderConfig | undefined, extraVars = {}) {
    // console.log('---------->', config?.eventVariables)
    return Object.assign(componentInstance, {
      __render: Object.freeze({
        event,
        element,
        target: event.target,
        attribute: ElementUtils.getAttributeToObject(element),
        router: config?.router,
        range: Range.range,
        scripts: EventManager.setBindProperty(config?.scripts, componentInstance),
        ...config?.eventVariables,
        ...extraVars
      })
    });
  }

  private executeHandler(event: Event, handler: HandlerInfo, componentInstance: any) {
    const {element, type, attr} = handler;
    const config = getDomRenderConfig(componentInstance);

    switch (type) {
      case 'link':
        const varName = element.getAttribute(attr);
        if (!varName || !handler.property) return;

        if (attr.includes('leave') || attr.includes('enter') || attr.includes('focus') || attr.includes('blur')) {
          const relatedTarget = (event as MouseEvent).relatedTarget as Node;
          if (relatedTarget && element.contains(relatedTarget)) {
            return;
          }
        }

        const ownerVariablePath = element.getAttribute(EventManager.ownerVariablePathAttrName);
        let bindObj = componentInstance;
        if (ownerVariablePath) {
          bindObj = ScriptUtils.evaluateReturn(ownerVariablePath, componentInstance);
        }

        const mapScript = element.getAttribute(`${attr}:map`);
        let value = (element as any)[handler.property];

        if (mapScript) {
          const context = this.createExecutionContext(event, element, bindObj, config, {value});
          value = ScriptUtils.evaluate(`return ${mapScript}`, context);
        }

        if (typeof this.getValue(componentInstance, varName, bindObj) === 'function') {
          this.getValue(componentInstance, varName, bindObj)(value, event);
        } else {
          this.setValue(componentInstance, varName, value);
        }
        break;

      case 'event':
        const script = element.getAttribute(attr);
        if (!script) return;

        if (attr.endsWith('mouseleave') || attr.endsWith('mouseenter') || attr.endsWith('blur') || attr.endsWith('focus')) {
          const relatedTarget = (event as MouseEvent).relatedTarget as Node;
          if (relatedTarget && element.contains(relatedTarget)) {
            return;
          }
        }

        const context = this.createExecutionContext(event, element, componentInstance, config);
        const filterScript = element.getAttribute(`${attr}:filter`);
        let filter = true;
        // 개발자가 사용중에 문제가 발생될(디버깅) 버그를 유발할수있는 기능 흐름제어가 안될수있어 기능을 제거한다.
        // if (filterScript) {
        //     filter = ScriptUtils.eval<boolean>(`${this.getBindScript(config)} return ${filterScript}`, context) ?? false;
        // }

        if (filter) {
          ScriptUtils.evaluate(`${this.getBindScript(config)} ${script}`, context);
        }

        // 개발자가 사용중에 문제가 발생될(디버깅) 버그를 유발할수있는 기능 흐름제어가 안될수있어 기능을 제거한다.
        // const hasDispatch = element.hasAttribute(`${attr}:dispatch`);
        // if (hasDispatch) {
        //   element.dispatchEvent(new Event(event.type));
        // }
        break;

      case 'event-param':
        const paramScript = element.getAttribute(attr);
        if (!paramScript) return;

        if (attr.endsWith('mouseleave') || attr.endsWith('mouseenter') || attr.endsWith('blur') || attr.endsWith('focus')) {
          const relatedTarget = (event as MouseEvent).relatedTarget as Node;
          if (relatedTarget && element.contains(relatedTarget)) {
            return;
          }
        }

        const attributes = ElementUtils.getAttributeToObject(element);
        const params = {} as any;
        const prefix = attr + ':';
        Object.entries(attributes).filter(([k, v]) => k.startsWith(prefix)).forEach(([k, v]) => {
          params[k.slice(prefix.length)] = v;
        });

        const paramContext = this.createExecutionContext(event, element, componentInstance, config, {params});
        ScriptUtils.evaluate(`${this.getBindScript(config)} ${paramScript}`, paramContext);
        break;
    }
  }

  public findAttrElements(fragment: DocumentFragment | Element, config?: DomRenderConfig): Set<Element> {
    const elements = new Set<Element>();
    const addAttributes = config?.applyEvents?.map(it => it.attrName) ?? [];
   const attrs = addAttributes.concat([...EventManager.attrNames]).filter(Boolean);
   if (attrs.length) {
     const selector = attrs.map(a => `[${a}]`).join(',');
     fragment?.querySelectorAll(selector).forEach(it => elements.add(it));
   }
    return elements;
  }

  public applyEvent(obj: any, childNodes: Set<ChildNode> | Set<Element>, config?: DomRenderConfig) {
    childNodes.forEach(node => {
      if (node.nodeType === 1) {
        (node as any).obj = obj;
      }
    });

    this.procAttr<HTMLInputElement>(childNodes, EventManager.valueAttrName, (it, attribute) => {
      const script = attribute;
      if (script) {
        const data = ScriptUtils.evaluateReturn(script, obj);
        if (it.value !== data) {
          it.value = data;
        }
      }
    });
    this.procAttr<HTMLInputElement>(childNodes, EventManager.checkedAttrName, (it, attribute) => {
      const script = attribute;
      if (script) {
        const data = ScriptUtils.evaluateReturn(script, obj);
        if (it.checked!== data) {
          it.checked = data;
        }
      }
    });
    this.procAttr<HTMLOptionElement>(childNodes, EventManager.selectedAttrName, (it, attribute) => {
      const script = attribute;
      if (script) {
        const data = ScriptUtils.evaluateReturn(script, obj);
        if (it.selected!== data) {
          it.selected = data;
        }
      }
    });
    this.procAttr<HTMLInputElement>(childNodes, EventManager.readonlyAttrName, (it, attribute) => {
      const script = attribute;
      if (script) {
        const data = ScriptUtils.evaluateReturn(script, obj);
        if (it.readOnly!== data) {
          it.readOnly = data;
        }
      }
    });
    this.procAttr<HTMLInputElement>(childNodes, EventManager.disabledAttrName, (it, attribute) => {
      const script = attribute;
      if (script) {
        const data = ScriptUtils.evaluateReturn(script, obj);
        if (it.disabled!== data) {
          it.disabled = data;
        }
      }
    });
    this.procAttr<HTMLElement>(childNodes, EventManager.hiddenAttrName, (it, attribute) => {
      const script = attribute;
      if (script) {
        const data = ScriptUtils.evaluateReturn(script, obj);
        if (it.hidden!== data) {
          it.hidden = data;
        }
      }
    });
    this.procAttr<HTMLInputElement>(childNodes, EventManager.requiredAttrName, (it, attribute) => {
      const script = attribute;
      if (script) {
        const data = ScriptUtils.evaluateReturn(script, obj);
        if (it.required!== data) {
          it.required = data;
        }
      }
    });
    this.procAttr<HTMLDialogElement>(childNodes, EventManager.openAttrName, (it, attribute) => {
      const script = attribute;
      if (script) {
        const data = ScriptUtils.evaluateReturn(script, obj);
        if (it.open!== data) {
          it.open = data;
        }
      }
    });

    this.procAttr(childNodes, EventManager.normalAttrMapAttrName, (it, attribute) => {
      const map = new Map<string, NormalAttrDataType>(JSON.parse(attribute));
      map.forEach((v, k) => {

        const variablePaths = v.variablePaths;
        let targetScript = v.originalAttrValue;//typeof v.originalAttrValue === 'string' ? JSON.parse(v.originalAttrValue) : v.originalAttrValue;
          let script: string;
          if (v.isStringTemplate) {
              variablePaths.forEach(it => {
                  let r = ObjectUtils.Path.toOptionalChainPath(it.inner);
                  targetScript = targetScript.replaceAll(it.origin, `\${${r}}`);
              })
                script = '`' + targetScript + '`';
          } else {
              variablePaths.forEach(it => {
                  let r = ObjectUtils.Path.toOptionalChainPath(it.inner);
                  targetScript = targetScript.replaceAll(it.origin, `${r}`);
              })
              script = targetScript;
          }
        const data = ObjectUtils.Script.evaluate(`const $element = this.element;  return ${script}`, Object.assign(obj, {
          __render: Object.freeze({
            element: it,
            attribute: ElementUtils.getAttributeToObject(it)
          })
        }));
          // console.log('!!!!!!!!!!!', k, data, script, variablePaths, v)
        if (data === null) {
          it.removeAttribute(k);
        } else {
          it.setAttribute(k, data);
        }
      });
    });

    EventManager.WINDOW_EVENTS.forEach(it => {
      this.procAttr<HTMLInputElement>(childNodes, EventManager.attrPrefix + 'window-event-' + it, (it, attribute) => {
        (it as any).obj = obj;
      });
    });

    EventManager.linkAttrs.forEach(linkInfo => {
      this.procAttr<HTMLElement>(childNodes, linkInfo.name, (it, varName) => {

        // console.log('ink??????????')
        if (varName) {
          const ownerVariablePathName = it.getAttribute(EventManager.ownerVariablePathAttrName);
          const mapScript = it.getAttribute(`${linkInfo.name}:map`);
          let bindObj = obj;
          if (ownerVariablePathName) {
            bindObj = ScriptUtils.evaluateReturn(ownerVariablePathName, obj);
          }
          const getValue = this.getValue(obj, varName, bindObj);
          if (typeof getValue === 'function' && getValue) {
            let setValue = (it as any)[linkInfo.property];
            if (mapScript) {
              setValue = ScriptUtils.evaluate(`${this.getBindScript(config)} return ${mapScript}`, Object.assign(bindObj, {__render: Object.freeze({element: it, target: bindObj, range: Range.range, value: setValue, scripts: EventManager.setBindProperty(config?.scripts, obj), ...config?.eventVariables})}));
            }
            getValue(setValue);
          } else if (getValue) {
            let setValue = getValue;
            if (mapScript) {
              setValue = ScriptUtils.evaluate(`${this.getBindScript(config)} return ${mapScript}`, Object.assign(bindObj, {__render: Object.freeze({element: it, target: bindObj, range: Range.range, value: setValue, scripts: EventManager.setBindProperty(config?.scripts, obj), ...config?.eventVariables})}));
            }
            if (setValue === null) {
              it.removeAttribute(linkInfo.property);
            } else {
              (it as any)[linkInfo.property] = setValue;
            }
          } else if (getValue === undefined) {
            this.setValue(obj, varName, (it as any)[linkInfo.property]);
          }
        }
      });
    });

    this.directAttachEvents.forEach(eventName => {
      const attr = `${EventManager.attrPrefix}event-${eventName}`;
      this.procAttr<HTMLElement>(childNodes, attr, (element, script) => {
        const handler = (event: Event) => {
          const componentInstance = this.findComponentInstance(element);
          if (!componentInstance) return;

          const context = this.createExecutionContext(event, element, componentInstance, config);
          const filterScript = element.getAttribute(`${attr}:filter`);
          let filter = true;
          if (filterScript) {
            filter = ScriptUtils.evaluate<boolean>(`${this.getBindScript(config)} return ${filterScript}`, context) ?? false;
          }
          if (filter) {
            ScriptUtils.evaluate(`${this.getBindScript(config)} ${script}`, context);
          }
        };
        element.addEventListener(eventName, handler);
        // TODO: Add logic to remove this listener when the element is destroyed.
      });
    });

    this.procAttr<HTMLElement>(childNodes, EventManager.onInitAttrName, (it, attribute) => {
      let script = attribute;
      if (script) {
        script = 'return ' + script;
      }
      if (script) {
        ScriptUtils.evaluate(`${this.getBindScript(config)}; ${script} `, Object.assign(obj, {
          __render: Object.freeze({
            element: it,
            attribute: ElementUtils.getAttributeToObject(it),
            ...config?.eventVariables
          })
        }));
      }
    });

    this.onRenderedEvent(obj, childNodes, config);
    this.changeVar(obj, childNodes, undefined, config);
    const elements = Array.from(childNodes).filter(it => it.nodeType === 1).map(it => it as Element);
    elements.forEach(it => {
      config?.applyEvents?.filter(ta => it.getAttribute(ta.attrName) !== null).forEach(ta => ta.callBack(it, it.getAttribute(ta.attrName)!, obj));
    });
  }

  public onRenderedEvent(obj: any, childNodes: Set<ChildNode> | Set<Element> | Node[], config?: DomRenderConfig) {
    this.procAttr<HTMLInputElement>(childNodes, EventManager.onRenderedInitAttrName, (it, attribute) => {
      if (!it.isConnected) {
        return;
      }
      let script = attribute;
      if (script) {
        script = 'return ' + script;
      }
      if (script) {
        ScriptUtils.evaluate(`${this.getBindScript(config)}; ${script} `, Object.assign(obj, {
          __render: Object.freeze({
            element: it,
            attribute: ElementUtils.getAttributeToObject(it),
            ...config?.eventVariables
          })
        }));
      }
    });
  }

  public changeVar(obj: any, elements: Set<Element> | Set<ChildNode>, varName?: string, config?: DomRenderConfig) {
    // console.log('changeVar', obj, elements, varName)
    this.procAttr(elements, EventManager.styleAttrName, (it: HTMLElement, attribute) => {
      let script = attribute;
      if (script) {
        script = 'return ' + script;
      }
      if (EventManager.isUsingThisVar(script, varName) || varName === undefined) {
        const data = ObjectUtils.Script.evaluate(`const $element = this.__render.element;  ${script} `, Object.assign(obj, {
          __render: Object.freeze({
            element: it,
            attribute: ElementUtils.getAttributeToObject(it)
          })
        }));
        if (typeof data === 'string') {
            data.split(';').forEach(sit => {
                const [key, value] = sit.split(':').map(s => s.trim());
                if (key && value) {
                    (it.style as any)[key] = value;
                }
            })
          // it.setAttribute('style', data);
        } else if (Array.isArray(data)) {
            data.forEach(sit => {
                const [key, value] = sit.split(':').map(s => s.trim());
                if (key && value) {
                    (it.style as any)[key] = value;
                }
            })

          // it.setAttribute('style', data.join(';'));
        } else {
          for (const [key, value] of Object.entries(data)) {
            // if (it instanceof HTMLElement) {
              (it.style as any)[key] = value === null ? null :String(value);
            // }
          }
        }
      }
    });

    this.procAttr(elements, EventManager.classAttrName, (it, attribute) => {
      let script = attribute;
      if (script) {
        script = 'return ' + script;
      }
      if (EventManager.isUsingThisVar(script, varName) || varName === undefined) {
        const data = ObjectUtils.Script.evaluate(`const $element = this.element;  ${script} `, Object.assign(obj, {
          __render: Object.freeze({
            element: it,
            attribute: ElementUtils.getAttributeToObject(it)
          })
        }));

        // alert(1)
        if (typeof data === 'string') {
            data.split(' ').forEach(cit => it.classList.add(cit.trim()));
        } else if (Array.isArray(data)) {
            data.forEach(cit => it.classList.add(cit.trim()));
        } else {
          for (const [key, value] of Object.entries(data)) {
            if (it instanceof HTMLElement) {
              if (value) {
                it.classList.add(key.trim());
              } else {
                it.classList.remove(key.trim());
              }
            }
          }
        }
      }
    });
  }

  public procAttr<T extends Element = Element>(elements: Set<Element> | Set<ChildNode> | Node[] = new Set(), attrName: string, callBack: (h: T, value: string, attributes: any) => void) {
    const sets = new Set<Element>();
    elements.forEach(it => {
      if (!it) {
        return;
      }
      if (it.nodeType === 1) {
        const e = it as Element;
        sets.add(e);
        e.querySelectorAll<T>(`[${attrName}]`).forEach(it => {
          sets.add(it);
        });
      }
    });
    sets.forEach(it => {
      const attr = it.getAttribute(attrName);
      const attrs = ElementUtils.getAttributeToObject(it);
      if (attr) {
        callBack(it as T, attr, attrs);
      }
    });
  }

  public getValue<T = any>(obj: any, name: string, bindObj?: any): T {
    let r = ObjectUtils.Script.evaluateReturn(name, obj);
    if (typeof r === 'function') {
      r = r.bind(bindObj ?? obj);
    }
    return r;
  }

  public setValue(obj: any, name: string, value?: any) {
    name = name.replaceAll('this.', 'this.this.');
    ScriptUtils.evaluate(`${name} = this.value;`, {
      this: obj,
      value: value
    });
  }

  public static isUsingThisVar(raws: string | null | undefined, varName: string | null | undefined): boolean {
    if (varName && raws) {
      if (varName.startsWith('this.')) {
        varName = varName.replace(/this\./, '');
      }
      // TODO: 훔.. 꼭필요한가..?  트리거될때 스크립트변수 까지 감지해야될까?
      EventManager.VARNAMES.forEach(it => {
        // raws = raws!.replace(RegExp(it.replace('$', '\\$'), 'g'), `this?.___${it}`);
        raws = raws!.replace(RegExp(it.replace('$', '\\$'), 'g'), `this.___${it}`);
      });
      const variablePaths = ObjectUtils.Path.detectPathFromScript(raws ?? '', {excludeThis: true});
      return variablePaths.has(varName);
    }
    return false;
  }

  public static setBindProperty(scripts: { [p: string]: any } | undefined, obj: any): { [p: string]: any } | undefined {
    if (scripts) {
      const newScripts = Object.assign({}, scripts);
      for (const [key, value] of Object.entries(newScripts)) {
        if (typeof value === 'function') {
          newScripts[key] = value.bind(obj);
        }
      }
      return newScripts;
    }
  }

  getBindScript(config?: DomRenderConfig) {
    if (config?.eventVariables) {
      const bindScript = Object.entries(config.eventVariables).filter(([key, value]) => !this.bindScript.includes(`const ${key}`)).map(([key, value]) => {
        return `const ${key} = this.__render.${key};`;
      }).join(';');
      return this.bindScript + '' + bindScript;
    } else {
      return this.bindScript;
    }
  }
}

