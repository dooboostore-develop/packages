import { RawSet, RenderResult } from './rawsets/RawSet';
import { EventManager, NormalAttrDataType } from './events/EventManager';
import { DomRenderConfig } from './configs/DomRenderConfig';
import { DomRenderFinalProxy, Shield } from './types/Types';
import { RawSetType } from './rawsets/RawSetType';
import { DrThisProperty } from './operators/DrThisProperty';
import { RawSetOperatorType } from './rawsets/RawSetOperatorType';
import { ComponentSet } from './components/ComponentSet';
import { DomRenderNoProxyKey, isDomRenderNoProxy } from './decorators/DomRenderNoProxy';
import { isOnCreateRender } from './lifecycle/OnCreateRender';
import { isOnInitRender } from './lifecycle/OnInitRender';
import { isOnCreateRenderData } from './lifecycle/OnCreateRenderData';
import { isOnChangeAttrRender } from './lifecycle/OnChangeAttrRender';
import { DocumentUtils } from '@dooboostore/core-web';
import { isOnBeforeReturnSet } from './lifecycle/OnBeforeReturnSet';
import { isOnChildRenderedByProperty } from './lifecycle/OnChildRenderedByProperty';
import { ObjectUtils } from '@dooboostore/core';
import { ValidUtils } from '@dooboostore/core';
import { isOnProxyDomRender } from './lifecycle/OnProxyDomRender';
import { isOnRawSetRendered } from './lifecycle/OnRawSetRendered';
import { isOnChildRawSetRendered } from "./lifecycle/OnChildRawSetRendered";
import { DomRenderComponentMetaKey, DomRenderProxyMetaKey } from './rawsets';

const excludeGetSetPropertys: string[] = [
  DomRenderComponentMetaKey.DOMRENDER_COMPONENTS_KEY,
  DomRenderProxyMetaKey.onBeforeReturnGet,
  DomRenderProxyMetaKey.onBeforeReturnSet,
  DomRenderProxyMetaKey.__render,
  DomRenderProxyMetaKey._rawSets,
  DomRenderProxyMetaKey._targets,
  DomRenderProxyMetaKey._domRender_proxy,
  DomRenderProxyMetaKey._DomRender_isFinal,
  DomRenderProxyMetaKey._domRender_ref,
  DomRenderProxyMetaKey._DomRender_origin,
  DomRenderProxyMetaKey._DomRender_ref,
  DomRenderProxyMetaKey._DomRender_proxy
];
export const isWrapProxyDomRenderProxy = <T>(obj: T): boolean => {
  return obj && typeof obj === 'object' && '_DomRender_isProxy' in obj;
};
export const getDomRenderOriginObject = <T>(obj: T): T => {
  if (isWrapProxyDomRenderProxy(obj)) {
    return (obj as any)._domRender_origin;
  }
  return obj;
};
export const getDomRenderConfig = (obj: any): DomRenderConfig | undefined => {
  if (isWrapProxyDomRenderProxy(obj)) {
    return obj._domRender_config;
  }
  return undefined;
};
//@ts-ignore
export const getDomRenderProxy = <T>(obj: T): DomRenderProxy<T> | undefined => {
  if (isWrapProxyDomRenderProxy(obj)) {
    //@ts-ignore
    return (obj as any)._domRender_proxy as DomRenderProxy<T>;
  }
  return undefined;
};
export class DomRenderProxy<T extends object> implements ProxyHandler<T> {
  public _domRender_ref = new Map<object, Set<string>>();
  public _rawSets = new Map<string, Set<RawSet>>();
  public _domRender_proxy?: T;
  public _targets = new Set<Node>();
  // public name = Math.random();

  constructor(
    public _domRender_origin: T,
    target: Node | null | undefined,
    public _domRender_config: DomRenderConfig
  ) {
    if (target) {
      this._targets.add(target);
      // this._firstTarget = target;
    }

    // setInterval(() => {
    //   this._rawSets.forEach(it => {
    //     Array.from(it).forEach(it => {
    //       console.log(it, it.isConnected)
    //     })
    //   });
    // }, 1000)
  }

  public static unFinal<T = any>(obj: T): T {
    return DomRenderFinalProxy.unFinal(obj);
  }

  public static final<T = any>(obj: T): T {
    return DomRenderFinalProxy.final(obj);
  }

  public static isFinal<T = any>(obj: T) {
    return ValidUtils.isNull(obj) || DomRenderFinalProxy.isFinal(obj);
  }

