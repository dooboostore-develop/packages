import {SimFrontOption} from './option/SimFrontOption';
import {ConstructorType, isDefined} from '@dooboostore/core/types';
import {componentSelectors, getComponent} from './decorators/Component';
import {scripts} from './decorators/Script';
import {DomRender, DomRenderRunConfig} from '@dooboostore/dom-render/DomRender';
import {SimAtomic} from '@dooboostore/simple-boot/simstance/SimAtomic';
import {SimpleApplication} from '@dooboostore/simple-boot/SimpleApplication';
import {Intent} from '@dooboostore/simple-boot/intent/Intent';
import {SimstanceManager} from '@dooboostore/simple-boot/simstance/SimstanceManager';
import {IntentManager} from '@dooboostore/simple-boot/intent/IntentManager';
import {RouterManager} from '@dooboostore/simple-boot/route/RouterManager';
import {getDomRenderOriginObject} from '@dooboostore/dom-render/DomRenderProxy';
import {RawSet} from '@dooboostore/dom-render/rawsets/RawSet';
import {Render} from '@dooboostore/dom-render/rawsets/Render';
import {TargetAttr} from '@dooboostore/dom-render/configs/TargetAttr';
import {TargetElement} from '@dooboostore/dom-render/configs/TargetElement';
import {ScriptRunnable} from './script/ScriptRunnable';
import {Router} from '@dooboostore/dom-render/routers/Router';
import {HashRouter} from '@dooboostore/dom-render/routers/HashRouter';
import {PathRouter} from '@dooboostore/dom-render/routers/PathRouter';
import {ComponentSet} from './component/ComponentSet';
import {DomRenderRootDefaultStyle, DomRenderRootDefaultTemplate, DomRenderRootObject} from './DomRenderRootObject';
import {routerProcess} from '@dooboostore/simple-boot/decorators/route/Router';
import {BehaviorSubject} from '@dooboostore/core/message/BehaviorSubject';
import {RouterModule} from '@dooboostore/simple-boot/route/RouterModule';
import {Observable} from '@dooboostore/core/message/Observable';
import {filter} from '@dooboostore/core/message/operators/filter';
import {first} from "@dooboostore/core/message/operators/first";
import {ValidUtils} from "@dooboostore/core-web/valid/ValidUtils";
import {ElementUtils} from "@dooboostore/core-web/element/ElementUtils";
import {NodeUtils} from "@dooboostore/core-web/node/NodeUtils";

export type PopStateType = { type: 'popstateData'; router: any; noSimpleBootFrontRouting?: boolean };
const isPopStateDataType = (state: any): state is PopStateType => {
  return state && state.type === 'popstateData' && 'router' in state;
};

type RoutingSubjectDataType =
  | {
  triggerPoint: 'start' | 'end' | 'error-end';
  routerModule: RouterModule<SimAtomic<any>>;
}
  | {
  triggerPoint: 'initial';
};

export class SimpleBootFront extends SimpleApplication {
  public domRendoerExcludeProxy: ConstructorType<any>[] = [
    SimpleApplication,
    IntentManager,
    RouterManager,
    SimstanceManager,
    DomRenderRootObject,
    SimFrontOption,
    Router as ConstructorType<any>
  ];
  public domRenderTargetElements: TargetElement[] = [];
  public domRenderTargetAttrs: TargetAttr[] = [];
  public domRenderConfig: DomRenderRunConfig;
  private domRenderRouter: Router;
  private routerAndSettingData?: {
    point: { start: HTMLMetaElement; end: HTMLMetaElement } | { start: Comment; end: Comment };
    uuid: string;
    routerAtomic: SimAtomic<any>;
  };
  // private rootRouterTargetElement?: Element;
  private rootRouter?: ComponentSet<any>;
  private domRenderRootObject: DomRenderRootObject;
  private routingSubject = new BehaviorSubject<RoutingSubjectDataType>({triggerPoint: 'initial'});

