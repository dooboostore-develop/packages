import {ReflectUtils, FunctionUtils, ActionExpression} from '@dooboostore/core';
import {ensureInit, getElementConfig} from './elementDefine';
import {SwcUtils} from '../utils/Utils';
import {SpecialSelector, SwcQueryOptions} from '../types';
import { ConvertUtils } from '@dooboostore/core-web';
export interface AttributeFieldOptions extends SwcQueryOptions {
  name?: string;
  // connectedInitialize?: boolean;
  type?: typeof Number | typeof Boolean | typeof String;
}

export interface AttributeFieldMetadata {
  propertyKey: string | symbol;
  selector: string;
  options: AttributeFieldOptions;
  privateKey: symbol;
}

export const ATTRIBUTE_FIELD_METADATA_KEY = Symbol.for('simple-web-component:attribute-field');

const convertValue = (val: string | null, type: any): any => {
  if (val === null || val === undefined) return val;
  if (type === Number) return Number(val);
  if (type === Boolean) return val === 'false' || val === '0' ? false : true;
  return val;
};

export const resolveTargetEls = (inst: any, selector: string, options: AttributeFieldOptions, currentWin: any): HTMLElement[] => {
  const r = options.root || 'auto';
  const results: HTMLElement[] = [];

  const applyRoot = (target: any) => {
    if (!target) return;
    if (r === 'auto') {
      results.push(target);
    } else {
      if (r === 'light' || r === 'all') results.push(target);
      if ((r === 'shadow' || r === 'all') && target.shadowRoot) results.push(target.shadowRoot);
    }
  };

  if (selector === ':host' || !selector) {
    applyRoot(inst);
  } else if (selector === ':window') {
    results.push(currentWin);
  } else if (selector === ':document') {
    results.push(currentWin.document);
  } else {
    const hostSet = SwcUtils.getHostSet(inst);
    if (selector === ':parentHost') applyRoot(hostSet.$parentHost);
    else if (selector === ':appHost') applyRoot(hostSet.$appHost as any);
    else if (selector === ':firstHost') applyRoot(hostSet.$firstHost);
    else if (selector === ':lastHost') applyRoot(hostSet.$lastHost);
    else if (selector === ':firstAppHost') applyRoot(hostSet.$firstAppHost as any);
    else if (selector === ':lastAppHost') applyRoot(hostSet.$lastAppHost as any);
    else {
      if (r === 'shadow') {
        const found = inst.shadowRoot?.querySelectorAll(selector);
        if (found) results.push(...found);
      } else if (r === 'light') {
        const found = inst.querySelectorAll(selector);
        if (found) results.push(...found);
      } else if (r === 'all') {
        const sMatch = inst.shadowRoot?.querySelectorAll(selector);
        const lMatch = inst.querySelectorAll(selector);
        if (sMatch) results.push(...sMatch);
        if (lMatch) results.push(...lMatch);
      } else {
        const found = (inst.shadowRoot || inst).querySelectorAll(selector);
        if (found) results.push(...found);
      }
    }
  }
  return results;
};

/**
 * @attribute decorator to sync a field value with an element's attribute.
 */
