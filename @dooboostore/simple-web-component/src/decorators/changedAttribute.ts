import { ReflectUtils } from '@dooboostore/core';

export const ON_ATTRIBUTE_CHANGED_METADATA_KEY = Symbol.for('simple-web-component:on-attribute-changed');

export interface ChangedAttributeThisOptions  {
  type?: typeof Number | typeof Boolean | typeof String;
  while?: 'connected';
  /** 속성 변경 시 핸들러 실행 여부 게이트. Promise<boolean>도 되어 async 판정 가능. false면 스킵. */
  filter?: (value: any, meta: { currentThis: any; helper: HelperHostSet }) => boolean | Promise<boolean>;
  /** filter 통과 후 핸들러 직전 훅. await되고, 리턴값은 @changedAttributeBeforeReturn 으로 핸들러에 주입된다. */
  before?: (value: any, meta: { currentThis: any; helper: HelperHostSet }) => any | Promise<any>;
  /** 핸들러가 성공/실패해도 항상 실행되는 정리 훅. ctx로 인자/결과/에러를 받는다. 에러는 로깅됨. */
  finally?: (value: any, meta: { currentThis: any; helper: HelperHostSet }, ctx: { args: any[]; result?: any; error?: any }) => any | Promise<any>;
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

const applyChangedAttribute = (attributeName: string | undefined, options: ChangedAttributeThisOptions, target: Object, propertyKey: string | symbol): void => {
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

export function changedAttribute(attributeName?: string, options?: ChangedAttributeThisOptions): MethodDecorator;
export function changedAttribute(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
/**
 * @changedAttributeThis decorator - fires when any attribute on $this changes.
 * 옵션 없이 `@changedAttribute` 그대로 붙여도 되고, `@changedAttribute(...)`처럼 이름/옵션을 줄 수도 있다.
 */
export function changedAttribute(attributeNameOrTarget?: string | Object, optionsOrPropertyKey?: ChangedAttributeThisOptions | string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | void {
  if ((typeof optionsOrPropertyKey === 'string' || typeof optionsOrPropertyKey === 'symbol') && descriptor !== undefined) {
    // 옵션 없이: @changedAttribute
    applyChangedAttribute(undefined, {}, attributeNameOrTarget as Object, optionsOrPropertyKey);
    return;
  }
  // 옵션과 함께: @changedAttribute() / @changedAttribute('name', options?)
  const attributeName = attributeNameOrTarget as string | undefined;
  const options = (optionsOrPropertyKey as ChangedAttributeThisOptions) ?? {};
  return (target: Object, propertyKey: string | symbol) => {
    applyChangedAttribute(attributeName, options, target, propertyKey);
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
import { SwcUtils } from '../utils/Utils';
import { buildSwcParameterArgs } from './parameter';

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
          if (val !== null) this.runChanged(helperHostSet, meta, val, null, name);
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
      this.runChanged(helperHostSet, meta, convertAttributeValue(newVal, meta.options.type), old, name);
    }
  }

  // filter(async)/before/finally + @changedAttributeBeforeReturn 주입. fire-and-forget.
  private runChanged(helperHostSet: HelperHostSet, meta: ChangedAttributeThisMetadata, value: any, old: string | null, name: string): void {
    const inst = helperHostSet.$this;
    const opts = meta.options;
    void (async () => {
      const helper = SwcUtils.getHelperAndHostSet(helperHostSet.$w, inst);
      if (opts.filter && !(await opts.filter(value, { currentThis: inst, helper }))) return;
      const hostSet = SwcUtils.getHostSet(inst);
      const helperSet = SwcUtils.getHelperSet(helperHostSet.$w);
      const legacyArgs = [value, old, name, helper];
      const buildArgs = (beforeReturn: any) => buildSwcParameterArgs(inst, meta.propertyKey, {
        hostSet, helperHostSet: helper, helperSet, changedAttributeBeforeReturn: beforeReturn
      }, [...legacyArgs, beforeReturn]);
      let args = buildArgs(undefined);
      if (opts.before) { const br = await opts.before(value, { currentThis: inst, helper }); args = buildArgs(br); }
      let result: any, error: any;
      try { result = await inst[meta.propertyKey](...args); }
      catch (e) { error = e; }
      finally { if (opts.finally) await opts.finally(value, { currentThis: inst, helper }, { args, result, error }); }
      if (error) throw error;
    })().catch(e => console.error('[SWC] changedAttribute handler error:', e));
  }
}