  constructor(public option: SimFrontOption) {
    super(option);
    this.domRenderRootObject = new DomRenderRootObject();
    this.domRendoerExcludeProxy = this.domRendoerExcludeProxy.filter(it => it !== null);
    if (typeof HTMLElement !== 'undefined') {
      this.domRendoerExcludeProxy.push(HTMLElement);
    }
    if (typeof CanvasRenderingContext2D !== 'undefined') {
      this.domRendoerExcludeProxy.push(CanvasRenderingContext2D);
    }
    if (typeof CanvasPattern !== 'undefined') {
      this.domRendoerExcludeProxy.push(CanvasPattern);
    }
    if (typeof CanvasGradient !== 'undefined') {
      this.domRendoerExcludeProxy.push(CanvasGradient);
    }
    // const navigation = new Navigation(this.simstanceManager, this.option);
    // console.log('-----', navigation)
    // this.simstanceManager.setStoreSet(Navigation, navigation);
    this.domRenderRouter =
      option.urlType === 'path'
        ? new PathRouter({
          window: option.window
          // changeStateConvertDate:(data) =>({...data, type: 'popstateData', router: this.routerAndSettingData.routerAtomic.getValue()} as PopStateType)
        })
        : new HashRouter({
          window: option.window
          // changeStateConvertDate:(data) =>({...data, type: 'popstateData', router: this.routerAndSettingData.routerAtomic.getValue()} as PopStateType)
        });
    this.simstanceManager.setStoreSet(Router, this.domRenderRouter);
    this.domRenderConfig = {
      window: option.window,
      targetElements: this.domRenderTargetElements,
      targetAttrs: this.domRenderTargetAttrs,
      onElementInit: (name: string, obj: any, rawSet: RawSet, targetElement: TargetElement) => {
      },
      onAttrInit: (attrName: string, attrValue: string, obj: any, rawSet: RawSet) => {
      },
      // routerType: option.urlType,
      routerType: this.domRenderRouter,
      scripts: {
        application: this
        // @Script로 등록해서 쓸수 있음
        // concat: function (head: string, tail: string) {
        //   return head + tail;
        // }
      },
      // applyEvents: [{
      //     attrName: 'router-link',
      //     callBack: (elements: Element, attrValue: string, obj: any) => {
      //         elements.addEventListener('click', (event) => {
      //             this.getSimstanceManager().getOrNewSim({target:Navigation})?.go(attrValue)
      //         })
      //     }
      // }],
      eventVariables: {},
      proxyExcludeTyps: this.domRendoerExcludeProxy,
      operatorAround: {}
    };

    (this.option.window as any).__dirname = 'simple-boot-front__dirname';
    (this.option.window as any).__SimpleBootFront = this;

    option.proxy = {
      onAfterProxy: (it: any) => this.createDomRender(it)
    };
  }

  get routingSubjectObservable() {
    return this.routingSubject.asObservable();
  }

  public getComponentInnerHtml(targetObj: any, id: string) {
    const component = getComponent(targetObj);
    const styles = RawSet.generateStyleTransform(component?.styles ?? '', id);
    const template = component?.template ?? '';
    return styles + template;
  }

  public createDomRender<T extends object>(obj: T): T {
    const component = getComponent(obj);
    // console.log('onProxy!!!', obj, component);
    if (component && typeof obj === 'object') {
      //     // 나중에 헛갈리겠는데??  이거 normalattribute 때문에 DomrenderPRoxy set 쪽에서 ㅡㅡ root를 찾아가야되기때문에 ref를 계속 가져가야함.
      //     // console.log('fffffffffffffffffffffffffffff', obj);
      //     // root Router 일때
      //     if (this.option.rootRouter === obj.constructor) {
      //       // console.log('같니?')
      //       this.rootRouterTargetElement = this.option.window.document.querySelector(this.option.selector).cloneNode(true) as Element;
      //       this.rootRouterTargetElement.innerHTML = '';
      //       this.rootRouterTargetElement.setAttribute('hidden', '')
      //       this.option.window.document.body.appendChild(this.rootRouterTargetElement);
      //       const data = this.writeRootRouter(this.rootRouterTargetElement, obj);
      //       // this.rootRouterInstance = obj;
      //       const result = DomRender.run({rootObject: obj, config: this.domRenderConfig, target: this.rootRouterTargetElement});
      //       return result;
      //       // this.targetElement = data.target;
      //       // document.body.appendChild(this.targetElement);
      //     } else {
      // console.log('--DomRender.run({ rootObject: obj, config: this.domRenderConfig })---->',obj)
      const result = DomRender.run({rootObject: obj, config: this.domRenderConfig});
      // console.log('proxy end', result);
      return result;
      //     }
      //     // this.domRenderRouter = domRenderResult.config.router;
      //     // this.simstanceManager.getOrNewSim({target:Navigation})?.routers.push(this.domRenderRouter);
      //     // console.log('createDomRender', this.domRenderRouter)
      //     // return domRenderResult.rootObject;
    }
    return obj;
  }

