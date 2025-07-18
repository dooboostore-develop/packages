import 'reflect-metadata';
import { RawSet } from './rawsets/RawSet';
import { EventManager, eventManager } from './events/EventManager';
import { Config } from './configs/Config';
import { ScriptUtils } from '@dooboostore/core-web/script/ScriptUtils';
import { DomRenderFinalProxy, Shield } from './types/Types';
import { RawSetType } from './rawsets/RawSetType';
import { DrThisProperty } from './operators/DrThisProperty';
import { RawSetOperatorType } from './rawsets/RawSetOperatorType';
import { ComponentSet } from './components/ComponentSet';
import { DomRenderNoProxyKey } from './decorators/DomRenderNoProxy';
import { isOnCreateRender } from './lifecycle/OnCreateRender';
import { isOnInitRender } from './lifecycle/OnInitRender';
import { isOnCreateRenderData } from './lifecycle/OnCreateRenderData';
import { isOnChangeAttrRender } from './lifecycle/OnChangeAttrRender';
import { DocumentUtils } from '@dooboostore/core-web/document/DocumentUtils';
import { isDefined } from '@dooboostore/core/types';
import { isOnBeforeReturnSet } from './lifecycle/OnBeforeReturnSet';
import { isOnChildRenderedByProperty } from './lifecycle/OnChildRenderedByProperty';

const excludeGetSetPropertys = ['onBeforeReturnGet', 'onBeforeReturnSet', '__domrender_components', '__render', '_DomRender_isFinal', '_domRender_ref', '_rawSets', '_domRender_proxy', '_targets', '_DomRender_origin', '_DomRender_ref', '_DomRender_proxy'];

export class DomRenderProxy<T extends object> implements ProxyHandler<T> {
  public _domRender_ref = new Map<object, Set<string>>();
  public _rawSets = new Map<string, Set<RawSet>>();
  public _domRender_proxy?: T;
  public _targets = new Set<Node>();

  constructor(public _domRender_origin: T, target: Node | null | undefined, public config: Config) {
    if (target) {
      this._targets.add(target);
    }
  }

  public static unFinal<T = any>(obj: T): T {
    return DomRenderFinalProxy.unFinal(obj);
  }

  public static final<T = any>(obj: T): T {
    return DomRenderFinalProxy.final(obj);
  }

  public static isFinal<T = any>(obj: T) {
    return DomRenderFinalProxy.isFinal(obj);
  }

  public run(objProxy: T) {
    this._domRender_proxy = objProxy;
    (objProxy as any)?.onProxyDomRender?.(this.config);
    const obj = (objProxy as any)._DomRender_origin;
    if (obj) {
      Object.keys(obj).forEach(it => {
        // Reflect 메타데이터에서 domRender:NoProxy 여부 확인
        try {
          const isNoProxy = Reflect.getMetadata(DomRenderNoProxyKey, obj, it) || Reflect.getMetadata(DomRenderNoProxyKey, Object.getPrototypeOf(obj).constructor);
          if (isNoProxy) {
            return obj;
          }
        } catch (e) {
        }
        const target = (obj as any)[it];
        if (target !== undefined && target !== null && typeof target === 'object' && !DomRenderProxy.isFinal(target) && !Object.isFrozen(target) && !(obj instanceof Shield)) {
          const filter = this.config.proxyExcludeTyps?.filter(it => target instanceof it) ?? [];
          if (filter.length === 0) {
            const proxyAfter = this.proxy(objProxy, target, it);
            (obj as any)[it] = proxyAfter;
          }
        }
      });
    }
    // console.log('target', this._targets);
    this._targets.forEach(target => {
      this.initRender(target);
    });
  }

