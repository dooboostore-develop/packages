import 'reflect-metadata';
import { ElementUtils } from '@dooboostore/core-web/element/ElementUtils';
import { OnChangeAttrRender, OtherData } from '../lifecycle/OnChangeAttrRender';
import { OnCreateRenderData, OnCreateRenderDataParams } from '../lifecycle/OnCreateRenderData';
import { RawSet } from '../rawsets/RawSet';
import { ConstructorType } from '@dooboostore/core/types';
import { OnCreatedThisChild } from '../lifecycle/OnCreatedThisChild';
import { DomRenderNoProxy } from '../decorators/DomRenderNoProxy';
import { OnInitRender } from '../lifecycle/OnInitRender';
import { ConvertUtils } from '@dooboostore/core/convert/ConvertUtils';
import { OnDestroyRender, OnDestroyRenderParams } from '../lifecycle/OnDestroyRender';
import { OnDrThisUnBind } from '../lifecycle/dr-this/OnDrThisUnBind';
import { OnDrThisBind } from '../lifecycle/dr-this/OnDrThisBind';
import type { Render } from '../rawsets/Render';
import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';
import { DomRenderConfig } from 'configs/DomRenderConfig';
import { Subject } from '@dooboostore/core/message/Subject';
import { debounceTime } from '@dooboostore/core/message/operators/debounceTime';
import { Subscription } from '@dooboostore/core/message/Subscription';


export const ATTRIBUTE_METADATA_KEY = Symbol('attribute');
export const QUERY_METADATA_KEY = Symbol('query');
export const EVENT_METADATA_KEY = Symbol('event');

