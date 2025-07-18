import { Config } from '../configs/Config';
import { ScriptUtils } from '@dooboostore/core-web/script/ScriptUtils';
import { DomUtils } from '@dooboostore/core-web/dom/DomUtils';
import { Range } from '../iterators/Range';
import { DomRenderFinalProxy } from '../types/Types';

export class EventManager {
  public static readonly attrPrefix = 'dr-';
  public readonly eventNames = [
    'click', 'mousedown', 'mouseup', 'dblclick', 'mouseover', 'mouseout', 'mousemove', 'mouseenter', 'mouseleave', 'contextmenu',
    'keyup', 'keydown', 'keypress', 'toggle',
    'change', 'input', 'submit', 'resize', 'focus', 'blur',
    'close', 'cancel' // dialog cancel 이벤트는 close 이벤트의 하위 이벤트로, ESC 키나 취소 버튼으로 닫힐 때만 발생.    (close// 추가 로직 (예: 닫힘 후 처리))
    /*
    close 이벤트: <dialog>가 닫힐 때 발생. 사용자가 취소 버튼, 확인 버튼, 또는 dialog.close() 메서드로 닫을 때 모두 트리거됩니다.
    cancel 이벤트: <dialog>가 ESC 키나 취소 버튼으로 닫힐 때 발생. close 이벤트의 하위 이벤트로 볼 수 있습니다.
     */
  ];

  public static ownerVariablePathAttrName = EventManager.attrPrefix + 'owner-variable-path';

  public static readonly eventParam = EventManager.attrPrefix + 'event';
  public static readonly onInitAttrName = EventManager.attrPrefix + 'on-init';
  public static readonly valueAttrName = EventManager.attrPrefix + 'value';
  public static linkAttrs = [
    {name: EventManager.attrPrefix + 'value-link', property: 'value', event: 'input'},
    {name: EventManager.attrPrefix + 'hidden-link', property: 'value', event: 'input'},
    {name: EventManager.attrPrefix + 'required-link', property: 'value', event: 'input'},
    {name: EventManager.attrPrefix + 'checked-link', property: 'checked', event: 'change'},
    {name: EventManager.attrPrefix + 'open-link', property: 'open', event: 'toggle'},
  ]
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
  public static readonly VARNAMES = [EventManager.SCRIPTS_VARNAME, EventManager.FAG_VARNAME, EventManager.RAWSET_VARNAME, EventManager.RANGE_VARNAME, EventManager.ROUTER_VARNAME, EventManager.ELEMENT_VARNAME, EventManager.TARGET_VARNAME, EventManager.EVENT_VARNAME, EventManager.COMPONENT_VARNAME, EventManager.INNERHTML_VARNAME, EventManager.ATTRIBUTE_VARNAME, EventManager.ATTRIBUTE_VARNAME, EventManager.CREATOR_META_DATA_VARNAME, EventManager.PARENT_THIS_PATH_VARNAME, EventManager.PARENT_THIS_VARNAME, EventManager.attrAttrName];

