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
import { DomRenderConfig } from '../configs/DomRenderConfig';
import { Subject } from '@dooboostore/core/message/Subject';
import { debounceTime } from '@dooboostore/core/message/operators/debounceTime';
import type { Subscription } from '@dooboostore/core/message/Subscription';
import { OnRawSetRendered, OnRawSetRenderedOtherData } from "../lifecycle/OnRawSetRendered";


export const ATTRIBUTE_METADATA_KEY = Symbol('attribute');
export const QUERY_METADATA_KEY = Symbol('query');
export const EVENT_METADATA_KEY = Symbol('event');

export interface AttributeMetadata {
    propertyKey: string | symbol;
    name: string;
    converter?: (value: any | string | null) => any;
    isMethod: boolean;
}

export interface QueryMetadata {
    selector: string;
    propertyKey: string | symbol;
    isMethod: boolean;
    convert?: (e: Element) => any;
    onDestroy?: (componentInstance: any, element: Element) => void;
    refreshTime?: number; // milliseconds
    refreshRawSetRendered?: boolean;
}

export interface EventMetadata {
    query: string;
    eventName: string;
    methodName: string | symbol;
    onDestroy?: (componentInstance: any, element: Element) => void;
    refreshTime?: number; // milliseconds
    refreshRawSetRendered?: boolean;
}

