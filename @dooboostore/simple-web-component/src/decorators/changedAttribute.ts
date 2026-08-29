import { ReflectUtils } from '@dooboostore/core';

export const ON_ATTRIBUTE_CHANGED_METADATA_KEY = Symbol.for('simple-web-component:on-attribute-changed');

export interface ChangedAttributeThisOptions  {
  type?: typeof Number | typeof Boolean | typeof String;
  while?: 'connected';
}

export interface ChangedAttributeThisMetadata {
  attributeName: string;
  propertyKey: string | symbol;
  options: ChangedAttributeThisOptions;
}

const convertValue = (val: any, type: any): any => {
  if (val === null || val === undefined) return val;
  if (type === Number) return Number(val);
  if (type === Boolean) return val === 'false' || val === '0' ? false : true;
  return val;
};

/**
 * @changedAttributeThis decorator - fires when any attribute on $this changes
 */
export function changedAttribute(attributeName?: string, options: ChangedAttributeThisOptions = {}): MethodDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor;
    let metaList = ReflectUtils.getOwnMetadata(ON_ATTRIBUTE_CHANGED_METADATA_KEY, constructor) as ChangedAttributeThisMetadata[];
    if (!metaList) {
      metaList = [];
      ReflectUtils.defineMetadata(ON_ATTRIBUTE_CHANGED_METADATA_KEY, metaList, constructor);
    }

    const name = attributeName || String(propertyKey);
    metaList.push({
      attributeName: name,
      propertyKey,
      options
    });
  };
}

export const getChangedAttributeMetadata = (target: any): ChangedAttributeThisMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(ON_ATTRIBUTE_CHANGED_METADATA_KEY, constructor);
};

export const findAllAttributeChangedMetadata = (target: any): Map<string, ChangedAttributeThisMetadata[]> => {
  const constructor = target instanceof Function ? target : target.constructor;
  const metaList = ReflectUtils.findAllMetadata<ChangedAttributeThisMetadata[]>(ON_ATTRIBUTE_CHANGED_METADATA_KEY, constructor) || [];

  const result = new Map<string, ChangedAttributeThisMetadata[]>();
  metaList.forEach(meta => {
    meta.forEach(item => {
      if (!result.has(item.attributeName)) {
        result.set(item.attributeName, []);
      }
      result.get(item.attributeName)!.push(item);
    });
  });
  return result;
};

export const convertAttributeValue = (val: any, type?: typeof Number | typeof Boolean | typeof String): any => {
  return convertValue(val, type);
};

// ─────────────────────────────────────────────────────────────────────────────
// ChangedAttributeLifeCycler
// ─────────────────────────────────────────────────────────────────────────────
import { ElementDefineLifeCycler, HelperHostSet } from '../types';
import { getAttributeValue } from './applyAttribute';

export class ChangedAttributeLifeCycler implements ElementDefineLifeCycler {
  private attrChangeMap: Map<string, ChangedAttributeThisMetadata[]> | null = null;

  /** 클래스 메타데이터 기반 attrChangeMap 을 lazy 로드한다 (공유 시클러 캐시). */
  private getAttrChangeMap(inst: any): Map<string, ChangedAttributeThisMetadata[]> {
    if (!this.attrChangeMap) this.attrChangeMap = findAllAttributeChangedMetadata(inst);
    return this.attrChangeMap;
  }

  /** observedAttributes 에 포함할 attribute 이름 목록 */
  getObservedAttributeNames(inst: any): string[] {
    return Array.from(this.getAttrChangeMap(inst).keys());
  }

  onConnected(helperHostSet: HelperHostSet): void {
    const inst = helperHostSet.$this;

    // while:'connected' 옵션 — connected 시점 현재 값으로 초기 실행
    for (const [name, metaList] of this.getAttrChangeMap(inst)) {
      for (const meta of metaList) {
        if (meta.options.while === 'connected') {
          const val = getAttributeValue(inst, name, { type: meta.options.type });
          if (val !== null) inst[meta.propertyKey](val, null, name, helperHostSet);
        }
      }
    }
  }

  /** attributeChangedCallback 에서 elementDefine 이 직접 호출 */
  onAttributeChanged(helperHostSet: HelperHostSet, name: string, old: string | null, newVal: any): void {
    const inst = helperHostSet.$this;
    const metaList = this.getAttrChangeMap(inst).get(name);
    if (!metaList) return;
    for (const meta of metaList) {
      if (meta.options.while === 'connected' && !inst.__swc_connected) continue;
      inst[meta.propertyKey](convertAttributeValue(newVal, meta.options.type), old, name, helperHostSet);
    }
  }
}