export function attribute(options?: { name?: string, converter?: (value: any | string | null) => any }): (target: object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => void {
    return (target: object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
        const attributes = ReflectUtils.getMetadata(ATTRIBUTE_METADATA_KEY, target.constructor) || [];
        attributes.push({
            propertyKey: propertyKey,
            name: options?.name || propertyKey,
            converter: options?.converter,
            isMethod: !!descriptor
        });
        ReflectUtils.defineMetadata(ATTRIBUTE_METADATA_KEY, attributes, target.constructor);
    };
}

export function query(selector: string): (target: object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => void {
    return (target: object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
        const queries = ReflectUtils.getMetadata<any[]>(QUERY_METADATA_KEY, target.constructor) || [];
        queries.push({
            selector: selector,
            propertyKey: propertyKey,
            isMethod: !!descriptor
        });
        ReflectUtils.defineMetadata(QUERY_METADATA_KEY, queries, target.constructor);
    };
}

export function event(options: { query: string, name: string }): MethodDecorator {
    return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        const events = ReflectUtils.getMetadata(EVENT_METADATA_KEY, target.constructor) || [];
        events.push({
            query: options.query,
            eventName: options.name,
            methodName: propertyKey
        });
        ReflectUtils.defineMetadata(EVENT_METADATA_KEY, events, target.constructor);
    };
}


export type ComponentBaseConfig = { onlyParentType?: ConstructorType<any>[] | ConstructorType<any>, createChildrenDebounce?: number };

export type ChildrenSet = { instance: any, data: OnCreateRenderDataParams };

export class ComponentBase<T = any, C extends ComponentBaseConfig = ComponentBaseConfig> implements OnChangeAttrRender, OnCreateRenderData, OnCreatedThisChild, OnDrThisBind, OnDrThisUnBind, OnInitRender, OnDestroyRender {
  @DomRenderNoProxy
  private _rawSet?: RawSet;
  @DomRenderNoProxy
  private _children: ChildrenSet[] = [];
  @DomRenderNoProxy
  private _render: Render | undefined;
  @DomRenderNoProxy
  private _attribute?: T;
  @DomRenderNoProxy
  private _boundEventListeners: { element: Element, eventName: string, listener: (e: Event) => void }[] = [];

  @DomRenderNoProxy
  private childrenSetSubject = new Subject<ChildrenSet[]>();
  @DomRenderNoProxy
  private createChildrenDebounceSubscription?: Subscription | undefined;

  constructor(private _config?: C) {
  }
  get componentConfig(): C | undefined {
    return this._config;
  }
  get render(): Render | undefined {
    return this._render;
  }

  get rawSet(): RawSet | undefined {
    return this._rawSet;
  }

  get domRenderConfig(): DomRenderConfig | undefined {
    return this.rawSet?.dataSet.config;
  }

  private _queryElements(selector: string, rawSet:RawSet): Element[] {
    const e = this.getElement();
    // console.log('queryElement-->', e);
    if (e) {
      return ElementUtils.querySelectorAll(e, selector);
    } else {
      let startNode = rawSet.point?.start;
      let endNode = rawSet.point?.end;
      // console.log('-----', startNode, endNode)
      // console.log('-----', startNode?.isConnected, endNode?.isConnected)
      if (rawSet.point?.start && startNode && !startNode.isConnected && startNode instanceof HTMLElement && startNode.hasAttribute('id')) {
        rawSet.point.start = startNode = rawSet.dataSet.config.window.document.querySelector('#' + startNode.id) as HTMLMetaElement
      }
      if (rawSet.point?.end && endNode && !endNode.isConnected && endNode instanceof HTMLElement && endNode.hasAttribute('id')) {
        rawSet.point.end = endNode = rawSet.dataSet.config.window.document.querySelector('#' + endNode.id) as HTMLMetaElement
      }
      if (startNode && endNode) {
        // console.log('query!!', startNode, endNode);
        return ElementUtils.querySelectorAll({ start: startNode as Element, end: endNode as Element }, selector);
      }
    }
    return [];
  }

  private _cleanupEventListeners() {
    for (const { element, eventName, listener } of this._boundEventListeners) {
      element.removeEventListener(eventName, listener);
    }
    this._boundEventListeners = [];
  }

  getAttribute<K extends keyof T>(name: K, attribute = this._attribute): T[K] | null {
    const target = attribute as any;
    if (!target) {
      return null;
    }

    const nameString = String(name);
    let p = nameString;
    if (p in target) {
      return target[p];
    }
    p = ConvertUtils.snakeToCamelCase(nameString);
    if (p in target) {
      return target[p];
    }
    p = ConvertUtils.camelToSnakeCase(nameString);
    if (p in target) {
      return target[p];
    }
    p = nameString.toUpperCase()
    if (p in target) {
      return target[p];
    }
    p = nameString.toLowerCase()
    if (p in target) {
      return target[p];
    }
    return null;
  }

  hasAttribute(name: keyof T) {
    return this.getAttribute(name) !==null;
  }

  equalsAttributeName(n: string, name: keyof T) {
    return n === name ||
    ConvertUtils.snakeToCamelCase(n) === name ||
    ConvertUtils.camelToSnakeCase(n) === name ||
      n.toUpperCase() === (name as string).toUpperCase() ||
      n.toLowerCase() === (name as string).toLowerCase()
    ;
  }

  get uuid(): string | undefined {
    return this._rawSet?.uuid;
  }

  get childrenSet() {
    return this._children;
  }

  get children(): any[] {
    return this._children.map(it=>it.instance);
  }

  getElement<T extends Element>(): T | undefined {
    return (this.render ?? this.rawSet?.dataSet?.render)?.getElement?.();
  }

  getFirstChild<T>(type: ConstructorType<T>): T | undefined {
    return this._children.find(it => it instanceof type)?.instance;
  }

  getParentThis<P>():P {
    return this.render?.parentThis as P;
  }

  getChildren<C extends ConstructorType<any>>(type: C): InstanceType<C>[];
  getChildren<C extends ConstructorType<any>[]>(types: C): InstanceType<C[number]>[];
  getChildren(typeOrTypes: ConstructorType<any> | ConstructorType<any>[]): any[] {
    const targets = Array.isArray(typeOrTypes) ? typeOrTypes : [typeOrTypes];
    return this._children.filter(childSet =>
      targets.some(targetConstructor => childSet.instance instanceof targetConstructor)
    )?.map(it=>it.instance);
  }



  private setRawSet(rawSet: RawSet) {
    this._rawSet = rawSet;
    if (this._rawSet) {
      this.setAttribute(this._rawSet.dataSet?.render?.attribute as T);
    }
  }

  setAttribute(attribute: T) {
    this._attribute = attribute;
  }

  // TODO: rawSet isConnected로 체크해서 들어가있는것만 처리되도록 또는 이미들어가있는것도 뺴야될것같은데.. 적용하긴했음..지켜봐야될듯.
  onCreatedThisChild(child: any, data: OnCreateRenderDataParams) {
    // console.log('------------------------',child, data, data.render?.rawSet?.isConnected)
    const n = [...this._children];
    n.push({instance:child, data});
    this._children = n.filter(it=>it.data.render?.rawSet?.isConnected)
    this.childrenSetSubject.next(this._children);
    // this._children.push({instance:child, data: data});
  }

  onCreatedThisChildDebounce(childrenSet: ChildrenSet[]) {

  }

  onCreateRenderData(data: OnCreateRenderDataParams): void {
    this._render = data.render;
    if (data.render?.rawSet) {
      this.setRawSet(data.render.rawSet);
    }
    if (this._config?.onlyParentType) {
      const isOk = Array.isArray(this._config?.onlyParentType) ? this._config?.onlyParentType : [this._config?.onlyParentType].some(it => data.render?.parentThis instanceof it);
      if (!isOk) {
        throw new Error('only my parentThis ' + this._config?.onlyParentType);
      }
    }
  }

  onChangeAttrRender(name: string, value: any, other: OtherData): void {
    if (other.rawSet) {
      this.setRawSet(other.rawSet);
    }

    const attributes = ReflectUtils.getMetadata<any[]>(ATTRIBUTE_METADATA_KEY, this.constructor);
    if (attributes && Array.isArray(attributes)) {
        for (const attrInfo of attributes) {
            if (this.equalsAttributeName(name, attrInfo.name as any)) {
                const finalValue = attrInfo.converter ? attrInfo.converter(value) : value;
                if (attrInfo.isMethod) {
                    const method = (this as any)[attrInfo.propertyKey];
                    if (typeof method === 'function') {
                        method.call(this, finalValue);
                    }
                } else {
                    (this as any)[attrInfo.propertyKey] = finalValue;
                }
            }
        }
    }
  }

  onInitRender(param: any, rawSet: RawSet) {
    // console.log('onInitRender!!',param, rawSet);
    // console.dir(rawSet, {depth: 33})
    // console.table(rawSet);
    // console.log('--------', rawSet.point)
    this.createChildrenDebounceSubscription = this.childrenSetSubject.pipe(debounceTime(this.componentConfig?.createChildrenDebounce??0)).subscribe(it => {
      this.onCreatedThisChildDebounce(it);
    });
    if (rawSet) {
      this.setRawSet(rawSet);

      const e = this.getElement();
      if (e) {
        (e as any).component = this;
      }

      // Handle @query decorators
      const queries = ReflectUtils.getMetadata<any[]>(QUERY_METADATA_KEY, this.constructor);
      // console.log('queries', queries)
      if (queries && Array.isArray(queries)) {
        for (const queryInfo of queries) {
          const { selector, propertyKey, isMethod } = queryInfo;
          const elements = this._queryElements(selector, rawSet);
          // console.log('-------element', elements);
          if (isMethod) {
            const method = (this as any)[propertyKey];
            if (typeof method === 'function') {
                const paramTypes = ReflectUtils.getParameterTypes(this, propertyKey);
                if (paramTypes && paramTypes.length > 0 && paramTypes[0] === Array) {
                    method.call(this, elements);
                } else {
                    if (elements.length > 0) {
                        method.call(this, elements[0]);
                    }
                }
            }
          } else {
            const propertyType = ReflectUtils.getType(this, propertyKey);
            if (propertyType === Array) {
              (this as any)[propertyKey] = elements;
            } else {
              (this as any)[propertyKey] = elements[0] || null;
            }
          }
        }
      }

      // Handle @event decorators
      const events = ReflectUtils.getMetadata<any[]>(EVENT_METADATA_KEY, this.constructor);
      if (events && Array.isArray(events)) {
        for (const eventInfo of events) {
          const elements = this._queryElements(eventInfo.query, rawSet);
          elements.forEach(element => {
            const listener = (this as any)[eventInfo.methodName].bind(this);
            element.addEventListener(eventInfo.eventName, listener);
            this._boundEventListeners.push({ element, eventName: eventInfo.eventName, listener });
          });
        }
      }
    }
  }

  onDrThisBind() {
    // Logic moved to onInitRender for robustness
  }

  onDrThisUnBind() {
    this._cleanupEventListeners();
  }

  onDestroyRender(data?: OnDestroyRenderParams): void {
    this._cleanupEventListeners();
    this.createChildrenDebounceSubscription?.unsubscribe();
  }

}