  public initRender(target: Node) {

    // if (target instanceof Element) {
    //   target.setAttribute('dr-this', 'this');
    //   const rawSets = RawSet.checkPointCreates(target, this._domRender_proxy, this.config);
    //   this.render(rawSets)
    //   return;
    // }
    //
    if (target instanceof Element) {
      // 중요: 나를통해 이어진곳의 위치를 남겨야된다 안그러면 TargetElement는 알수 있는 방법이 없다. 여기서 흔적을 남겨줘야 한다.
      // const targetElementNames = (this.config.targetElements?.map(it => it.name.toLowerCase().replaceAll('.', '\\.')) ?? []).join(',');
      // Array.from(target.querySelectorAll(targetElementNames)).forEach(it => it.setAttribute(EventManager.parentVariablePathAttrName, '@this@'));
      target.innerHTML = target.innerHTML.replace(/@this@/g, 'this');
    }
    // TODO: 한곳에서 처리 필요할듯.. 너무 산발적으로 있음.
    const onCreate = (target as any).getAttribute?.(RawSet.DR_ON_CREATE_ARGUMENTS_OPTIONNAME);
    let createParam: any[] = [];
    if (onCreate) {
      createParam = ScriptUtils.evalReturn(onCreate, this._domRender_proxy);
      if (!Array.isArray(createParam)) {
        createParam = [createParam];
      }
    }

    if (isOnCreateRenderData(this._domRender_proxy)) {
      this._domRender_proxy?.onCreateRenderData({ rootParent: this._domRender_proxy });
    }

    if (isOnCreateRender(this._domRender_proxy)) {
      this._domRender_proxy.onCreateRender(...createParam);
    }

    // const innerHTML = (target as any).innerHTML ?? '';
    this._targets.add(target);
    const rawSets = RawSet.checkPointCreates(target, this._domRender_proxy, this.config);
    // console.log('initRender -------rawSet', rawSets)
    // 중요 초기에 한번 튕겨줘야함.
    eventManager.applyEvent(this._domRender_proxy, eventManager.findAttrElements(target as Element, this.config), this.config);
    rawSets.forEach(it => {
      const variables = it.getUsingTriggerVariables(this.config);
      if (variables.size <= 0) {
        this.addRawSet('', it);
      } else {
        variables.forEach(sit => {
          this.addRawSet(sit, it);
        });
      }
    });
    // console.log('1111111111111', this.getRawSets());
    this.render(this.getRawSets()).then(it => {
      // const render = {target} as Render;
      // const creatorMetaData = {
      //     creator: this._domRender_proxy,
      //     rootCreator: this._domRender_proxy,
      //     innerHTML
      // } as CreatorMetaData;
      const onInit = (target as any).getAttribute?.(RawSet.DR_ON_INIT_ARGUMENTS_OPTIONNAME);
      let initParam: any;
      if (onCreate) {
        initParam = ScriptUtils.evalReturn(onCreate, this._domRender_proxy);
        // if (!Array.isArray(initParam)) {
        //   initParam = [initParam];
        // }
      }
      if (isOnInitRender(this._domRender_proxy)) {
        this._domRender_proxy.onInitRender(initParam, {} as any);
      }
    });

  }

  public getRawSets() {
    const set = new Set<RawSet>();
    this._rawSets.forEach((v, k) => {
      v.forEach(it => set.add(it));
    });
    return Array.from(set);
  }

  // 중요 important
  public async render(raws?: RawSet[] | string, fullPathStr?: string) {
    if (typeof raws === 'string') {
      const iter = this._rawSets.get(raws);
      if (iter) {
        raws = Array.from(iter);
      } else {
        raws = undefined;
      }
    }
    const removeRawSets: RawSet[] = [];
    const rawSets = raws ?? this.getRawSets();

    // console.log('----', rawSets);
    for (const it of rawSets as RawSet[]) {
      it.getUsingTriggerVariables(this.config).forEach(path => {
        // console.log('getUsingTriggerVariables->', path);
        this.addRawSet(path, it);
      });
      if (it.isConnected) {
        // 중요 render될때 targetAttribute 체크 해야함.
        const targetAttrMap = (it.point.node as Element)?.getAttribute?.(EventManager.normalAttrMapAttrName);
        // console.log('sssssssssSSS?',it, targetAttrMap)
        // console.log('----2', it, fullPathStr, targetAttrMap, (it.fragment as any).render, it.isConnected, this.getRawSets());
        if (it.detect?.action) {
          it.detect.action();
          // } else if (it.type === RawSetType.TARGET_ELEMENT && it.data && fullPathStr && targetAttrMap && (it.fragment as any).render) {
        } else if (it.type === RawSetType.TARGET_ELEMENT && it.dataSet?.render?.currentThis && fullPathStr && targetAttrMap) {
          new Map<string, string>(JSON.parse(targetAttrMap)).forEach((v, k) => {
            // it?.data.onChangeAttrRender(k, null, v);
            const isUsing = EventManager.isUsingThisVar(v, `this.${fullPathStr}`);
            if (isUsing) {
              const targetAttrObject = RawSet.getAttributeObject((it.point.node as Element), { script: it.dataSet?.render?.renderScript ?? '', obj: Object.assign(this._domRender_proxy, { __render: it.dataSet?.render }) });
              it.dataSet.render??={};
              it.dataSet.render.attribute = targetAttrObject;
              // const render = it.dataSet?.render;
              // console.log('render-->!!!!!', it.dataSet.render);
              // const script = `${render.renderScript} return ${v} `;
              // const cval = ScriptUtils.eval(script, Object.assign(this._domRender_proxy ?? {}, { __render: render }));
              if (isOnChangeAttrRender(it.dataSet?.render?.currentThis)) {
                it.dataSet?.render?.currentThis?.onChangeAttrRender?.(k, targetAttrObject[k], { rawSet: it });
              }
            }
            // console.log('---?', v, fullPathStr, isUsing);
          });
          // ------------------->
        } else {
          const rawSets = await it.render(this._domRender_proxy, this.config);
          // 그외 자식들 render
          if (rawSets && rawSets.length > 0) {
            await this.render(rawSets);
          }
        }
      } else {
        removeRawSets.push(it);
      }
    }

    if (removeRawSets.length > 0) {
      this.removeRawSet(...removeRawSets);
    }
    return this.getRawSets();
  }