  private initRun(otherInstanceSim?: Map<ConstructorType<any>, any>) {
    // console.log('!@!!', this.option.window.document.body.innerHTML);
    const targetUserElement =
      typeof this.option.selector === 'string'
        ? this.option.window.document.querySelector(this.option.selector)
        : this.option.selector;

    if (!(targetUserElement instanceof HTMLElement)) {
      throw new Error('HTMLElement is not Element');
    }



    const simstanceManager = super.run(otherInstanceSim);
    this.initDomRenderConfigSetting();
    this.option.window.addEventListener('intent', event => {
      const cevent = event as CustomEvent;
      this.publishIntent(new Intent(cevent.detail.uri, cevent.detail.data, event));
    });


    let targetElement = targetUserElement;
    const rect = targetUserElement.getBoundingClientRect();
    const originPosition = targetElement.style.position;
    const originTop = targetElement.style.top;
    const originLeft = targetElement.style.left;
    const originWidth = targetElement.style.width;
    const originHeight = targetElement.style.height;
    const originZIndex = targetElement.style.zIndex;

    // console.log('-----rect-----', rect, originPosition, originTop, originLeft, originWidth, originHeight, originZIndex);
    if (ValidUtils.isBrowser()) {
      // console.log('none server side')
      targetUserElement.removeAttribute('id');
      targetElement = targetUserElement.cloneNode(true) as HTMLElement;
      if (!targetElement || !targetUserElement) {
        throw new Error('no element selector ' + this.option.selector);
      }
      targetElement.setAttribute('dom-render-side', 'client');
      targetElement.innerHTML = DomRenderRootDefaultTemplate;
      targetElement.removeAttribute('dom-render-done');
     // targetElement = targetUserElement;
     //  console.log('------???????', targetUserElement, this.option.selector)
      targetElement.style.position = 'fixed';
      targetElement.style.top = `${rect.top}px`;
      targetElement.style.left = `${rect.left}px`;
      targetElement.style.width = `${rect.width}px`;
      targetElement.style.height = `${rect.height}px`;
      targetElement.style.zIndex = '999999';
      targetElement.setAttribute('random', Math.random().toString());
      // NodeUtils.insertAfter
      targetUserElement.parentNode.insertBefore(targetElement, targetUserElement.nextSibling);
    } else {
      targetElement.setAttribute('dom-render-side', 'server');
      targetElement.innerHTML = DomRenderRootDefaultTemplate;
      // console.log('server side')
    }


    // const targetElement = this.option.window.document.querySelector(this.option.selector);
    // const {rootObject: domRenderRoot, config } = DomRender.runSet({rootObject: this.domRenderRootObject, target: targetElement, config: this.domRenderConfig});
    const domRender = new DomRender({
      rootObject: this.domRenderRootObject,
      target: targetElement,
      config: this.domRenderConfig
    });
    this.simstanceManager.setStoreSet(DomRender, domRender);
    this.domRenderRootObject = domRender.rootObject;
    routerProcess({path: '', routers: [this.option.rootRouter]}, DomRenderRootObject);

    // 작업테스크 옮겨줘야 비동기적으로 처리됨에 깜빡임 없앨수있다.
    this.domRenderRootObject.addOnChildRawSetRenderedDebounceCallback(() => {
      const hasDone = targetElement.hasAttribute('dom-render-done');
      // console.log('----domRenderRootObject rendered-----', hasDone);
      if (!hasDone) {
          targetElement.setAttribute('dom-render-done', 'done');
        if (ValidUtils.isBrowser()) {
          targetElement.style.position = originPosition;
          targetElement.style.top = originTop;
          targetElement.style.left = originLeft;
          targetElement.style.width = originWidth;
          targetElement.style.height = originHeight;
          targetElement.style.zIndex = originZIndex;
          targetUserElement.remove();
        } else {
        }
      }
    });

    // dom-render 라우팅 끝나면
    this.domRenderRouter.observable.pipe(filter(it => it.triggerPoint === 'end')).subscribe(it => {
      // console.log('this.domRenderRouter.observable.subscribe---------------', it)
      //   console.log('this.domRenderRouter.observable', it)
      // const intent = new Intent(it.path || '/');
      const targetPath = (it.path || '/') + (it.search);
      const intent = new Intent(targetPath);
      //   // TODO: 왜 canActivate가 두번 호출되는지 확인 필요!! 그래서 setTimeout으로 처리함 원인 모르겠음 아 씨발
      this.routing<SimAtomic, any>(intent, {router: this.domRenderRootObject}).then(async it => {
        // console.log('simplebootfront simpleboot routing-------->', it)
        // dom-render 라우팅 끝나면 -> simple-boot-front routing start!
        this.routingSubject.next({triggerPoint: 'start', routerModule: it});
        let findFirstRouter = it.firstRouteChainValue;
        if (findFirstRouter && findFirstRouter.constructor === this.option.rootRouter) {
          const rootRouter = getDomRenderOriginObject(this.rootRouter?.obj);
          const findRouter = getDomRenderOriginObject(findFirstRouter);
          await this.domRenderRootObject.canActivate(undefined, findRouter);
          await this.domRenderRootObject.onRouting({intent, routerModule: it, routerManager: this.routerManager});
        }
        // console.log('----> simplebootfront simpleboot routing done-------->', it, it.intent.uri)
        this.routingSubject.next({triggerPoint: 'end', routerModule: it});
        //       }, 0);
      });
    });
    return simstanceManager;
  }