  public static isProxy<T = any>(obj: T) {
    return ValidUtils.isNull(obj) || isWrapProxyDomRenderProxy(obj);
  }

  public static getOriginalObject (obj: any) {
    if (isWrapProxyDomRenderProxy(obj)) {
      return obj._domRender_origin;
    }
    return obj;
  }

  public async run(objProxy: T) {
    this._domRender_proxy = objProxy;
    if (isOnProxyDomRender(objProxy)) {
      objProxy.onProxyDomRender(this._domRender_config);
    }
    const obj = getDomRenderOriginObject<any>(objProxy);
    if (obj) {
      Object.keys(obj).forEach(it => {
        // Reflect 메타데이터에서 domRender:NoProxy 여부 확인
        try {
          const isNoProxy =
            Reflect.getMetadata(DomRenderNoProxyKey, obj, it) ||
            Reflect.getMetadata(DomRenderNoProxyKey, Object.getPrototypeOf(obj).constructor);
          if (isNoProxy) {
            return obj;
          }
        } catch (e) { }
        const target = obj[it];
        if (
          target !== undefined &&
          target !== null &&
          typeof target === 'object' &&
          !DomRenderProxy.isFinal(target) &&
          !Object.isFrozen(target) &&
          !(obj instanceof Shield)
        ) {
          const isExcluded = this._domRender_config.proxyExcludeTyps?.some(it => target instanceof it) ?? false;
          // const filter = this._domRender_config.proxyExcludeTyps?.filter(it => target instanceof it) ?? [];
          if (!isExcluded) {
            const proxyAfter = this.proxy(objProxy, target, it);
            obj[it] = proxyAfter;
          }
        }
      });
    }
    // console.log('target', this._targets);
    for (let target of this._targets) {
      await this.initRender(target);
    }
  }

  public async initRender(target: Node, rawSet?: RawSet) {
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
      createParam = ObjectUtils.Script.evaluateReturn(onCreate, this._domRender_proxy);
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
    const rawSets = RawSet.checkPointCreates(target, this._domRender_proxy, this._domRender_config);
    // console.log('initRender -------rawSet', rawSets)
    // 중요 초기에 한번 튕겨줘야함.
    this._domRender_config.eventManager.applyEvent(
      this._domRender_proxy,
      this._domRender_config.eventManager.findAttrElements(target as Element, this._domRender_config),
      this._domRender_config
    );
    rawSets.forEach(it => {
      const variables = it.getUsingTriggerVariables(this._domRender_config);
      if (variables.size <= 0) {
        this.addRawSet('', it);
      } else {
        variables.forEach(sit => {
          this.addRawSet(sit, it);
        });
      }
    });

    const targetRawSets = await this.render(this.getRawSets());
    for (let targetRawSet of targetRawSets) {
      let initParam: any;
      if (onCreate) {
        initParam = ObjectUtils.Script.evaluateReturn(onCreate, this._domRender_proxy);
      }
      if (isOnInitRender(this._domRender_proxy)) {
        await this._domRender_proxy.onInitRender(
          initParam,
          rawSet ?? ({ dataSet: { config: this._domRender_config } } as any)
        );
      }
    }
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
    // console.log('Total RawSets to render:', Array.isArray(rawSets) ? rawSets.length : 0);

    // console.log('----', rawSets);
    // console.log('----', rawSets);
    const CHUNK_SIZE = 50;
    const chunks:RawSet[][] = [];
    let rawSetsArray = Array.from(rawSets as RawSet[]);
    // console.log('--->1', JSON.stringify(rawSetsArray.map(it=>it.type)));
    // rawSetsArray = rawSetsArray.sort((a, b) => {
    //   const order = { [RawSetType.TARGET_ELEMENT]: 0, [RawSetType.TARGET_ATTR]: 1, [RawSetType.TEXT]: 2 };
    //   return (order[a.type] ?? 999) - (order[b.type] ?? 999);
    // });
    // console.log('--->2', JSON.stringify(rawSetsArray.map(it=>it.type)));
    // await Promise.all(rawSetsArray.map(rawSet => this.renderExecute(rawSet, fullPathStr, removeRawSets)));
    for (const rawSet of rawSetsArray) {
      await this.renderExecute(rawSet, fullPathStr, removeRawSets);
    }
    // 훔....아래 벌크..잘동작이 안되네..아... 위에처럼 하나씩 처리하면 되긴하는데..흠..
    // const firstRawSet = rawSetsArray.shift();
    // 이렇게 청크단위로 처리할때  await Promises.sleep(0); 을 넣어줘도 처음에 dr-for-of가 먼저 돌고 그러면 참고하고있는 rawSet들이 isConnect가 false되니깐 처리안되고
    // 나중에 처리되면서 오류가 난다. 그래서 청크내에서 첫번째꺼는 바로처리하고 그다음꺼부터는 await를 넣어줘서 브라우저가 중간에 처리할 시간을 주도록 한다.
    // 항상 먼저 등록된 path들에 의해 뒤에게 생성되는경우가 무조건이기떄문에 먼저거 한번 돌려주면 잘된다.
    // 아니면 renderExecute  안쪽에서 매번 sleep을 줘도되는데.. 그렇게되면 부하가 너무 갈수 있어서.. 우선 첫번쨰것만 처리하도록해본다.
    // if (firstRawSet) {
    //   await this.renderExecute(firstRawSet, fullPathStr, removeRawSets);
    // }
    // for (let i = 0; i < rawSetsArray.length; i += (CHUNK_SIZE)) {
    //   chunks.push(rawSetsArray.slice(i, i + CHUNK_SIZE));
    // }
    //
    // for (const chunk of chunks) {
    //   const promises = chunk.map(async (it, index) => {
    //     await this.renderExecute(it, fullPathStr, removeRawSets);
    //     // console.log('----', it);
    //   });
    //   // console.log('실행.!')
    //   await Promise.all(promises);
    //   if (chunks.length > 1) {
    //     await new Promise(resolve => requestAnimationFrame(resolve));
    //   }
    // }

    if (isOnChildRawSetRendered(this._domRender_proxy)) {
      await this._domRender_proxy.onChildRawSetRendered();
    }

    if (removeRawSets.length > 0) {
      this.removeRawSet(...removeRawSets);
    }
    return this.getRawSets();
  }