  // domrender_ref로 찾는걸로 바꿈
    // public findRootDomRenderProxy(): DomRenderProxy<any> {
    //   let current:DomRenderProxy<any>  = this;
    //   while (current.parentProxy) {
    //     current = current.parentProxy;
    //   }
    //   return current;
    // }

  public root(pathInfos: {path: string, obj: any}[][], value?: any, lastDoneExecute = true): {path: string, obj:any}[][] {
    // console.log('root--->', paths, value, this._domRender_ref, this._domRender_origin);
    const fullPaths: {path: string, obj:any}[][] = [];
    if (this._domRender_ref.size > 0) {
      this._domRender_ref.forEach((it, key) => {
        if ('_DomRender_isProxy' in key) {
          it.forEach(sit => {
            try {

              const concat = pathInfos.concat([[{path: sit, obj: key}]]);
              const items:{path: string, obj:any}[][] = (key as any)._DomRender_proxy?.root(concat, value, lastDoneExecute);

              fullPaths.push(items.flat());
              // fullPaths.push({path: items.map(it=>it.path).join(','), obj: this._domRender_proxy});
              // fullPaths.push({path: items.map(it=>it.path).join(','), obj: this._domRender_proxy});
            } catch (e) {
              // 오브젝트들 없어졌을수도있다 Destroy시점에서 오류나는경우가 있다. 따라서 참조 하는부분 없어져야한다.
              // console.error(e)
              // it.delete(sit);
            }
          });
        }
      });
    } else {
      // const firstPathStr = paths.slice(1).reverse().join('.');
      const strings = pathInfos.reverse().map(it=>it.map(it=>it.path).join(','));
      // array같은경우도 키값으로 접근하기때문에 특정 인덱스를 찾아서 그부분만 바꿔줄수 있다.
      const fullPathStr = strings.map(it => isNaN(Number(it)) ? '.' + it : `[${it}]`).join('').slice(1);
      // console.log('-------fullPathStr', fullPathStr, lastDoneExecute);
      if (lastDoneExecute) {
        // const firstData = ScriptUtils.evalReturn('this.' + firstPathStr, this._domRender_proxy);
        // console.log('-------', firstPathStr, firstData);
        // if (firstData instanceof Dictionary) {
        // }
        const iterable = this._rawSets.get(fullPathStr);
        // array check
        const front = strings.slice(0, strings.length - 1).map(it => isNaN(Number(it)) ? '.' + it : `[${it}]`).join('');
        const lastPropertyName = strings[strings.length - 1];
        const path = 'this' + front;
        const data = ScriptUtils.evalReturn(path, this._domRender_proxy);
        // console.log('root-->', this._rawSets, path, data );
        // console.log('--!!!!', fullPathStr, iterable, data, front, last);
        // 왜여기서 promise를 했을까를 생각해보면......훔.. 변수변경과 화면 뿌려주는걸 동기로하면 성능이 안나오고 비현실적이다.  그래서 promise
        new Promise<RawSet[]>(async resolve => {
          let rData: RawSet[] = [];
          const firstPathStr = front.slice(1);

          // check dictionary
          // console.log('-promise-------', firstPathStr, this)
          const firstTargets = this._rawSets.get(firstPathStr);
          const firstTargetDictionary: RawSet[] = [];
          firstTargets?.forEach(it => {
            // console.log('----forEach---', it);
            const type = (it.point.start as Element).getAttribute?.('type');
            if (type === RawSetOperatorType.DR_THIS_PROPERTY) {
              firstTargetDictionary.push(it);
            }
          });
          if (firstTargetDictionary.length > 0) {
            // console.log('ddddddddddd', firstTargetDictionary);
            const rawSets: RawSet[] = [];
            let skip = false;
            firstTargetDictionary.forEach(it => {
              const startElement = it.point.start as Element;
              const keys = startElement.getAttribute(RawSet.DR_HAS_KEYS_OPTIONNAME)?.split(',') ?? [];
              if (value === undefined) {
                const rawSet = it.getHasRawSet(lastPropertyName);
                rawSet?.remove();
                startElement.setAttribute(RawSet.DR_HAS_KEYS_OPTIONNAME, keys.filter(it => it !== lastPropertyName).join(','));
              }
              if (!keys.includes(lastPropertyName)) {
                const raws = DrThisProperty.append(this._domRender_proxy, fullPathStr, lastPropertyName, it, this.config);
                if (raws) {
                  rawSets.push(...raws);
                }
              } else {
                skip = true;
              }
            });
            if (skip === false || rawSets.length > 0) {
             rData = await this.render(rawSets);
            }
          }

          if (lastPropertyName === 'length' && Array.isArray(data)) {
            const aIterable = this._rawSets.get(firstPathStr);
            if (aIterable) {
              rData = await this.render(Array.from(aIterable));
            }
          } else if (iterable) {
            rData = await this.render(Array.from(iterable), fullPathStr);
          }



          // console.log('-----------', this, lastPropertyName );
          // this._targets.forEach(it => {
          //   // return;
          //   if (it.nodeType === Node.DOCUMENT_FRAGMENT_NODE || it.nodeType === Node.ELEMENT_NODE) {
          //     const targets = eventManager.findAttrElements((it as DocumentFragment | Element), this.config);
          //     eventManager.changeVar(this._domRender_proxy, targets, `this.${fullPathStr}`, this.config);
          //   }
          // });


          this._targets.forEach(it => {
            // return;
            if (it.nodeType === Node.DOCUMENT_FRAGMENT_NODE || it.nodeType === Node.ELEMENT_NODE) {
              const targets = eventManager.findAttrElements((it as DocumentFragment | Element), this.config);
              eventManager.changeVar(this._domRender_proxy, targets, `this.${fullPathStr}`, this.config);
            }
          });

          //랜더대상된게있으면
          if(rData?.length > 0 && isOnChildRenderedByProperty(data)) {
            const propertyValue = ScriptUtils.evalReturn(`this.${lastPropertyName}`, data)
            data.onChildRenderedByProperty(lastPropertyName, propertyValue);
            // data
          }
          resolve(rData);
        }).then(it => {
          // console.log('DonrenderProxy root RenderDone')
        });
      }
      fullPaths.push([{path:fullPathStr, obj: this._domRender_proxy}]);
    }

    // console.log('dddddd', fullPaths.flatMap(it=>it).map(it=>it.path))
    return fullPaths;
  }

