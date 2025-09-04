import { SimFrontOption } from './option/SimFrontOption';
import { ConstructorType, isDefined } from '@dooboostore/core/types';
import { componentSelectors, getComponent } from './decorators/Component';
import { scripts } from './decorators/Script';
import { DomRender, DomRenderRunConfig } from '@dooboostore/dom-render/DomRender';
import { SimAtomic } from '@dooboostore/simple-boot/simstance/SimAtomic';
import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { Intent } from '@dooboostore/simple-boot/intent/Intent';
import { ViewService } from './service/view/ViewService';
import { SimstanceManager } from '@dooboostore/simple-boot/simstance/SimstanceManager';
import { IntentManager } from '@dooboostore/simple-boot/intent/IntentManager';
import { RouterManager } from '@dooboostore/simple-boot/route/RouterManager';
import { DomRenderProxy } from '@dooboostore/dom-render/DomRenderProxy';
import { RawSet } from '@dooboostore/dom-render/rawsets/RawSet';
import { RawSetType } from '@dooboostore/dom-render/rawsets/RawSetType';
import { Render } from '@dooboostore/dom-render/rawsets/Render';
import { TargetAttr } from '@dooboostore/dom-render/configs/TargetAttr';
import { TargetElement } from '@dooboostore/dom-render/configs/TargetElement';
import { ScriptRunnable } from './script/ScriptRunnable';
import { Router } from '@dooboostore/dom-render/routers/Router';
import { HashRouter } from '@dooboostore/dom-render/routers/HashRouter';
import { PathRouter } from '@dooboostore/dom-render/routers/PathRouter';
import { RandomUtils } from '@dooboostore/core/random/RandomUtils';
import { isOnInit } from './lifecycle/OnInit';
import { EventManager } from '@dooboostore/dom-render/events/EventManager';
import { Config } from '@dooboostore/dom-render';

export class SimpleBootFront extends SimpleApplication {
  public domRendoerExcludeProxy: ConstructorType<any>[] = [
    SimpleApplication,
    IntentManager,
    RouterManager,
    SimstanceManager,
    SimFrontOption,
    ViewService,
    Router as ConstructorType<any>,

  ];
  public domRenderTargetElements: TargetElement[] = [];
  public domRenderTargetAttrs: TargetAttr[] = [];
  public domRenderConfig: DomRenderRunConfig;
  private domRenderRouter: Router | undefined;