export function attribute(selector: string, options: AttributeFieldOptions = {}): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor;
    const privateKey = Symbol(String(propertyKey));
    //
    const designType = (Reflect as any).getMetadata('design:type', target, propertyKey);
    //
    let metaList = ReflectUtils.getOwnMetadata(ATTRIBUTE_FIELD_METADATA_KEY, constructor) as AttributeFieldMetadata[];
    if (!metaList) {
      metaList = [];
      ReflectUtils.defineMetadata(ATTRIBUTE_FIELD_METADATA_KEY, metaList, constructor);
    }
    metaList.push({propertyKey, selector, options, privateKey});

    const applySetAttribute = (inst: any, targets: HTMLElement[], attrName: string, nv: any) => {
      targets.forEach(it => {
        // console.log('sssssssssssss', it, attrName, nv);
        if (it && typeof (it as any).setAttribute === 'function') {
          if (nv === null) {
            (it as any).removeAttribute(attrName);
          } else {
            (it as any).setAttribute(attrName, String(nv));
          }
        } else {
          inst[privateKey] = nv;
        }
      });
    };

    try {
      // Own property를 삭제하여 getter가 작동하도록 함
      // delete target[propertyKey];

      // const defineTarget = target instanceof Function ? target : (target as any).constructor;
      
      Object.defineProperty(target, propertyKey, {
        get(this: any) {
          const attrName = options.name || String(propertyKey);
          const conf = getElementConfig(this);
          const currentWin = this._resolveWindow?.(conf) || ((typeof window !== 'undefined' ? window : undefined) as any);
          const targetType = options.type || designType;

          const targets = resolveTargetEls(this, selector, options, currentWin);
          const primaryTarget = targets[0];

          if (primaryTarget && typeof (primaryTarget as any).hasAttribute === 'function') {
            if ((primaryTarget as any).hasAttribute(attrName)) {
              let domVal = (primaryTarget as any).getAttribute(attrName);
              
              // 표현식 체크
              const ae = new ActionExpression(domVal);
              const expr = ae.getFirstExpression('call-return');
              if (expr) {
                try {
                  const result = FunctionUtils.executeReturn({
                    script: ConvertUtils.decodeHtmlEntity(expr.script, currentWin.document),
                    context: this,
                    args: SwcUtils.getHelperAndHostSet(currentWin, this)
                  });
                  return convertValue(result, targetType);
                } catch (e) {
                  console.error(`[SWC] Failed to execute directive {{= ${expr.script} }}:`, e);
                  return convertValue(domVal, targetType);
                }
              }
              
              return convertValue(domVal, targetType);
            }
            return null;
          }

          const data = convertValue(this[privateKey], targetType);
          return data;
        },
        set(this: any, nv: any) {
          // this[propertyKey] = nv;
          // console.log('------>??settttt', this, nv, propertyKey);
          const attrName = options.name || String(propertyKey);
          const conf = getElementConfig(this);
          const currentWin = this._resolveWindow?.(conf) || ((typeof window !== 'undefined' ? window : undefined) as any);


          // if (!this.__swc_connected) {
          //   this[privateKey] = nv;
          //   return;
          // }

          const targets = resolveTargetEls(this, selector, options, currentWin);
          applySetAttribute(this, targets, attrName, nv);
        },
        enumerable: true,
        configurable: true
      });
  } catch (err) {
    console.error('[SWC] defineProperty error:', err);
  }
  };
}

/**
 * @attributeHost decorator to sync a field value with the :host element's attribute.
 */
export function attributeHost(target: Object, propertyKey: string | symbol): void;
export function attributeHost(options: AttributeFieldOptions): PropertyDecorator;
export function attributeHost(attrName: string): PropertyDecorator;
export function attributeHost(attrName: string, options: AttributeFieldOptions): PropertyDecorator;
export function attributeHost(targetOrAttrOrOptions?: any, propertyKeyOrOptions?: any): any {
  if (propertyKeyOrOptions !== undefined && (typeof propertyKeyOrOptions === 'string' || typeof propertyKeyOrOptions === 'symbol')) {
    return attribute(':host', { name: String(propertyKeyOrOptions) })(targetOrAttrOrOptions, propertyKeyOrOptions);
  }

  if (typeof targetOrAttrOrOptions === 'string') {
    const attrName = targetOrAttrOrOptions;
    const options = (typeof propertyKeyOrOptions === 'object' ? propertyKeyOrOptions : {}) as AttributeFieldOptions;
    return attribute(':host', { ...options, name: attrName });
  } else if (typeof targetOrAttrOrOptions === 'object') {
    const options = targetOrAttrOrOptions as AttributeFieldOptions;
    return (target: Object, propertyKey: string | symbol) => {
      return attribute(':host', { ...options, name: String(propertyKey) })(target, propertyKey);
    };
  } else {
    return (target: Object, propertyKey: string | symbol) => {
      return attribute(':host', { name: String(propertyKey) })(target, propertyKey);
    };
  }
}

export const findAllAttributeMetadata = (target: any): AttributeFieldMetadata[] => {
  const actualTarget = target instanceof Function ? target : target.constructor;
  return ReflectUtils.findAllMetadata<AttributeFieldMetadata[]>(ATTRIBUTE_FIELD_METADATA_KEY, actualTarget).flat();
};