  public set(target: T, p: string | symbol, value: any, receiver: T): boolean {
    // console.log('set------->', target, p, value, receiver, Date.now())
    // console.log('set------->', target, p, value, receiver, Date.now())
    // try {
    //   const isNoProxy = Reflect.getMetadata(DomRenderNoProxyKey, target, p) || Reflect.getMetadata(DomRenderNoProxyKey, Object.getPrototypeOf(obj).constructor);
    //   if (isNoProxy) {
    //     return obj;
    //   }
    // }catch (e) {}

    // console.log('set-->', p, value, target, receiver, Reflect.getMetadata(DomRenderNoProxyKey, target, p) );

    if (
      (typeof p === 'string' && p !== '__domrender_components' && excludeGetSetPropertys.includes(p)) ||
      Reflect.getMetadata(DomRenderNoProxyKey, target, p)
    ) {
      (target as any)[p] = value;
      return true;
    }
    // const old =  (target as any)[p];
    // console.log('set proxy-->', target, p, value, this._rawSets, this._domRender_ref);
    // if (typeof p === 'string' && '__render' === p) {
    //     (target as any)[p] = value;
    //     return true;
    // }
    // console.log('set--?', p, target, value);

    if (typeof p === 'string') {
      value = this.proxy(receiver, value, p);
    }

    // console.log('set typeChecked',  (target as any)[p] instanceof ComponentSet, value instanceof ComponentSet);
    // if ((target as any)[p] instanceof ComponentSet) {
    //   (target as any)[p]?.obj?.onDrThisUnBind?.();
    // }
    // is ComponentSet
    if ((value instanceof ComponentSet) && ((target as any)[p] instanceof ComponentSet)) {
      value.config.beforeComponentSet = (target as any)[p];
    }
    (target as any)[p] = value;
    let fullPathInfo: {path: string, obj:any}[][] = [];
    if (typeof p === 'string') {
      fullPathInfo = this.root([[{path:p, obj: this._domRender_proxy}]], value)
    }

    // console.log('setRooot', fullPathInfo);


    //normal attribute 또한 링크랑 같은 증세라서 이렇게 해줘야한다!!
    // const rootDomRenderProxy = this.findRootDomRenderProxy();
    // console.log('set!!!!!!!', fullPathInfo, rootDomRenderProxy)
    // console.log('--------rootDom',fullPathInfo, rootDomRenderProxy, rootDomRenderProxy._domRender_proxy)
    DocumentUtils.querySelectorAllByAttributeName(this.config.window.document, EventManager.normalAttrMapAttrName)?.forEach(elementInfo => {
      const targets = new Map<string,string>(ScriptUtils.evalReturn(elementInfo.value));
      Array.from(targets.entries()).filter(([key, value])=>value.trim()).filter(isDefined).flatMap(([key,valueScript])=> {
        return fullPathInfo.flat().filter(it => valueScript.includes(`this.${it.path}`)).flatMap(it=> ({key, valueScript: valueScript, pathInfo: it}));
      }).forEach(it=> {
        const value1 = ScriptUtils.evalReturn(it.valueScript, it.pathInfo.obj);
        // console.log('proxy set!Attribut======', it.key, value1)
        if (value1 === null) {
          elementInfo.element.removeAttribute(it.key);
          elementInfo.element[it.key] = null;
        } else {
          elementInfo.element.setAttribute(it.key, value1);
          elementInfo.element[it.key] = value1
        }
      })
    })

    // 여기서 링크 같은거 해줘야함
    DocumentUtils.querySelectorAllByAttributeName(this.config.window.document, EventManager.linkTargetMapAttrName)?.forEach(elementInfo => {
       const targets = new Map<string,string>(ScriptUtils.evalReturn(elementInfo.value));

      Array.from(targets.entries()).filter(([key, value])=>value.trim()).filter(isDefined).flatMap(([key,valueScript])=> {
        return fullPathInfo.flat().filter(it => valueScript.includes(`this.${it.path}`)).flatMap(it=> ({key, valueScript: valueScript, pathInfo: it}));
      }).forEach(info=> {
        const value1 = ScriptUtils.evalReturn(info.valueScript, info.pathInfo.obj);
        if (value1 === null) {
          elementInfo.element.removeAttribute(info.key);
        } else {
          elementInfo.element.setAttribute(info.key, value1);
        }
      })

      Array.from(targets.entries()).filter(([key, value])=>value.trim()).filter(isDefined).flatMap(([key,valueScript])=> {
        return fullPathInfo.flat().filter(it => valueScript.includes(`this.${it.path}`)).flatMap(it=> ({key, valueScript: valueScript, pathInfo: it}));
      }).forEach(info=> {
       const linkInfo = EventManager.linkAttrs.find(it=>it.name === info.key)
        if (linkInfo) {
          elementInfo.element[linkInfo.property] = value
        }
      })
    })
    if (('onBeforeReturnSet' in receiver) && typeof p === 'string' && !(this.config.proxyExcludeOnBeforeReturnSets ?? []).concat(excludeGetSetPropertys).includes(p)) {
      if(isOnBeforeReturnSet(receiver)){
        receiver.onBeforeReturnSet?.(p, value, fullPathInfo.map(it => it.map(it=>it.path).join()));
      }
    }
    return true;
  }