  private async renderExecute(it: RawSet, fullPathStr: string, removeRawSets: RawSet[]) {
    // console.log('실행?')
    // await Promises.sleep(0);
    it.getUsingTriggerVariables(this._domRender_config).forEach(path => {
      // console.log('getUsingTriggerVariables->', path);
      this.addRawSet(path, it);
    });

    let renderResult: RenderResult | undefined;
    // console.log('isConnected?', it, it.isConnected);
    if (it.isConnected) {
      // 중요 render될때 targetAttribute 체크 해야함.
      const targetAttrMap = (it.point.node as Element)?.getAttribute?.(EventManager.normalAttrMapAttrName);
      // console.log('sssssssssSSS?',it, targetAttrMap)
      // console.log('----2', it, fullPathStr, targetAttrMap, (it.fragment as any).render, it.isConnected, this.getRawSets());
      if (it.detect?.action) {
        it.detect.action();
        // } else if (it.type === RawSetType.TARGET_ELEMENT && it.data && fullPathStr && targetAttrMap && (it.fragment as any).render) {
      } else if (
        it.type === RawSetType.TARGET_ELEMENT &&
        it.dataSet?.render?.currentThis &&
        fullPathStr &&
        targetAttrMap
      ) {
        const attrStart = performance.now();
        new Map<string, NormalAttrDataType>(JSON.parse(targetAttrMap)).forEach((v, k) => {
          // it?.data.onChangeAttrRender(k, null, v);
          // console.log('------->?',v,k);
          const isUsing = v.variablePaths.some(it => EventManager.isUsingThisVar(it.inner, `this.${fullPathStr}`))
          // console.log('------->?',v,k, isUsing);
          if (isUsing) {
            const targetAttrObject = RawSet.getAttributeObject(it.point.node as Element, {
              script: it.dataSet?.render?.renderScript ?? '',
              obj: Object.assign(this._domRender_proxy ?? {}, {__render: it.dataSet?.render})
            });
            it.dataSet.render ??= {};
            it.dataSet.render.attribute = targetAttrObject;
            // const render = it.dataSet?.render;
            // console.log('render-->!!!!!', it.dataSet.render);
            // const script = `${render.renderScript} return ${v} `;
            // const cval = ScriptUtils.eval(script, Object.assign(this._domRender_proxy ?? {}, { __render: render }));
            if (isOnChangeAttrRender(it.dataSet?.render?.currentThis)) {
              it.dataSet?.render?.currentThis?.onChangeAttrRender?.(k, targetAttrObject[k], {rawSet: it});
            }
          }
          // console.log('---?', v, fullPathStr, isUsing);
        });
        const attrEnd = performance.now();
        // if (attrEnd - attrStart > 10) {
        // console.log('Slow Attr Update:', attrEnd - attrStart, it);
        // }
        // ------------------->
      } else {
        const renderStart = performance.now();
        const rawSets = await it.render(this._domRender_proxy, this._domRender_config);
        // console.log('!!!!!!!!!', rawSets)
        const renderEnd = performance.now();
        // if (renderEnd - renderStart > 10) {
        //   console.log('Slow RawSet Render:', renderEnd - renderStart, it);
        // }
        renderResult = rawSets;
        // 그외 자식들 render
        if (rawSets && rawSets.raws.length > 0) {
          await this.render(rawSets.raws);
        }
      }
    } else {
      removeRawSets.push(it);
    }

    const t = it.findNearThis(this._domRender_proxy);
    // TODO: 호출된곳에서 또 변수를 수정하게되면 무한루프니깐 왠만하면 사용못하게 해야한다.
    if (isOnRawSetRendered(t)) {
      await t.onRawSetRendered(it, {path: fullPathStr, value: ObjectUtils.Script.evaluateReturn(`this.${fullPathStr}`, this._domRender_proxy), root: this._domRender_proxy, renderResult});
    }
  }

// domrender_ref로 찾는걸로 바꿈
  // public findRootDomRenderProxy(): DomRenderProxy<any> {
  //   let current:DomRenderProxy<any>  = this;
  //   while (current.parentProxy) {
  //     current = current.parentProxy;
  //   }
  //   return current;
  // }