export function attribute(nameOrOptions?: string | { name?: string, converter?: (value: any | string | null) => any }): (target: object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => void {
    return (target: object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
        const attributes = ReflectUtils.getMetadata<AttributeMetadata[]>(ATTRIBUTE_METADATA_KEY, target.constructor) || [];
        
        let name: string;
        let converter: ((value: any | string | null) => any) | undefined;
        
        if (typeof nameOrOptions === 'string') {
            name = nameOrOptions;
        } else if (nameOrOptions) {
            name = nameOrOptions.name || String(propertyKey);
            converter = nameOrOptions.converter;
        } else {
            name = String(propertyKey);
        }
        
        const attributeMetadata: AttributeMetadata = {
            propertyKey: propertyKey,
            name: name,
            converter: converter,
            isMethod: !!descriptor
        };
        
        attributes.push(attributeMetadata);
        ReflectUtils.defineMetadata(ATTRIBUTE_METADATA_KEY, attributes, target.constructor);
    };
}

export function query(selectorOrOptions: string | { selector: string, convert?: (e: Element) => any, onDestroy?: (componentInstance: any, element: Element) => void, refreshIntervalTime?: number, refreshRawSetRendered?: boolean }): (target: object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => void {
    return (target: object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
        const queries = ReflectUtils.getMetadata<QueryMetadata[]>(QUERY_METADATA_KEY, target.constructor) || [];
        
        let selector: string;
        let convert: ((e: Element) => any) | undefined;
        let onDestroy: ((componentInstance: any, element: Element) => void) | undefined;
        let refreshTime: number | undefined;
        let refreshRawSetRendered: boolean | undefined;

        if (typeof selectorOrOptions === 'string') {
            selector = selectorOrOptions;
        } else {
            selector = selectorOrOptions.selector;
            convert = selectorOrOptions.convert;
            onDestroy = selectorOrOptions.onDestroy;
            refreshTime = selectorOrOptions.refreshIntervalTime;
            refreshRawSetRendered = selectorOrOptions.refreshRawSetRendered;
        }
        
        const queryMetadata: QueryMetadata = {
            selector: selector,
            propertyKey: propertyKey,
            isMethod: !!descriptor,
            convert: convert,
            onDestroy: onDestroy,
            refreshTime: refreshTime,
            refreshRawSetRendered
        };
        
        queries.push(queryMetadata);
        ReflectUtils.defineMetadata(QUERY_METADATA_KEY, queries, target.constructor);
    };
}

export function event(options: { query: string, name: string, onDestroy?: (componentInstance: any, element: Element) => void, refreshTime?: number, refreshRawSetRendered?: boolean }): MethodDecorator {
    return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        const events = ReflectUtils.getMetadata<EventMetadata[]>(EVENT_METADATA_KEY, target.constructor) || [];
        
        const eventMetadata: EventMetadata = {
            query: options.query,
            eventName: options.name,
            methodName: propertyKey,
            onDestroy: options.onDestroy,
            refreshTime: options.refreshTime,
            refreshRawSetRendered: options.refreshRawSetRendered
        };
        
        events.push(eventMetadata);
        ReflectUtils.defineMetadata(EVENT_METADATA_KEY, events, target.constructor);
    };
}


export type ComponentBaseConfig = { onlyParentType?: ConstructorType<any>[] | ConstructorType<any>, createChildrenDebounce?: number };

export type ChildrenSet = { instance: any, data: OnCreateRenderDataParams };

export class ComponentBase<T = any, C extends ComponentBaseConfig = ComponentBaseConfig> implements OnChangeAttrRender, OnCreateRenderData, OnCreatedThisChild, OnDrThisBind, OnDrThisUnBind, OnInitRender, OnDestroyRender, OnRawSetRendered {
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
  private _queryBindings: { element: Element, metadata: QueryMetadata }[] = [];
  @DomRenderNoProxy
  private _eventBindings: { element: Element, metadata: EventMetadata, listener: (e: Event) => void }[] = [];
  @DomRenderNoProxy
  private _refreshTimers: Map<QueryMetadata | EventMetadata, NodeJS.Timeout> = new Map();

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

  private _cleanupQueryBindings() {
    for (const { element, metadata } of this._queryBindings) {
      if (metadata.onDestroy) {
        metadata.onDestroy(this, element);
      }
      this._clearRefreshTimer(metadata);
    }
    this._queryBindings = [];
  }

  private _cleanupEventBindings() {
    for (const { element, metadata, listener } of this._eventBindings) {
      element.removeEventListener(metadata.eventName, listener);
      if (metadata.onDestroy) {
        metadata.onDestroy(this, element);
      }
      this._clearRefreshTimer(metadata);
    }
    this._eventBindings = [];
  }

  private _applyQueryBinding(queryInfo: QueryMetadata, elements: Element[], newElementsOnly: Element[] = elements) {
    const { propertyKey, isMethod, convert } = queryInfo;
    
    // Track bindings for cleanup
    elements.forEach(element => {
      this._queryBindings.push({ element, metadata: queryInfo });
    });
    
    // Apply convert function if provided
    const processedElements = convert ? elements.map(convert) : elements;
    const processedNewElements = convert ? newElementsOnly.map(convert) : newElementsOnly;
    
    if (isMethod) {
      const method = (this as any)[propertyKey];
      if (typeof method === 'function') {
          const paramTypes = ReflectUtils.getParameterTypes(this, propertyKey);
          if (paramTypes && paramTypes.length > 0 && paramTypes[0] === Array) {
              // For array methods, pass only new elements
              method.call(this, processedNewElements, processedElements);
          } else {
              // For single element methods, pass first new element
              if (processedNewElements.length > 0) {
                  method.call(this, processedNewElements[0]);
              }
          }
      }
    } else {
      // For properties, always set all elements (not just new ones)
      const propertyType = ReflectUtils.getType(this, propertyKey);
      if (propertyType === Array) {
        (this as any)[propertyKey] = processedElements;
      } else {
        (this as any)[propertyKey] = processedElements[0] || null;
      }
    }
  }

  private _setupQueryDecorators(rawSet: RawSet) {
    if (!rawSet) return;

    const queries = ReflectUtils.getMetadata<QueryMetadata[]>(QUERY_METADATA_KEY, this.constructor);
    // console.group('_setupQueryDecorators')
    // console.log('queries', queries);
    if (queries && Array.isArray(queries)) {
      for (const queryInfo of queries) {
        const elements = this._queryElements(queryInfo.selector, rawSet);
        // console.log('------elements', elements);
        this._applyQueryBinding(queryInfo, elements);
        
        // Setup refresh timer if specified
        this._setupRefreshTimer(queryInfo);
      }
    }
    // console.groupEnd();
  }

  private _updateQueryBinding(queryInfo: QueryMetadata, rawSet: RawSet, forceUpdate = false) {
    const newElements = this._queryElements(queryInfo.selector, rawSet);
    
    // Get current bindings for this query
    const currentBindings = this._queryBindings.filter(binding => binding.metadata === queryInfo);
    const currentElements = currentBindings.map(binding => binding.element);
    
    // Check if elements have changed
    const elementsChanged = forceUpdate || !this._arraysEqual(currentElements, newElements);
    
    if (elementsChanged) {
      let addedElements: Element[] = [];
      
      if (forceUpdate) {
        // Force update: cleanup all old bindings, treat all as new
        currentBindings.forEach(({ element, metadata }) => {
          if (metadata.onDestroy) {
            metadata.onDestroy(this, element);
          }
        });
        addedElements = newElements;
      } else {
        // Smart update: only cleanup removed elements, find added elements
        const removedElements = currentElements.filter(element => !newElements.includes(element));
        addedElements = newElements.filter(element => !currentElements.includes(element));
        
        removedElements.forEach(element => {
          if (queryInfo.onDestroy) {
            queryInfo.onDestroy(this, element);
          }
        });
      }
      
      // Remove old bindings
      this._queryBindings = this._queryBindings.filter(binding => binding.metadata !== queryInfo);
      
      // Apply new bindings, but pass only added elements to methods
      this._applyQueryBinding(queryInfo, newElements, addedElements);
    }
  }

  private _updateQueryDecorators(rawSet: RawSet) {
    if (!rawSet) return;

    const queries = ReflectUtils.getMetadata<QueryMetadata[]>(QUERY_METADATA_KEY, this.constructor);
    if (queries && Array.isArray(queries)) {
      for (const queryInfo of queries) {
        this._updateQueryBinding(queryInfo, rawSet);
      }
    }
  }

  private _arraysEqual(arr1: Element[], arr2: Element[]): boolean {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((element, index) => element === arr2[index]);
  }

  private _setupRefreshTimer(metadata: QueryMetadata | EventMetadata) {
    if (!metadata.refreshTime || !this._rawSet) return;

    const timer = setInterval(() => {
      if (!this._rawSet) return;

      if ('selector' in metadata) {
        // QueryMetadata
        this._updateQueryBinding(metadata as QueryMetadata, this._rawSet);
      } else {
        // EventMetadata
        this._updateEventBinding(metadata as EventMetadata, this._rawSet);
      }
    }, metadata.refreshTime);

    this._refreshTimers.set(metadata, timer);
  }

  private _clearRefreshTimer(metadata: QueryMetadata | EventMetadata) {
    const timer = this._refreshTimers.get(metadata);
    if (timer) {
      clearInterval(timer);
      this._refreshTimers.delete(metadata);
    }
  }

  private _clearAllRefreshTimers() {
    for (const timer of Array.from(this._refreshTimers.values())) {
      clearInterval(timer);
    }
    this._refreshTimers.clear();
  }

  async onRawSetRendered(rawSet: RawSet, otherData: OnRawSetRenderedOtherData): Promise<void> {
    const queries = ReflectUtils.getMetadata<QueryMetadata[]>(QUERY_METADATA_KEY, this.constructor);
    if (queries) {
      queries.filter(it => it.refreshRawSetRendered).forEach(queryInfo => {
        this._updateQueryBinding(queryInfo, rawSet, true);
      });
    }

    const events = ReflectUtils.getMetadata<EventMetadata[]>(EVENT_METADATA_KEY, this.constructor);
    if (events) {
      events.filter(it => it.refreshRawSetRendered).forEach(eventInfo => {
        this._updateEventBinding(eventInfo, rawSet, true);
      });
    }
  }
  /**
   * Manually refresh all query and event decorators
   * Useful when DOM elements are dynamically added/removed and you want to update bindings
   */
  refreshDecorators(): void {
    if (this._rawSet) {
      this._updateQueryDecorators(this._rawSet);
      this._updateEventDecorators(this._rawSet);
    }
  }

  /**
   * Manually refresh specific query decorators by property key
   * @param propertyKeys - Array of property keys to refresh, or single property key
   */
  refreshQueryDecorators(propertyKeys: (string | symbol) | (string | symbol)[]): void {
    if (!this._rawSet) return;

    const keys = Array.isArray(propertyKeys) ? propertyKeys : [propertyKeys];
    const queries = ReflectUtils.getMetadata<QueryMetadata[]>(QUERY_METADATA_KEY, this.constructor);
    
    if (queries && Array.isArray(queries)) {
      for (const queryInfo of queries) {
        if (keys.includes(queryInfo.propertyKey)) {
          this._updateQueryBinding(queryInfo, this._rawSet, true); // Force update
        }
      }
    }
  }

  /**
   * Manually refresh specific event decorators by method name
   * @param methodNames - Array of method names to refresh, or single method name
   */
  refreshEventDecorators(methodNames: (string | symbol) | (string | symbol)[]): void {
    if (!this._rawSet) return;

    const names = Array.isArray(methodNames) ? methodNames : [methodNames];
    const events = ReflectUtils.getMetadata<EventMetadata[]>(EVENT_METADATA_KEY, this.constructor);
    
    if (events && Array.isArray(events)) {
      for (const eventInfo of events) {
        if (names.includes(eventInfo.methodName)) {
          this._updateEventBinding(eventInfo, this._rawSet, true); // Force update
        }
      }
    }
  }

  private _applyEventBinding(eventInfo: EventMetadata, elements: Element[]) {
    elements.forEach(element => {
      const listener = (this as any)[eventInfo.methodName].bind(this);
      // console.log('bind?????', element);
      element.addEventListener(eventInfo.eventName, listener);
      
      // Track bindings for cleanup
      this._eventBindings.push({ element, metadata: eventInfo, listener });
      this._boundEventListeners.push({ element, eventName: eventInfo.eventName, listener });
    });
  }

  private _setupEventDecorators(rawSet: RawSet) {
    if (!rawSet) return;

    const events = ReflectUtils.getMetadata<EventMetadata[]>(EVENT_METADATA_KEY, this.constructor);
    if (events && Array.isArray(events)) {
      for (const eventInfo of events) {
        const elements = this._queryElements(eventInfo.query, rawSet);
        this._applyEventBinding(eventInfo, elements);
        
        // Setup refresh timer if specified
        this._setupRefreshTimer(eventInfo);
      }
    }
  }

  private _updateEventBinding(eventInfo: EventMetadata, rawSet: RawSet, forceUpdate = false) {
    const newElements = this._queryElements(eventInfo.query, rawSet);
    
    // Get current bindings for this event
    const currentBindings = this._eventBindings.filter(binding => binding.metadata === eventInfo);
    const currentElements = currentBindings.map(binding => binding.element);
    
    // Check if elements have changed
    const elementsChanged = forceUpdate || !this._arraysEqual(currentElements, newElements);
    
    if (elementsChanged) {
      if (forceUpdate) {
        // Force update: cleanup all old bindings
        currentBindings.forEach(({ element, metadata, listener }) => {
          element.removeEventListener(metadata.eventName, listener);
          if (metadata.onDestroy) {
            metadata.onDestroy(this, element);
          }
        });
      } else {
        // Smart update: only cleanup removed elements
        const removedElements = currentElements.filter(element => !newElements.includes(element));
        const removedBindings = currentBindings.filter(binding => removedElements.includes(binding.element));
        
        removedBindings.forEach(({ element, metadata, listener }) => {
          element.removeEventListener(metadata.eventName, listener);
          if (metadata.onDestroy) {
            metadata.onDestroy(this, element);
          }
        });
      }
      
      // Remove old bindings from tracking arrays
      this._eventBindings = this._eventBindings.filter(binding => binding.metadata !== eventInfo);
      this._boundEventListeners = this._boundEventListeners.filter(binding => 
        !currentBindings.some(cb => cb.element === binding.element && cb.metadata.eventName === binding.eventName)
      );
      
      // Apply new bindings
      this._applyEventBinding(eventInfo, newElements);
    }
  }

  private _updateEventDecorators(rawSet: RawSet) {
    if (!rawSet) return;

    const events = ReflectUtils.getMetadata<EventMetadata[]>(EVENT_METADATA_KEY, this.constructor);
    if (events && Array.isArray(events)) {
      for (const eventInfo of events) {
        this._updateEventBinding(eventInfo, rawSet);
      }
    }
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
    // console.log('onCreatedThisChild------------------------',child, data, data.render?.rawSet?.isConnected)
    const n = [...this._children];
    n.push({instance:child, data});
    this._children = n.filter(it=>it.data.render?.rawSet?.isConnected)
    this.childrenSetSubject.next(this._children);
    
    // Update decorators when children change (DOM might have changed)
    // Only update if elements actually changed
    if (this._rawSet) {
      this._updateQueryDecorators(this._rawSet);
      this._updateEventDecorators(this._rawSet);
    }
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

    const attributes = ReflectUtils.getMetadata<AttributeMetadata[]>(ATTRIBUTE_METADATA_KEY, this.constructor);
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
    this.createChildrenDebounceSubscription = this.childrenSetSubject.pipe(debounceTime(this.componentConfig?.createChildrenDebounce??0)).subscribe(it => {
      this.onCreatedThisChildDebounce(it);
    });
    if (rawSet) {
      this.setRawSet(rawSet);

      const e = this.getElement();
      if (e) {
        (e as any).component = this;
      }

      // Setup decorators
      this._setupQueryDecorators(rawSet);
      this._setupEventDecorators(rawSet);
    }
  }

  onDrThisBind() {
    // Logic moved to onInitRender for robustness
  }

  onDrThisUnBind() {
    this.onDestroy();
  }

  onDestroyRender(data?: OnDestroyRenderParams): void {
    this.onDestroy();
  }

  onDestroy() {
    this._cleanupEventListeners();
    this._cleanupQueryBindings();
    this._cleanupEventBindings();
    this._clearAllRefreshTimers();
    this.createChildrenDebounceSubscription?.unsubscribe();
  }

}