  get(target: T, p: string | symbol, receiver: any): any {
    // console.log('get-->', target, p, receiver);
    if (p === '_DomRender_origin') {
      return this._domRender_origin;
    } else if (p === '_DomRender_ref') {
      return this._domRender_ref;
    } else if (p === '_DomRender_proxy') {
      return this;
    } else {
      // Date라던지 이런놈들은-_-프록시가 이상하게 동작해서
      // console.log('--->', p, target, target.bind, 'bind' in target)
      // if ((p in target) && ('bind' in target)) {
      //     try{
      //     return (target as any)[p].bind(target);
      //     }catch (e) {
      //         console.error(e)
      //     }
      // } else {
      //     return (target as any)[p]
      // }
      // return (p in target) ? (target as any)[p].bind(target) : (target as any)[p]
      // console.log('-->', p, Object.prototype.toString.call((target as any)[p]), (target as any)[p])
      // return (target as any)[p]
      let it = (target as any)[p];
      if (it && typeof it === 'object' && ('_DomRender_isProxy' in it) && Object.prototype.toString.call(it._DomRender_origin) === '[object Date]') {
        it = it._DomRender_origin;
      }

      if (('onBeforeReturnGet' in receiver) && typeof p === 'string' && !(this.config.proxyExcludeOnBeforeReturnGets ?? []).concat(excludeGetSetPropertys).includes(p)) {
        (receiver as any)?.onBeforeReturnGet?.(p, it, this.root([[{path:p, obj: this._domRender_proxy}]], it, false));
      }
      return it;
    }
  }