  async goRouting(url: string) {
    await this.domRenderRouter?.go({path: url});
    // this.afterSetting();
  }

  async getIntent(url: string | Intent) {
    const intent = typeof url === 'string' ? new Intent(url) : url;
    const data = await this.routing<SimAtomic, any>(intent);
    return data;
  }

  public run(otherInstanceSim?: Map<ConstructorType<any>, any>, url?: string) {
    const simstanceManager = this.initRun(otherInstanceSim);
    // const currentUrl = UrlUtils.toUrl(this.option.window.location.href);
    // const origin = currentUrl.origin;
    // const path = `${url ? origin + (url ?? '/') : currentUrl.href}`;
    // console.log('gorouting!!',path);
    // this.domRenderRouter.go({path: path});
    return this;
  }

  // private dispatchPopStateEvent(noSimpleBootFrontRouting?: boolean) {
  //   const state: PopStateType = this.routerAndSettingData
  //     ? { type: 'popstateData', noSimpleBootFrontRouting, router: this.routerAndSettingData.routerAtomic.getValue() }
  //     : undefined;
  //   // console.log('dispatchPopState', state)
  //   this.option.window.dispatchEvent(new PopStateEvent('popstate', { triggerPoint: state }));
  // }

  // TODO: 이거 나중에 없에야될것같은데 이제 안쓰는거라..훔.. 남겨둬야하나..훔..
  //   private afterSetting() {
  //     this.option.window.document.querySelectorAll('[router-link]').forEach(it => {
  //       const link = it.getAttribute('router-link');
  //       if (link && this.domRenderRouter) {
  //         const activeClasss = it.getAttribute('router-active-class');
  //         const aClasss = activeClasss?.split(',');
  //         const inActiveClasss = it.getAttribute('router-inactive-class');
  //         const iClasss = inActiveClasss?.split(',');
  //         if (this.domRenderRouter.getPathName() === link) {
  //           if (aClasss && aClasss.length > 0) {
  //             it.classList.add(...aClasss);
  //           }
  //           if (iClasss && iClasss.length > 0) {
  //             it.classList.remove(...iClasss);
  //           }
  //         } else {
  //           if (aClasss && aClasss.length > 0) {
  //             it.classList.remove(...aClasss);
  //           }
  //           if (iClasss && iClasss.length > 0) {
  //             it.classList.add(...iClasss);
  //           }
  //         }
  //       }
  //     });
  //   }

  public initDomRenderConfigSetting() {
    const simstanceManager = this.simstanceManager;
    scripts.forEach((val, name) => {
      this.domRenderConfig.scripts![name] = function (...args: any) {
        let obj: any;
        try {
          obj = simstanceManager.getOrNewSim({target: val});
        } catch (e) {
          obj = simstanceManager.newSim({target: val});
        }
        const render = this.__render as Render;
        const scriptRunnable = obj as ScriptRunnable;
        if (render.rawSet) {
          scriptRunnable.rawSets.set(render.rawSet, this);
        }
        return scriptRunnable.run(...args);
      };
    });

    const selectors = componentSelectors;
    selectors.forEach((val, name) => {
      const component = getComponent(val);
      const items = RawSet.createComponentTargetElement({
        name: name,
        noStrip: component?.noStrip === true,
        objFactory: (e, obj, r, counstructorParam) => {
          let newSim;
          if (counstructorParam?.length) {
            newSim = new val(...counstructorParam);
          } else {
            newSim = this.simstanceManager.newSim({target: val});
          }

          if (component) {
            const proxys = (Array.isArray(component.proxy) ? component.proxy : [component.proxy]).filter(isDefined);
            proxys.forEach(it => {
              if (typeof it === 'object') {
                newSim = new Proxy(newSim, it);
              } else {
                newSim = new Proxy(newSim, this.simstanceManager.newSim({target: it}));
              }
            });
          }

          return newSim;
        },
        template: component?.template,
        styles: component?.styles
      });

      this.domRenderTargetElements.push(items);
    });

    this.domRenderConfig.eventVariables = {
      $router: this.domRenderRouter,
      $application: this
    };

    // console.log('---------------------scripts', this.domRenderConfig.scripts);
  }

  public getSimstanceManager() {
    return this.simstanceManager;
  }

  // public go(url: string) {
  //     this.getSimstanceManager().getOrNewSim({target:Navigation})?.go({path:url});
  // }
}
