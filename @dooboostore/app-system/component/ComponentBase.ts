import { OnChangeAttrRender, OtherData } from '@dooboostore/dom-render/lifecycle/OnChangeAttrRender';
import { OnCreateRenderData, OnCreateRenderDataParams } from '@dooboostore/dom-render/lifecycle/OnCreateRenderData';
import { RawSet } from '@dooboostore/dom-render/rawsets/RawSet';
import { ConstructorType } from '@dooboostore/core/types';
import { OnCreatedThisChild } from '@dooboostore/dom-render/lifecycle/OnCreatedThisChild';
import { DomRenderNoProxy } from '@dooboostore/dom-render/decorators/DomRenderNoProxy';

export abstract class ComponentBase<T> implements OnChangeAttrRender, OnCreateRenderData, OnCreatedThisChild  {
  @DomRenderNoProxy
  private _rawSet?: RawSet;
  @DomRenderNoProxy
  private _attribute?: T;
  @DomRenderNoProxy
  private _children: any[] = [];

  get rawSet(): RawSet | undefined {
    return this._rawSet;
  }
  get attribute(): T | undefined {
    return this._attribute;
  }
  get uuid(): string | undefined{
    return this._rawSet?.uuid;
  }
  get children(): any[] {
    return this._children;
  }

  getFirstChild<T>(type: ConstructorType<T>): T | undefined {
    return this._children.find(it => it instanceof type);
  }

  getChildren<T>(type: ConstructorType<T>): T[] {
    return this._children.filter(it => it instanceof type) ?? [];
  }

  constructor(private config?:{onlyParentType: ConstructorType<any>[] | ConstructorType<any>}) {
  }

  onCreatedThisChild(child: any, data: OnCreateRenderDataParams) {
    this._children.push(child);
    // this._rawSet = data.render?.rawSet;
    // this._attribute = data.render?.attribute as T;
  }

  onCreateRenderData(data: OnCreateRenderDataParams): void {
    this._rawSet = data.render?.rawSet;
    this._attribute = data.render?.attribute as T;
    if (this.config?.onlyParentType) {
      const isOk = Array.isArray(this.config?.onlyParentType) ? this.config?.onlyParentType : [this.config?.onlyParentType].some(it => data.render?.parentThis instanceof it);
      if (!isOk) {
        throw new Error('only my parentThis ' + this.config?.onlyParentType);
      }
    }
  }

  onChangeAttrRender(name: string, val: any, other: OtherData): void {
    this._rawSet = other.rawSet;
    this._attribute = (other.rawSet as RawSet).dataSet.render?.attribute as T;
    // this.changeAttribute?.(this._attribute);
  }

  // abstract changeAttribute(attribute: T| undefined): void;
}