  deleteProperty(target: T, p: string | symbol): boolean {
    delete (target as any)[p];
    if (typeof p === 'string') {
      this.root([[{path:p, obj: this._domRender_proxy}]]);
    }
    return true;
  }

  has(target: T, p: string | symbol): boolean {
    return p === '_DomRender_isProxy' || p in target;
  }

  proxy(parentProxy: T, obj: T | any, p: string) {


    try {
      const isNoProxy = Reflect.getMetadata(DomRenderNoProxyKey, obj, p) || Reflect.getMetadata(DomRenderNoProxyKey, Object.getPrototypeOf(obj).constructor);
      if (isNoProxy) {
        return obj;
      }
    } catch (e) {
    }

    const proxyTarget = (this.config.proxyExcludeTyps?.filter(it => obj instanceof it) ?? []).length <= 0;
    if (proxyTarget && obj !== undefined && obj !== null && typeof obj === 'object' && !('_DomRender_isProxy' in obj) && !DomRenderProxy.isFinal(obj) && !Object.isFrozen(obj) && !(obj instanceof Shield)) {
      const domRender = new DomRenderProxy(obj, undefined, this.config);
      domRender.addRef(parentProxy, p);
      const proxy = new Proxy(obj, domRender);
      domRender.run(proxy);
      return proxy;
    }
    if (proxyTarget && obj !== undefined && obj !== null && typeof obj === 'object' && ('_DomRender_isProxy' in obj) && !DomRenderProxy.isFinal(obj) && !Object.isFrozen(obj) && !(obj instanceof Shield)) {
      const d = (obj as any)._DomRender_proxy as DomRenderProxy<T>;
      d.addRef(this._domRender_proxy!, p);
      return obj;
    } else {
      return obj;
    }
  }

  public addRef(parent: object, path: string) {
    if (!this._domRender_ref.get(parent)) {
      this._domRender_ref.set(parent, new Set<string>());
    }
    this._domRender_ref.get(parent)?.add(path);
  }

  public addRawSetAndRender(path: string, rawSet: RawSet) {
    this.addRawSet(path, rawSet);
    this.render([rawSet]);
  }

  public addRawSet(path: string, rawSet: RawSet) {
    // console.log('addRawSet--> path:', path, 'rawSet:', rawSet)
    if (!this._rawSets.get(path)) {
      this._rawSets.set(path, new Set<RawSet>());
    }
    this._rawSets.get(path)?.add(rawSet);
  }

  // public removeRawSet(...raws: RawSet[]) {
  //     this._rawSets.forEach(it => {
  //         raws.forEach(sit => it.delete(sit));
  //     })
  //     this.garbageRawSet();
  // }

  public removeRawSet(...raws: RawSet[]) {
    this._rawSets.forEach(it => {
      it.forEach(sit => {
        if (!sit.isConnected) {
          it.delete(sit);
        } else if (raws.includes(sit)) {
          it.delete(sit);
        }
      });
    });
    this.targetGarbageRawSet();
  }

  private targetGarbageRawSet() {
    this._targets.forEach(it => {
      if (!it.isConnected) {
        this._targets.delete(it);
      }
    });
  }

  private garbageRawSet() {
    this._targets.forEach(it => {
      if (!it.isConnected) {
        this._targets.delete(it);
      }
    });

    this._rawSets.forEach(it => {
      it.forEach(sit => {
        if (!sit.isConnected) {
          it.delete(sit);
        }
      });
    });
  }
}
