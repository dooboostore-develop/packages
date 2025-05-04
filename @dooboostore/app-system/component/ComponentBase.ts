import { OnChangeAttrRender, OtherData } from '@dooboostore/dom-render/lifecycle/OnChangeAttrRender';
import { OnCreateRenderData, OnCreateRenderDataParams } from '@dooboostore/dom-render/lifecycle/OnCreateRenderData';
import { RawSet } from '@dooboostore/dom-render/rawsets/RawSet';
import { ConstructorType } from '@dooboostore/core/types';
import { OnCreatedThisChild } from '@dooboostore/dom-render/lifecycle/OnCreatedThisChild';
import { DomRenderNoProxy } from '@dooboostore/dom-render/decorators/DomRenderNoProxy';
import { Render } from '@dooboostore/dom-render/rawsets/Render';
import { OnInitRender } from '@dooboostore/dom-render/lifecycle/OnInitRender';
import { ConvertUtils } from '@dooboostore/core/convert/ConvertUtils';
import { OnDestroyRender, OnDestroyRenderParams } from '@dooboostore/dom-render/lifecycle/OnDestroyRender';
import { OnDrThisUnBind } from '@dooboostore/dom-render/lifecycle/dr-this/OnDrThisUnBind';
import { OnDrThisBind } from '@dooboostore/dom-render/lifecycle/dr-this/OnDrThisBind';

export abstract class ComponentBase<T> implements OnChangeAttrRender, OnCreateRenderData, OnCreatedThisChild, OnDrThisBind, OnDrThisUnBind, OnInitRender, OnDestroyRender {
  @DomRenderNoProxy
  private _rawSet?: RawSet;
  @DomRenderNoProxy
  private _attribute?: T;
  @DomRenderNoProxy
  private _children: any[] = [];
  @DomRenderNoProxy
  private _render: Render | undefined;

  get render(): Render | undefined {
    return this._render;
  }

  get rawSet(): RawSet | undefined {
    return this._rawSet;
  }

  get attribute(): T | undefined {
    const handler = {
      get(target: any, prop: string) {
        let p = prop;
        if (p in target) {
          return target[p];
        }
        p = ConvertUtils.snakeToCamelCase(prop);
        if (p in target) {
          return target[p];
        }
        p = ConvertUtils.camelToSnakeCase(prop);
        if (p in target) {
          return target[p];
        }
        p = prop.toUpperCase()
        if (p in target) {
          return target[p];
        }
        p = prop.toLowerCase()
        if (p in target) {
          return target[p];
        }
        return null;
      }
    };
    const obj = new Proxy(this._attribute, handler);
    return obj;
  }

  hasAttribute(name: keyof T) {
    return this.attribute?.[name] !==null;
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

  get children(): any[] {
    return this._children;
  }

  getElement<T extends Element>(): T | undefined {
    return (this.render ?? this.rawSet?.dataSet?.render)?.getElement?.();
  }

  getFirstChild<T>(type: ConstructorType<T>): T | undefined {
    return this._children.find(it => it instanceof type);
  }

  getParentThis<P>():P {
    return this.render?.parentThis as P;
  }


  // 오버로드 1: 단일 생성자 타입을 받는 경우
  getChildren<C extends ConstructorType<any>>(type: C): InstanceType<C>[];

  // 오버로드 2: 생성자 타입의 배열을 받는 경우
  // T는 ConstructorType의 배열 (e.g., [typeof When, typeof Otherwise])
  // T[number]는 배열 요소들의 유니온 타입 (e.g., typeof When | typeof Otherwise)
  // InstanceType<T[number]>는 각 생성자의 인스턴스 타입들의 유니온 (e.g., When | Otherwise)
  getChildren<C extends ConstructorType<any>[]>(types: C): InstanceType<C[number]>[];

  // 구현 시그니처 (오버로드 시그니처보다 더 일반적이어야 함)
  getChildren(typeOrTypes: ConstructorType<any> | ConstructorType<any>[]): any[] {
    const targets = Array.isArray(typeOrTypes) ? typeOrTypes : [typeOrTypes];

    // filter의 결과는 항상 배열이므로 `?? []`는 필요 없습니다.
    // filter가 아무것도 찾지 못하면 빈 배열을 반환합니다.
    return this._children.filter(child =>
      targets.some(targetConstructor => child instanceof targetConstructor)
    );
  }

  // getChildren<T extends ConstructorType<any>[] | ConstructorType<any>>(
  //   type: T
  // ): T extends (infer U)[] ? InstanceType<U>[] : T extends ConstructorType<infer V> ? V[] : never {
  //   const target = Array.isArray(type) ? type : [type];
  //   return this._children.filter(it => target.some(t => it instanceof t)) ?? [];
  // }

  // getChildren<T>(type: ConstructorType<T> | ConstructorType<T>[]): T[] {
  //   const target = Array.isArray(type) ? type : [type];
  //   return this._children.filter(it => target.some(t => it instanceof t)) ?? [];
  // }
  /*
    getChildren<T>(type: ConstructorType<T>): T[] {
    return this._children.filter(it => it instanceof type) ?? [];
  }
   */

  constructor(private config?: { onlyParentType: ConstructorType<any>[] | ConstructorType<any> }) {
  }

  onCreatedThisChild(child: any, data: OnCreateRenderDataParams) {
    this._children.push(child);
    // this._rawSet = data.render?.rawSet;
    // this._attribute = data.render?.attribute as T;
  }

  onCreateRenderData(data: OnCreateRenderDataParams): void {
    this._rawSet = data.render?.rawSet;
    this._attribute = data.render?.attribute as T;
    this._render = data.render;
    if (this.config?.onlyParentType) {
      const isOk = Array.isArray(this.config?.onlyParentType) ? this.config?.onlyParentType : [this.config?.onlyParentType].some(it => data.render?.parentThis instanceof it);
      if (!isOk) {
        throw new Error('only my parentThis ' + this.config?.onlyParentType);
      }
    }
  }

  onChangeAttrRender(name: string, value: any, other: OtherData): void {
    if (other.rawSet) {
      this._rawSet = other.rawSet;
      if (this._rawSet) {
        this._attribute = this._rawSet.dataSet?.render?.attribute as T;
      }
    }
    // this.changeAttribute?.(this._attribute);
  }

  onInitRender(param: any, rawSet: RawSet) {
    if (rawSet) {
      this._rawSet = rawSet;
      if (this._rawSet) {
        this._attribute = rawSet.dataSet?.render?.attribute as T;
      }

      const e = this.getElement()
      if (e) {
        (e as any).component = this;
      //   Object.entries(this.attribute ?? {}).forEach(([key, value]) => {
      //     console.log('--attribute------->1', key, value, (e as any).open, e);
      //       e.removeAttribute(key);
      //     // if (value === null) {
      //     console.log('--attribute------->2', key, value, (e as any).open, e);
      //     // }
      //   });
      }
    }
  }

  onDrThisBind() {
  }

  onDrThisUnBind() {
  }

  onDestroyRender(data: OnDestroyRenderParams): void {
    // console.log('ComponentBase---onDestroyRender----')
  }


  // abstract changeAttribute(attribute: T| undefined): void;
}