  public root(
    pathInfos: { path: string; obj: any }[][],
    value?: any,
    lastDoneExecute = true
  ): { path: string; obj: any }[][] {
    // console.time('root_total');
    const rootStartTime = Date.now();
    const pathKey = pathInfos.flat().map(i => i.path).join('.');

    // console.group(`🌳 DomRenderProxy root: ${pathKey}`);
    // console.log('root--->', pathInfos, value, this._domRender_ref, this._domRender_origin);
    const fullPaths: { path: string; obj: any }[][] = [];
    if (this._domRender_ref.size > 0) {
      this._domRender_ref.forEach((it, key) => {
        if (DomRenderProxyMetaKey._DomRender_isProxy in key) {
          it.forEach(sit => {
            try {
              const recursiveStartTime = Date.now();
              const concat = pathInfos.concat([[{ path: sit, obj: key }]]);
              const items: { path: string; obj: any }[][] = (key as any)._DomRender_proxy?.root(
                concat,
                value,
                lastDoneExecute
              );
              // console.log(`🔄 Recursive root call for ${sit}: ${Date.now() - recursiveStartTime}ms`);

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
      // console.time('root_recursive');
      const pathProcessStartTime = Date.now();
      // const firstPathStr = paths.slice(1).reverse().join('.');
      const shortPaths = pathInfos.reverse().map(it => it.map(it => it.path).join(','));
      // array같은경우도 키값으로 접근하기때문에 특정 인덱스를 찾아서 그부분만 바꿔줄수 있다.
      const fullPathStr = shortPaths
        .map(it => (isNaN(Number(it)) ? '.' + it : `[${it}]`))
        .join('')
        .slice(1);
      // console.log(`🛤️ Path processing time: ${Date.now() - pathProcessStartTime}ms for path: ${fullPathStr}`, lastDoneExecute);
      if (lastDoneExecute) {
        // const firstData = ScriptUtils.evalReturn('this.' + firstPathStr, this._domRender_proxy);
        // console.log('-------', firstPathStr, firstData);
        // if (firstData instanceof Dictionary) {
        // }
        const iterable = this._rawSets.get(fullPathStr);
        // array check
        const front = shortPaths
          .slice(0, shortPaths.length - 1)
          .map(it => (isNaN(Number(it)) ? '.' + it : `[${it}]`))
          .join('');
        const lastPropertyName = shortPaths[shortPaths.length - 1];
        const path = 'this' + front;
        const data = ObjectUtils.Script.evaluateReturn(ObjectUtils.Path.toOptionalChainPath(path), this._domRender_proxy);
        // console.log('root-sub-->', this._rawSets, iterable, path, data );
        
        // 중요: 값이 undefined/null이 되면 해당 경로로 시작하는 모든 child RawSet들을 정리
        // 예: users가 undefined가 되면 users[0].imgUrl, users[1].office.name 등의 RawSet들도 제거
        // if (value === undefined || value === null) {
        //   this.removeChildRawSetsByPath(fullPathStr);
        // }
        // console.log('--!!!!', fullPathStr, iterable, data, front, last);
        // 왜여기서 promise를 했을까를 생각해보면......훔.. 변수변경과 화면 뿌려주는걸 동기로하면 성능이 안나오고 비현실적이다.  그래서 promise
        const promiseStartTime = Date.now();
        // console.timeEnd('root_recursive');
        // console.time('root_render_wait');
        new Promise<RawSet[]>(async resolve => {
          const promiseInnerStartTime = Date.now();
          let rData: RawSet[] = [];
          const firstPathStr = front.slice(1);

          // check dictionary
          const dictionaryCheckStartTime = Date.now();
          // console.log('-promise-------', firstPathStr, this)
          const firstTargets = this._rawSets.get(firstPathStr);
          const firstTargetDictionary: RawSet[] = [];
          firstTargets?.forEach(it => {
            // console.log('----forEach---', it);
            const type = (it.point.start as Element)?.getAttribute?.('type');
            if (type === RawSetOperatorType.DR_THIS_PROPERTY) {
              firstTargetDictionary.push(it);
            }
          });
          // console.log(`📚 Dictionary check time: ${Date.now() - dictionaryCheckStartTime}ms (${firstTargetDictionary.length} found)`);

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
                startElement.setAttribute(
                  RawSet.DR_HAS_KEYS_OPTIONNAME,
                  keys.filter(it => it !== lastPropertyName).join(',')
                );
              }
              if (!keys.includes(lastPropertyName)) {
                const raws = DrThisProperty.append(
                  this._domRender_proxy,
                  fullPathStr,
                  lastPropertyName,
                  it,
                  this._domRender_config
                );
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

          const renderStartTime = Date.now();
          if (lastPropertyName === 'length' && Array.isArray(data)) {
            const aIterable = this._rawSets.get(firstPathStr);
            if (aIterable) {
              rData = await this.render(Array.from(aIterable));
            }
          } else if (iterable) {
            // console.log('------------',iterable, fullPaths)
            rData = await this.render(Array.from(iterable), fullPathStr);
          }
          // console.log(`🎨 Render time: ${Date.now() - renderStartTime}ms (${rData?.length || 0} rawSets)`);

          // console.log('-----------', this, lastPropertyName );
          // this._targets.forEach(it => {
          //   // return;
          //   if (it.nodeType === Node.DOCUMENT_FRAGMENT_NODE || it.nodeType === Node.ELEMENT_NODE) {
          //     const targets = eventManager.findAttrElements((it as DocumentFragment | Element), this.config);
          //     eventManager.changeVar(this._domRender_proxy, targets, `this.${fullPathStr}`, this.config);
          //   }
          // });

          const eventProcessStartTime = Date.now();
          const Node = ((this._domRender_config.window as any).Node)
          this._targets.forEach(it => {
            // return;
            if (it.nodeType === Node.DOCUMENT_FRAGMENT_NODE || it.nodeType === Node.ELEMENT_NODE) {
              const findAttrStartTime = Date.now();
              const targets = this._domRender_config.eventManager.findAttrElements(
                it as DocumentFragment | Element,
                this._domRender_config
              );
              const targetCount = (targets as any)?.size || (targets as any)?.length || 0;
              // console.log(`🔍 findAttrElements time: ${Date.now() - findAttrStartTime}ms (${targetCount} elements)`, it);

              const changeVarStartTime = Date.now();
              this._domRender_config.eventManager.changeVar(
                this._domRender_proxy,
                targets,
                `this.${fullPathStr}`,
                this._domRender_config
              );
              // console.log(`🔄 changeVar time: ${Date.now() - changeVarStartTime}ms`);
            }
          });
          // console.log(`⚡ Event processing time: ${Date.now() - eventProcessStartTime}ms (${this._targets.size} targets)`);

          // console.log(`🔄 Promise inner total time: ${Date.now() - promiseInnerStartTime}ms`);

          //랜더대상된게있으면
          if (rData?.length > 0 && isOnChildRenderedByProperty(data)) {
            const propertyValue = ObjectUtils.Script.evaluateReturn(`this.${lastPropertyName}`, data);
            data.onChildRenderedByProperty(lastPropertyName, propertyValue);
            // data
          }
          resolve(rData);
        }).then(it => {
          // console.log('DonrenderProxy root RenderDone')
          // console.timeEnd('root_render_wait');
          // console.timeEnd('root_total');
        });
      }
      fullPaths.push([{ path: fullPathStr, obj: this._domRender_proxy }]);
    }

    // console.log(`🏁 Root method total time: ${Date.now() - rootStartTime}ms`);
    // console.log('dddddd', fullPaths.flatMap(it => it).map(it => it.path))
    // console.groupEnd();
    return fullPaths;
  }

  public set(target: T, p: string | symbol, value: any, receiver: T): boolean {
    // console.log('set------->', target, p, value, receiver, Date.now())
    // console.log('set------->', p,value)
    // console.log('set------->', target, p, value, receiver, Date.now())
    // try {
    //   const isNoProxy = Reflect.getMetadata(DomRenderNoProxyKey, target, p) || Reflect.getMetadata(DomRenderNoProxyKey, Object.getPrototypeOf(obj).constructor);
    //   if (isNoProxy) {
    //     return obj;
    //   }
    // }catch (e) {}

    // console.log('set-->', p, value, target, receiver, Reflect.getMetadata(DomRenderNoProxyKey, target, p) );

    if (
      (typeof p === 'string' && p !== DomRenderComponentMetaKey.DOMRENDER_COMPONENTS_KEY && excludeGetSetPropertys.includes(p)) ||
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
    let start = performance.now()
    if (typeof p === 'string') {
      value = this.proxy(receiver, value, p);
    }
    // console.log('set proxy time', performance.now() - start, p);
    // start = performance.now();


    // console.log('set typeChecked',  (target as any)[p] instanceof ComponentSet, value instanceof ComponentSet);
    // if ((target as any)[p] instanceof ComponentSet) {
    //   (target as any)[p]?.obj?.onDrThisUnBind?.();
    // }
    // console.log('---', this._domRender_ref, p, this._domRender_proxy)
    // is ComponentSet
    if (value instanceof ComponentSet && (target as any)[p] instanceof ComponentSet) {
      value.config.beforeComponentSet = (target as any)[p];
    }
    (target as any)[p] = value;
    let fullPathInfo: { path: string; obj: any }[][] = [];
    if (typeof p === 'string') {
      fullPathInfo = this.root([[{ path: p, obj: this._domRender_proxy }]], value);
    }


    // console.log('set proxy root time', performance.now() - start, p);
    // start = performance.now();
    //
    // console.log('setRooot', fullPathInfo);

    //normal attribute 또한 링크랑 같은 증세라서 이렇게 해줘야한다!!
    // const rootDomRenderProxy = this.findRootDomRenderProxy();
    // console.log('set!!!!!!!', fullPathInfo, rootDomRenderProxy)
    // console.log('--------rootDom',fullPathInfo, rootDomRenderProxy, rootDomRenderProxy._domRender_proxy)
    const rootElement = this._domRender_config.rootElement ?? this._domRender_config.window.document;
    DocumentUtils.querySelectorAllByAttributeName(rootElement, EventManager.normalAttrMapAttrName)?.forEach(
      elementInfo => {
        // @ts-ignore
        // const optionalPath = ObjectUtils.Path.toOptionalChainPath(elementInfo.value);
        const targets = new Map<string, NormalAttrDataType>(
          ObjectUtils.Script.evaluateReturn<[string, NormalAttrDataType][]>(elementInfo.value)
        );
        Array.from(targets.entries())
          .filter(ValidUtils.isDefined<[string, NormalAttrDataType]>)
          .flatMap(([key, valueScript]) => {
            return fullPathInfo
              .flat()
              .filter(it => valueScript.variablePaths?.some(vit => vit.inner.includes(`this.${it.path}`)))
              .flatMap(it => ({ key, valueScript: valueScript, pathInfo: it }));
          })
          .forEach(it => {
            // const optionalPaths = it.valueScript.variablePaths.map(it => ObjectUtils.Path.toOptionalChainPath(it))
            const variablePaths = it.valueScript.variablePaths;
            let targetScript = it.valueScript.originalAttrValue;
            let script: string;
            if (it.valueScript.isStringTemplate) {
              variablePaths.forEach(it => {
                let r = ObjectUtils.Path.toOptionalChainPath(it.inner);
                targetScript = targetScript.replaceAll(it.origin, `\${${r}}`);
              })
              script = '`' + targetScript + '`';
            } else {
              variablePaths.forEach(it => {
                let r = ObjectUtils.Path.toOptionalChainPath(it.inner);
                targetScript = targetScript.replaceAll(it.origin, `${r}`);
              })
              script = targetScript;
            }
            // variablePaths.forEach(it => {
            //   let r = ObjectUtils.Path.toOptionalChainPath(it.inner);
            //   targetScript = targetScript.replaceAll(it.origin,`\${${r}}`);
            // })
            const value1 = ObjectUtils.Script.evaluateReturn(script, it.pathInfo.obj);
            // console.log('proxy set!Attribut======', it.key, value1)
            if (value1 === null || value1 === undefined) {
              elementInfo.element.removeAttribute(it.key);
              // elementInfo.element[it.key] = null;
            } else {
              elementInfo.element.setAttribute(it.key, value1);
              elementInfo.element[it.key] = value1;
            }
          });
      }
    );

    // console.log('set proxy normalAttrMapAttrName time', performance.now() - start, p);
    // start = performance.now();



    //여기서 링크 같은거 해줘야함  *-link로 변수값이 변경되면 그걸 참고하고있는 다른것들에도 해줘야한다.
    DocumentUtils.querySelectorAllByAttributeName(rootElement, EventManager.linkTargetMapAttrName)?.forEach(
      elementInfo => {
        // @ts-ignore
        const targets = new Map<string, string>(ObjectUtils.Script.evaluateReturn<[string, string][]>(elementInfo.value));

        Array.from(targets.entries())
          .filter(([key, value]) => value.trim())
          .filter(ValidUtils.isDefined<[string, string]>)
          .flatMap(([key, valueScript]) => {
            return fullPathInfo
              .flat()
              .filter(it => valueScript.includes(`this.${it.path}`))
              .flatMap(it => ({ key, valueScript: valueScript, pathInfo: it }));
          })
          .forEach(info => {
            const value1 = ObjectUtils.Script.evaluateReturn(info.valueScript, info.pathInfo.obj);
            const applyAttributeName = EventManager.linkAttrs.find(it => it.name === info.key);
            if (applyAttributeName) {
              if (value1 === null) {
                elementInfo.element.removeAttribute(applyAttributeName.property);
              } else {
                // console.log('ppppppppppppppppppppppp', applyAttributeName, elementInfo)
                elementInfo.element.setAttribute(applyAttributeName.property, value1);
              }
            }
          });

        Array.from(targets.entries())
          .filter(([key, value]) => value.trim())
          .filter(ValidUtils.isDefined<[string, string]>)
          .flatMap(([key, valueScript]) => {
            return fullPathInfo
              .flat()
              .filter(it => valueScript.includes(`this.${it.path}`))
              .flatMap(it => ({ key, valueScript: valueScript, pathInfo: it }));
          })
          .forEach(info => {
            const linkInfo = EventManager.linkAttrs.find(it => it.name === info.key);
            if (linkInfo) {
              elementInfo.element[linkInfo.property] = value;
            }
          });
      }
    );

    // console.log('set proxy linkTargetMapAttrName time', performance.now() - start, p);
    // start = performance.now();

    // console.log('---end',receiver);
    if (
      DomRenderProxyMetaKey.onBeforeReturnSet in receiver &&
      typeof p === 'string' &&
      !(this._domRender_config.proxyExcludeOnBeforeReturnSets ?? []).concat(excludeGetSetPropertys).includes(p)
    ) {
      if (isOnBeforeReturnSet(receiver)) {
        receiver.onBeforeReturnSet?.(
          p,
          value,
          fullPathInfo.map(it => it.map(it => it.path).join())
        );
      }
    }

    // console.log('done!!')
    return true;
  }

  get(target: T, p: string | symbol, receiver: any): any {
    // console.log('get-->', target, p, receiver);
    if (p === DomRenderProxyMetaKey._DomRender_origin || p === DomRenderProxyMetaKey._domRender_origin) {
      return this._domRender_origin;
    } else if (p === DomRenderProxyMetaKey._DomRender_ref || p === DomRenderProxyMetaKey._domRender_ref) {
      return this._domRender_ref;
    } else if (p === DomRenderProxyMetaKey._DomRender_config || p === DomRenderProxyMetaKey._domRender_config) {
      return this._domRender_config;
    } else if (p === DomRenderProxyMetaKey._DomRender_proxy || p === DomRenderProxyMetaKey._domRender_proxy) {
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
      if (
        it &&
        typeof it === 'object' &&
        DomRenderProxyMetaKey._DomRender_isProxy in it &&
        Object.prototype.toString.call(it._DomRender_origin) === '[object Date]'
      ) {
        it = it._DomRender_origin;
      }

      if (
        DomRenderProxyMetaKey.onBeforeReturnGet in receiver &&
        typeof p === 'string' &&
        !(this._domRender_config.proxyExcludeOnBeforeReturnGets ?? []).concat(excludeGetSetPropertys).includes(p)
      ) {
        (receiver as any)?.onBeforeReturnGet?.(
          p,
          it,
          this.root([[{ path: p, obj: this._domRender_proxy }]], it, false)
        );
      }
      return it;
    }
  }

  deleteProperty(target: T, p: string | symbol): boolean {
    delete (target as any)[p];
    if (typeof p === 'string') {
      this.root([[{ path: p, obj: this._domRender_proxy }]]);
    }
    return true;
  }

  has(target: T, p: string | symbol): boolean {
    return p === DomRenderProxyMetaKey._DomRender_isProxy || p in target;
  }

  proxy(parentProxy: T, obj: T | any, p: string) {
    try {
      // const isNoProxy = Reflect.getMetadata(DomRenderNoProxyKey, obj, p) || Reflect.getMetadata(DomRenderNoProxyKey, Object.getPrototypeOf(obj).constructor);
      const isObject = typeof obj === 'object';
      const isNoProxy = isObject && isDomRenderNoProxy(obj, p);
      const isExclude = this._domRender_config.proxyExcludeTyps?.some(it => obj instanceof it) ?? false;
      const isFinal = isObject && DomRenderProxy.isFinal(obj);
      const isFrozen = Object.isFrozen(obj);
      const isShield = obj instanceof Shield;
      if (
        obj === undefined ||
        obj === null ||
        isNoProxy ||
        isExclude ||
        ValidUtils.isNullOrUndefined(obj) ||
        !isObject ||
        isFinal ||
        isFrozen ||
        isShield
      ) {
        return obj;
      }
    } catch (e) { }

    /*
    const proxyTarget = (this._domRender_config.proxyExcludeTyps?.filter(it => obj instanceof it) ?? []).length <= 0;
    if (proxyTarget && obj !== undefined && obj !== null && typeof obj === 'object' && !('_DomRender_isProxy' in obj) && !DomRenderProxy.isFinal(obj) && !Object.isFrozen(obj) && !(obj instanceof Shield)) {
      const domRender = new DomRenderProxy(obj, undefined, this._domRender_config);
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
 */
    if (!isWrapProxyDomRenderProxy(obj)) {
      const domRender = new DomRenderProxy(obj, undefined, this._domRender_config);
      domRender.addRef(parentProxy, p);
      const proxy = new Proxy(obj, domRender);
      domRender.run(proxy);
      return proxy;
    }
    if (isWrapProxyDomRenderProxy(obj)) {
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
    // console.log('Before removeRawSet, total rawSets:', this.getRawSets().length);
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
    // console.log('After removeRawSet, total rawSets:', this.getRawSets().length);
  }

  // 특정 경로로 시작하는 모든 child RawSet들을 제거
  // 예: path가 'users'이면 'users[0]', 'users[0].imgUrl', 'users.length' 등 모두 제거
  public removeChildRawSetsByPath(parentPath: string) {
    const pathsToRemove: string[] = [];
    this._rawSets.forEach((rawSetSet, path) => {
      // 정확히 일치하거나, 배열 인덱스 접근(users[), 또는 속성 접근(users.)으로 시작하는 경우
      if (path === parentPath || path.startsWith(parentPath + '[') || path.startsWith(parentPath + '.')) {
        pathsToRemove.push(path);
      }
    });
    
    if (pathsToRemove.length > 0) {
      // console.log(`🧹 Removing child RawSets for path '${parentPath}':`, pathsToRemove);
      pathsToRemove.forEach(path => {
        const rawSetSet = this._rawSets.get(path);
        if (rawSetSet) {
          rawSetSet.forEach(rawSet => {
            // DOM에서 제거
            rawSet.remove?.();
          });
          this._rawSets.delete(path);
        }
      });
    }
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
