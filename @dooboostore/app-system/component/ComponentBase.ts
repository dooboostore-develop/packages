import { OnChangeAttrRender, OtherData } from '@dooboostore/dom-render/lifecycle/OnChangeAttrRender';
import { OnCreateRenderData, OnCreateRenderDataParams } from '@dooboostore/dom-render/lifecycle/OnCreateRenderData';
import { RawSet } from '@dooboostore/dom-render/rawsets/RawSet';
import { ConstructorType } from '@dooboostore/core/types';
import { OnCreatedThisChild } from '@dooboostore/dom-render/lifecycle/OnCreatedThisChild';
import { DomRenderNoProxy } from '@dooboostore/dom-render/decorators/DomRenderNoProxy';
import { Render } from '@dooboostore/dom-render/rawsets/Render';
import { OnInitRender } from '@dooboostore/dom-render/lifecycle/OnInitRender';

export abstract class ComponentBase<T> implements OnChangeAttrRender, OnCreateRenderData, OnCreatedThisChild, OnInitRender {
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
    return this._attribute;
  }

  get uuid(): string | undefined {
    return this._rawSet?.uuid;
  }

  get children(): any[] {
    return this._children;
  }

  getElement<T extends Element>(): T | undefined {
    return (this.render ?? this.rawSet?.dataSet.render)?.getElement?.();
  }

  getFirstChild<T>(type: ConstructorType<T>): T | undefined {
    return this._children.find(it => it instanceof type);
  }

  getChildren<T>(type: ConstructorType<T>): T[] {
    return this._children.filter(it => it instanceof type) ?? [];
  }

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
      this._attribute = (other.rawSet as RawSet).dataSet.render?.attribute as T;
    }
    // this.changeAttribute?.(this._attribute);
  }

  onInitRender(param: any, rawSet: RawSet) {
    if (rawSet) {
      this._rawSet = rawSet;
      this._attribute = rawSet.dataSet.render?.attribute as T;

      // const e = this.getElement()
      // if (e) {
      //   Object.entries(this.attribute ?? {}).forEach(([key, value]) => {
      //     console.log('--attribute------->1', key, value, (e as any).open, e);
      //       e.removeAttribute(key);
      //     // if (value === null) {
      //     console.log('--attribute------->2', key, value, (e as any).open, e);
      //     // }
      //   });
      // }
    }
  }

  // abstract changeAttribute(attribute: T| undefined): void;
}