  constructor(public option: SimFrontOption) {
    super(option);
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
    this.domRenderRouter = option.urlType === 'path' ? new PathRouter({window: option.window, disableAttach: true}) : new HashRouter({window: option.window, disableAttach: true});
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
        application: this,
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
      onProxy: (it: any) => this.createDomRender(it)
    };
  }

  public getComponentInnerHtml(targetObj: any, id: string) {
    const component = getComponent(targetObj)
    const styles = RawSet.generateStyleTransform(component?.styles ?? '', id);
    const template = (component?.template ?? '');
    return styles + template;
  }

  public createDomRender<T extends object>(obj: T): T {
    const component = getComponent(obj);
    if (component && typeof obj === 'object') {
      // 나중에 헛갈리겠는데??  이거 normalattribute 때문에 DomrenderPRoxy set 쪽에서 ㅡㅡ root를 찾아가야되기때문에 ref를 계속 가져가야함.
      // console.log('fffffffffffffffffffffffffffff', obj);
      const result = DomRender.run({rootObject: obj, config: this.domRenderConfig});
      return result;
      // this.domRenderRouter = domRenderResult.config.router;
      // this.simstanceManager.getOrNewSim({target:Navigation})?.routers.push(this.domRenderRouter);
      // console.log('createDomRender', this.domRenderRouter)
      // return domRenderResult.rootObject;
    }
    return obj;
  }

  private initRun(otherInstanceSim?: Map<ConstructorType<any>, any>) {
    const simstanceManager = super.run(otherInstanceSim);
    this.initDomRenderScripts();
    this.initDomRenderTargetElements();


    // this.navigation.domRenderConfig = this.domRenderConfig;
    // rootRouter first draw
    const target = this.option.window.document.querySelector(this.option.selector) as HTMLElement;
    const targetChildNodes = Array.from(target.childNodes)
    let isClenBody = targetChildNodes.length > 0

    // console.log('------------', EventManager.attrNames)

    // 이미 body가 존재할때 기존거 동작이 되어버림에 따라 지워준다
    // this.option.window.addEventListener('popstate', (event) => { 에서 처리후  자식들 지워준다  깜빡임 없에기위해
    if (isClenBody) {
      const deleteAttr = [...EventManager.attrNames, ...RawSet.DR_ATTRIBUTES];
      const iterator = this.option.window.document.createNodeIterator(
        target,
        NodeFilter.SHOW_ELEMENT
      );
      let currentNode;
      while ((currentNode = iterator.nextNode())) {
        const element = currentNode as Element;
        deleteAttr.forEach(attrName => {
          if (element.hasAttribute(attrName)) {
            element.removeAttribute(attrName);
          }
        });
      }
    }
    // const targetChildren = target.children();
    const routerAndSettingData = this.initWriteRootRouter(target);

    this.domRenderConfig.eventVariables = {
      $router: this.domRenderRouter,
      $application: this
    }


    this.option.window.addEventListener('intent', (event) => {
      const cevent = event as CustomEvent
      this.publishIntent(new Intent(cevent.detail.uri, cevent.detail.data, event));
    });

    this.option.window.addEventListener('popstate', (event) => {
      if (this.domRenderRouter) {
        // console.log('?????????????????????????????')
        const intent = new Intent(this.domRenderRouter.getUrl() || '/');
        // console.log('intent-----------', intent)
        // TODO: 왜 canActivate가 두번 호출되는지 확인 필요!! 그래서 setTimeout으로 처리함 원인 모르겠음 아 씨발
        setTimeout(() => {
          this.routing<SimAtomic, any>(intent).then(it => {
            console.log('routing------', it)
            this.afterSetting();

            // console.log('------------!!!!!', targetChildNodes, targetChildNodes.length);
            if (isClenBody) {
              setTimeout(() => {
                while (target.firstChild && (target.firstChild as HTMLElement).id !== (routerAndSettingData.point.start as HTMLElement).id) {
                  // console.log('remove??????')
                  target.removeChild(target.firstChild);
                }
              }, 0);
              isClenBody = false
            }
          });
        }, 0)
      }
    });
    return simstanceManager;
  }

  public initWriteRootRouter(target: Element) {
    const routerAndSettingData = this.writeRootRouter(target);
    // console.log('--start', startEndPoint);

    // while (target.firstChild && target.firstChild !== startEndPoint.start) {
    //   console.log('remove??????')
    //   target.removeChild(target.firstChild);
    // }
    //         console.log('remove??????end?')

    if (target && routerAndSettingData.routerAtomic && routerAndSettingData.routerAtomic.getValue()) {
      const val = routerAndSettingData.routerAtomic.getValue() as any;
      // 여기서 domrender 시작하네??
      const domRenderProxy = val._DomRender_proxy as DomRenderProxy<any>
      const rawSet = new RawSet(
        routerAndSettingData.uuid,
        RawSetType.TARGET_ELEMENT,
        {
          start: routerAndSettingData.point.start,
          end: routerAndSettingData.point.end,
          node: target
        },
          {config: this.domRenderConfig as Config, fragment: {} as any}
      );
      domRenderProxy.initRender(target, rawSet);
      // console.log('initWriteRootRouter', val);
      if (isOnInit(val)) {
        val.onInit();
      }
      // setTimeout(()=>{ // ssr일때 이미 채워져서 내려오는경우 깜빡임 없애기위해서.
      //   while (target.firstChild && (target.firstChild as HTMLElement).id !== (startEndPoint.start as HTMLElement).id) {
      //     console.log('remove??????')
      //     target.removeChild(target.firstChild);
      //   }
      // },100);
    }
    return routerAndSettingData;
  }

  public writeRootRouter(target: Element) {
    const routerAtomic = new SimAtomic({targetKeyType: this.option.rootRouter!, originalType: this.option.rootRouter!}, this.getSimstanceManager());
    // const target = this.option.window.document.querySelector(this.option.selector);

    const uuid = RandomUtils.uuid();
    const id = `root-router-${uuid}`;
    const point = RawSet.createStartEndPoint({node: target, id, type: RawSetType.TARGET_ELEMENT}, this.domRenderConfig as Config);
    if (target && routerAtomic.getValue()) {
      // target.innerHTML = '';
      // p.appendChild(startEndPoint.start);
      // p.insertAdjacentHTML('beforeend', this.getComponentInnerHtml(this.option.rootRouter, id));
      // p.appendChild(startEndPoint.end);
      //
      target.appendChild(point.start);
      target.insertAdjacentHTML('beforeend', this.getComponentInnerHtml(this.option.rootRouter!, id));
      target.appendChild(point.end);
      // target.innerHTML = this.getComponentInnerHtml(this.option.rootRouter, id);
      // target.insertBefore(startEndPoint.start, target.firstChild);
      // target.appendChild(startEndPoint.start);
      // target.appendChild(startEndPoint.end);
    }
    return {point, uuid, routerAtomic};
  }

  async goRouting(url: string) {
    await this.domRenderRouter?.go({path: url, disabledPopEvent: false});
    this.afterSetting();
  }

  async getIntent(url: string | Intent) {
    const intent = typeof url === 'string' ? new Intent(url) : url;
    const data = await this.routing<SimAtomic, any>(intent);
    return data;

  }

  // async runRouting(otherInstanceSim?: Map<ConstructorType<any>, any>, url?: string): Promise<RouterModule<SimAtomic<Object>, any> | undefined> {
  // const simstanceManager = this.initRun(otherInstanceSim);
  // if (url) {
  //     this.navigation.go({path:url, disabledPopEvent: true});
  // }
  // const intent = new Intent(this.navigation.getUrl() ?? '');
  // const data = await this.routing<SimAtomic, any>(intent);
  // this.afterSetting();
  // return data;
  // }

  public run(otherInstanceSim?: Map<ConstructorType<any>, any>, url?: string) {
    const simstanceManager = this.initRun(otherInstanceSim);
    if (url && this.domRenderRouter) {
      this.domRenderRouter.go({path: url});
    }
    this.option.window.dispatchEvent(new Event('popstate'));
    return simstanceManager;
  }

  // TODO: 이거 나중에 없에야될것같은데 이제 안쓰는거라..훔.. 남겨둬야하나..훔..
  private afterSetting() {
    this.option.window.document.querySelectorAll('[router-link]').forEach(it => {
      const link = it.getAttribute('router-link');
      if (link && this.domRenderRouter) {
        const activeClasss = it.getAttribute('router-active-class');
        const aClasss = activeClasss?.split(',');
        const inActiveClasss = it.getAttribute('router-inactive-class');
        const iClasss = inActiveClasss?.split(',');
        if (this.domRenderRouter.getPath() === link) {
          if (aClasss && aClasss.length > 0) {
            it.classList.add(...aClasss);
          }
          if (iClasss && iClasss.length > 0) {
            it.classList.remove(...iClasss);
          }
        } else {
          if (aClasss && aClasss.length > 0) {
            it.classList.remove(...aClasss);
          }
          if (iClasss && iClasss.length > 0) {
            it.classList.add(...iClasss);
          }
        }
      }
    });
  }

  public initDomRenderScripts() {
    const simstanceManager = this.simstanceManager;
    scripts.forEach((val, name) => {
      this.domRenderConfig.scripts![name] = function (...args: any) {
        let obj: any;
        try {
          obj = simstanceManager.getOrNewSim({target: val});
        } catch (e) {
          obj = simstanceManager.newSim({target: val})
        }
        const render = this.__render as Render;
        const scriptRunnable = obj as ScriptRunnable;
        if (render.rawSet) {
          scriptRunnable.rawSets.set(render.rawSet, this);
        }
        return scriptRunnable.run(...args);
      }
    })
    // console.log('---------------------scripts', this.domRenderConfig.scripts);
  }

  private initDomRenderTargetElements() {
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
              })
            }

            return newSim
          },
          template: component?.template,
          styles: component?.styles
        }
      );

      this.domRenderTargetElements.push(items);
    });
  }

  public getSimstanceManager() {
    return this.simstanceManager;
  }

  // public go(url: string) {
  //     this.getSimstanceManager().getOrNewSim({target:Navigation})?.go({path:url});
  // }
}