  public static readonly WINDOW_EVENT_POPSTATE = 'popstate';
  public static readonly WINDOW_EVENT_RESIZE = 'resize';
  public static readonly WINDOW_EVENTS = [EventManager.WINDOW_EVENT_POPSTATE, EventManager.WINDOW_EVENT_RESIZE];
  public static readonly attrNames = [
    EventManager.valueAttrName,
    EventManager.attrAttrName,
    EventManager.normalAttrMapAttrName,
    EventManager.styleAttrName,
    EventManager.classAttrName,
    EventManager.attrPrefix + 'window-event-' + EventManager.WINDOW_EVENT_POPSTATE,
    EventManager.attrPrefix + 'window-event-' + EventManager.WINDOW_EVENT_RESIZE,
    EventManager.onInitAttrName,
    ...EventManager.linkAttrs.map(it=>it.name),
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

  constructor() {
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
              const obj = (it as any).obj as any;
              const config = obj?._DomRender_proxy?.config;
              ScriptUtils.eval(`${this.bindScript} ${script} `, Object.assign(obj, {
                __render: Object.freeze({
                  target: DomRenderFinalProxy.final(event.target),
                  element: it,
                  event: event,
                  range: Range.range,
                  scripts: EventManager.setBindProperty(config?.scripts, obj)
                  // ...EventManager.eventVariables
                })
              }));
            }
          });
        });
      });
    }
  }

  // // 순환참조때문에 우선 여기에 뺴놓는다.
  // public DomrenderProxyFinal(obj: any) {
  //     (obj as any)._DomRender_isFinal = true;
  //     return obj;
  // }

  // 중요 이벤트에 대상이될 Elements를 찾는다.
  public findAttrElements(fragment: DocumentFragment | Element, config?: Config): Set<Element> {
    // const datas: {name: string, value: string | null, element: Element}[] = [];
    const elements = new Set<Element>();
    const addAttributes = config?.applyEvents?.map(it => it.attrName) ?? [];
    addAttributes.concat([...EventManager.attrNames]).forEach(attrName => {
      fragment?.querySelectorAll(`[${attrName}]`).forEach(it => {
        elements.add(it);
      });
    });
    return elements;
  }

  // 중요 처음 이벤트 처리
  // eslint-disable-next-line no-undef
  public applyEvent(obj: any, childNodes: Set<ChildNode> | Set<Element>, config?: Config) {
    // console.log('eventManager applyEvent==>', obj, childNodes, config)
    // Node.ELEMENT_NODE = 1
    // event
    // childNodes.forEach(it => {
    //     if (it instanceof Element) {
    //         it.setAttribute('dr-thieVariableName', 'this')
    //     }
    // })
    // 중요 이벤트 걸어줌
    this.eventNames.forEach(it => {
      this.addDrEvents(obj, it, childNodes, config);
    });
    this.addDrEventPram(obj, EventManager.eventParam, childNodes, config);

    // value
    this.procAttr<HTMLInputElement>(childNodes, EventManager.valueAttrName, (it, attribute) => {
      const script = attribute;
      if (script) {
        const data = ScriptUtils.evalReturn(script, obj);
        if (it.value !== data) {
          it.value = data;
        }
      }
    });

    // normal-attr-map
    this.procAttr(childNodes, EventManager.normalAttrMapAttrName, (it, attribute) => {
      const map = new Map<string, string>(JSON.parse(attribute));
      map.forEach((v, k) => {
        const data = ScriptUtils.eval(`const $element = this.element;  return ${v} `, Object.assign(obj, {
          __render: Object.freeze({
            element: it,
            attribute: DomUtils.getAttributeToObject(it)
          })
        }));
        // console.log('-------normalAttribute---datadatadata',data)
        if (data === null) {
          it.removeAttribute(k);
        } else {
          it.setAttribute(k, data);
        }
      });
    });

    // window event
    EventManager.WINDOW_EVENTS.forEach(it => {
      this.procAttr<HTMLInputElement>(childNodes, EventManager.attrPrefix + 'window-event-' + it, (it, attribute) => {
        (it as any).obj = obj;
      });
    });

    // value-link event
    EventManager.linkAttrs.forEach(linkInfo => {
      this.procAttr<HTMLElement>(childNodes, linkInfo.name, (it, varName) => {
        if (varName) {
          const ownerVariablePathName = it.getAttribute(EventManager.ownerVariablePathAttrName);
          const mapScript = it.getAttribute(`${linkInfo.name}:map`);
          // const inMapScript = it.getAttribute(`${valueLinkAttrName}:in-map`);
          let bindObj = obj;
          if (ownerVariablePathName) {
            bindObj = ScriptUtils.evalReturn(ownerVariablePathName, obj);
          }
          const getValue = this.getValue(obj, varName, bindObj);
          // TODO: 아래 나중에 리팩토링 필요함
          if (typeof getValue === 'function' && getValue) {
            let setValue = (it as any)[linkInfo.property];
            if (mapScript) {
              setValue = ScriptUtils.eval(`${this.getBindScript(config)} return ${mapScript}`, Object.assign(bindObj, { __render: Object.freeze({ element: it, target: bindObj, range: Range.range, value: setValue, scripts: EventManager.setBindProperty(config?.scripts, obj), ...config?.eventVariables }) }));
            }
            getValue(setValue);
          } else if (getValue) {
            let setValue = getValue;
            if (mapScript) {
              setValue = ScriptUtils.eval(`${this.getBindScript(config)} return ${mapScript}`, Object.assign(bindObj, { __render: Object.freeze({ element: it, target: bindObj, range: Range.range, value: setValue, scripts: EventManager.setBindProperty(config?.scripts, obj), ...config?.eventVariables }) }));
            }
            // console.log('------->',it.value, setValue)
            if (setValue === null) {
              it.removeAttribute(linkInfo.property);
            } else {
              // console.log('-----------',it, setValue)
              (it as any)[linkInfo.property] = setValue;
            }
            // 여기서 value가 먼저냐 value-link가 먼저냐 선을 정해야되는거네..-> 라고해서 undefined일때에는 element값을 먼저셋팅해준다.
          } else if (getValue === undefined){
            this.setValue(obj, varName, (it as any)[linkInfo.property]);
          }

          it.addEventListener(linkInfo.event, (event) => {
            let value = (it as any)[linkInfo.property];
            if (mapScript) {
              value = ScriptUtils.eval(`${this.getBindScript(config)} return ${mapScript}`, Object.assign(bindObj, {
                __render: Object.freeze({
                  event,
                  element: it,
                  attribute: DomUtils.getAttributeToObject(it),
                  target: event.target,
                  range: Range.range,
                  scripts: EventManager.setBindProperty(config?.scripts, obj),
                  ...config?.eventVariables
                })
              }));
            }
            if (typeof this.getValue(obj, varName, bindObj) === 'function') {
              this.getValue(obj, varName, bindObj)(value, event);
            } else {
              this.setValue(obj, varName, value);
            }
          });
        }
      });
    })



    // on-init event
    this.procAttr<HTMLInputElement>(childNodes, EventManager.onInitAttrName, (it, attribute) => {
      let script = attribute;
      if (script) {
        script = 'return ' + script;
      }
      if (script) {
        ScriptUtils.eval(`${this.getBindScript(config)}; ${script} `, Object.assign(obj, {
          __render: Object.freeze({
            element: it,
            attribute: DomUtils.getAttributeToObject(it),
            ...config?.eventVariables
          })
        }));
      }
    });

    this.onRenderedEvent(obj,childNodes, config);
    this.changeVar(obj, childNodes, undefined, config);
    // console.log('eventManager-applyEvent-->', config?.applyEvents)
    const elements = Array.from(childNodes).filter(it => it.nodeType === 1).map(it => it as Element);
    elements.forEach(it => {
      config?.applyEvents?.filter(ta => it.getAttribute(ta.attrName) !== null).forEach(ta => ta.callBack(it, it.getAttribute(ta.attrName)!, obj));
    });
  }

  // RawSet에서 replaceBody이후에 호출
  public onRenderedEvent(obj: any, childNodes: Set<ChildNode> | Set<Element> | Node[], config?: Config) {
    // console.log('--------onRenderedEvent', obj, childNodes);
    // console.log(document.querySelectorAll(`[${EventManager.onRenderedInitAttrName}]`))
    this.procAttr<HTMLInputElement>(childNodes, EventManager.onRenderedInitAttrName, (it, attribute) => {
      // console.log('---------', it);
      if (!it.isConnected) {
        return;
      }
      let script = attribute;
      if (script) {
        script = 'return ' + script;
      }
      // console.log('onRendered!!')
      if (script) {
        ScriptUtils.eval(`${this.getBindScript(config)}; ${script} `, Object.assign(obj, {
          __render: Object.freeze({
            element: it,
            attribute: DomUtils.getAttributeToObject(it),
            ...config?.eventVariables
          })
        }));
      }
    });
  }

  // eslint-disable-next-line no-undef
  public changeVar(obj: any, elements: Set<Element> | Set<ChildNode>, varName?: string, config?: Config) {
    // style
    this.procAttr(elements, EventManager.styleAttrName, (it, attribute) => {
      let script = attribute;
      if (script) {
        script = 'return ' + script;
      }
      if (EventManager.isUsingThisVar(script, varName) || varName === undefined) {
        const data = ScriptUtils.eval(`const $element = this.__render.element;  ${script} `, Object.assign(obj, {
          __render: Object.freeze({
            element: it,
            attribute: DomUtils.getAttributeToObject(it)
          })
        }));
        if (typeof data === 'string') {
          it.setAttribute('style', data);
        } else if (Array.isArray(data)) {
          it.setAttribute('style', data.join(';'));
        } else {
          for (const [key, value] of Object.entries(data)) {
            if (it instanceof HTMLElement) {
              (it.style as any)[key] = String(value);
            }
          }
        }
      }
    });

    // class
    this.procAttr(elements, EventManager.classAttrName, (it, attribute) => {
      let script = attribute;
      if (script) {
        script = 'return ' + script;
      }
      if (EventManager.isUsingThisVar(script, varName) || varName === undefined) {
        const data = ScriptUtils.eval(`const $element = this.element;  ${script} `, Object.assign(obj, {
          __render: Object.freeze({
            element: it,
            attribute: DomUtils.getAttributeToObject(it)
          })
        }));

        if (typeof data === 'string') {
          it.setAttribute('class', data);
        } else if (Array.isArray(data)) {
          it.setAttribute('class', data.join(' '));
        } else {
          for (const [key, value] of Object.entries(data)) {
            if (it instanceof HTMLElement) {
              if (value) {
                it.classList.add(key);
              } else {
                it.classList.remove(key);
              }
            }
          }
        }
      }
    });
    // this.onRenderedEvent(obj,elements, config);

  }

  public addDrEvents(obj: any, eventName: string, elements: Set<Element> | Set<ChildNode>, config?: Config) {
    // console.log('-------?', config?.router)
    const attr = EventManager.attrPrefix + 'event-' + eventName;
    this.procAttr<HTMLElement>(elements, attr, (it, attribute) => {
      const script = attribute;
      const hasDispatch = it.hasAttribute(`${attr}:dispatch`);
      // console.log('hasDispatch',hasDispatch, attr, it);
      it.addEventListener(eventName, (event) => {
        let filter = true;
        const filterScript = it.getAttribute(`${attr}:filter`);
        const thisTarget = Object.assign(obj, {
          __render: Object.freeze({
            event,
            element: it,
            target: event.target,
            range: Range.range,
            attribute: DomUtils.getAttributeToObject(it),
            router: config?.router,
            scripts: EventManager.setBindProperty(config?.scripts, obj),
            ...config?.eventVariables
          })
        });
        if (filterScript) {
          filter = ScriptUtils.eval(`${this.getBindScript(config)} return ${filterScript}`, thisTarget);
        }
        if (filter) {
          ScriptUtils.eval(`${this.getBindScript(config)} ${script} `, thisTarget);
        }
      });
      if (hasDispatch) {
        it.dispatchEvent(new Event(eventName));
      }
    });
  }

  // eslint-disable-next-line no-undef
  public addDrEventPram(obj: any, attr: string, elements: Set<ChildNode> | Set<Element>, config?: Config) {
    this.procAttr<HTMLInputElement>(elements, attr, (it, attribute, attributes) => {
      const bind: string | undefined = attributes[attr + ':bind'];
      if (bind) {
        const script = attribute;
        const params = {} as any;
        const prefix = attr + ':';
        Object.entries(attributes).filter(([k, v]) => k.startsWith(prefix)).forEach(([k, v]) => {
          params[k.slice(prefix.length)] = v;
        });
        bind.split(',').forEach(eventName => {
          it.addEventListener(eventName.trim(), (event) => {
            ScriptUtils.eval(`const $params = this.__render.params; ${this.getBindScript(config)}  ${script} `, Object.assign(obj, {
              __render: Object.freeze({
                event,
                element: it,
                attribute: DomUtils.getAttributeToObject(it),
                target: event.target,
                range: Range.range,
                scripts: EventManager.setBindProperty(config?.scripts, obj),
                params,
                ...config?.eventVariables
              })
            }));
          });
        });
      }
    });
  }

  // eslint-disable-next-line no-undef
  public procAttr<T extends Element = Element>(elements: Set<Element> | Set<ChildNode> | Node[] = new Set(), attrName: string, callBack: (h: T, value: string, attributes: any) => void) {
    const sets = new Set<Element>();
    elements.forEach(it => {
      // console.log('--->type', it, it.nodeType)
      if (!it) {
        return;
      }
      // Node.ELEMENT_NODE = 1
      if (it.nodeType === 1) {
        const e = it as Element;
        sets.add(e);
        e.querySelectorAll<T>(`[${attrName}]`).forEach(it => {
          sets.add(it);
        });
      }
    });
    // console.log('---setr',sets);
    sets.forEach(it => {
      const attr = it.getAttribute(attrName);
      const attrs = DomUtils.getAttributeToObject(it);
      if (attr) {
        callBack(it as T, attr, attrs);
      }
    });
  }

  public getValue<T = any>(obj: any, name: string, bindObj?: any): T {
    // let r = obj[name];
    let r = ScriptUtils.evalReturn(name, obj);
    if (typeof r === 'function') {
      r = r.bind(bindObj ?? obj);
    }
    return r;
  }

  public setValue(obj: any, name: string, value?: any) {
    name = name.replaceAll('this.', 'this.this.');
    ScriptUtils.eval(`${name} = this.value;`, {
      this: obj,
      value: value
    });
  }

  public static isUsingThisVar(raws: string | null | undefined, varName: string | null | undefined): boolean {
    // console.log('isUsingV', raws)
    // console.log('isUsingV', raws, varName, ScriptUtils.getVariablePaths(raws ?? ''))
    if (varName && raws) {
      if (varName.startsWith('this.')) {
        varName = varName.replace(/this\./, '');
      }
      EventManager.VARNAMES.forEach(it => {
        // raws = raws!.replace(RegExp(it.replace('$', '\\$'), 'g'), `this?.___${it}`);
        raws = raws!.replace(RegExp(it.replace('$', '\\$'), 'g'), `this.___${it}`);
      });
      const variablePaths = ScriptUtils.getVariablePaths(raws ?? '');
      return variablePaths.has(varName);
    }
    return false;
  }

  public static setBindProperty(scripts: { [p: string]: any } | undefined, obj: any): { [p: string]: any } | undefined {
    if (scripts) {
      // const newScripts = Object.assign({}, scripts)
      const newScripts = Object.assign({}, scripts);
      for (const [key, value] of Object.entries(newScripts)) {
        if (typeof value === 'function') {
          newScripts[key] = value.bind(obj);
        }
      }
      return newScripts;
    }
  }

  getBindScript(config?: Config) {
    if (config?.eventVariables) {
      const bindScript = Object.entries(config.eventVariables).filter(([key, value]) => !this.bindScript.includes(`const ${key}`)).map(([key, value]) => {
        return `const ${key} = this.__render.${key};`;
      }).join(';');
      return this.bindScript + '' + bindScript;
    } else {
      return this.bindScript;
    }
  }

  // public usingThisVar(raws: string): string[] {
  //     let regex = /include\(.*\)/gm;
  //     // raws = raws.replace(regex, '');
  //     regex = /["'].*?["']/gm;
  //     raws = raws.replace(regex, '');
  //     const varRegexStr = 'this\\.([a-zA-Z_$][?a-zA-Z_.$0-9]*)';
  //     // const varRegexStr = '(?:this|it)\\.([a-zA-Z_$][?a-zA-Z_.$0-9]*)';
  //     // const varRegexStr = 'this\\.([a-zA-Z_$][?\\[\\]a-zA-Z_.$0-9]*)';
  //     const varRegex = RegExp(varRegexStr, 'gm');
  //     let varExec = varRegex.exec(raws)
  //     const usingVars = new Set<string>();
  //     // const usingVars = [];
  //     while (varExec) {
  //         const value = varExec[1].replace(/\?/g, '');
  //         usingVars.add(value);
  //         value.split('.').forEach(it => usingVars.add(it))
  //         varExec = varRegex.exec(varExec.input)
  //     }
  //     const strings = Array.from(usingVars);
  //     return strings;
  // }
}

export const eventManager = new EventManager();
