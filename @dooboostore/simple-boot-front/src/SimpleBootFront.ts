import { SimFrontOption } from './option/SimFrontOption';
import { ConstructorType } from '@dooboostore/core/types.js';
import { componentSelectors, getComponent } from './decorators/Component';
import { scripts } from './decorators/Script';
import { DomRender, RunConfig } from '@dooboostore/dom-render/DomRender';
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

export class SimpleBootFront extends SimpleApplication {
    public domRendoerExcludeProxy:  ConstructorType<any>[] = [
      SimpleApplication,
        IntentManager,
        RouterManager,
        SimstanceManager,
        SimFrontOption,
        ViewService,
        Router as ConstructorType<any>,
        typeof HTMLElement !== 'undefined' ? HTMLElement : null,
        typeof CanvasRenderingContext2D !== 'undefined' ? CanvasRenderingContext2D : null,
        typeof CanvasPattern !== 'undefined' ? CanvasPattern : null,
        typeof CanvasGradient !== 'undefined' ? CanvasGradient : null
    ];
    public domRenderTargetElements: TargetElement[] = [];
    public domRenderTargetAttrs: TargetAttr[] = [];
    public domRenderConfig: RunConfig;
    private domRenderRouter: Router | undefined;

    constructor(public option: SimFrontOption) {
        super(option);
        this.domRendoerExcludeProxy = this.domRendoerExcludeProxy.filter(it => it !== null);

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
            scripts: {application: this},
            // applyEvents: [{
            //     attrName: 'router-link',
            //     callBack: (elements: Element, attrValue: string, obj: any) => {
            //         elements.addEventListener('click', (event) => {
            //             this.getSimstanceManager().getOrNewSim({target:Navigation})?.go(attrValue)
            //         })
            //     }
            // }],
            eventVariables: {
            },
            proxyExcludeTyps: this.domRendoerExcludeProxy,
            operatorAround: {
            }
        };
        (this.option.window as any).__dirname = 'simple-boot-front__dirname';
        (this.option.window as any).__SimpleBootFront = this;

        option.proxy = {
            onProxy: (it: any) => this.createDomRender(it)
        };
    }

    public getComponentInnerHtml(targetObj: any, id: string) {
        const component = getComponent(targetObj)
        const styles = RawSet.generateStyleTransform(component?.styles??'', id);
        const template = (component?.template ?? '');
        return styles + template;
    }

    public createDomRender<T extends object>(obj: T): T {
        const component = getComponent(obj);
        if (component && typeof obj === 'object') {
            const result = DomRender.run({rootObject:obj, config:this.domRenderConfig});
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
        this.initWriteRootRouter();

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
                const intent = new Intent(this.domRenderRouter.getUrl() || '/');
                // console.log('intent-----------', intent)
                // TODO: 왜 canActivate가 두번 호출되는지 확인 필요!! 그래서 setTimeout으로 처리함 원인 모르겠음 아 씨발
                setTimeout(()=>{
                    this.routing<SimAtomic, any>(intent).then(it => {
                        this.afterSetting();
                    });
                }, 0)
            }
        });
        return simstanceManager;
    }

    public initWriteRootRouter() {
        const routerAtomic = this.writeRootRouter();
        const target = this.option.window.document.querySelector(this.option.selector);
        if (target && routerAtomic && routerAtomic.getValue()) {
            const val = routerAtomic.getValue() as any;
            const domRenderProxy = val._DomRender_proxy as DomRenderProxy<any>
            domRenderProxy.initRender(target);
            // console.log('initWriteRootRouter', val);
            (val as any)?.onInit?.();
        }
    }

    public writeRootRouter() {
        const routerAtomic = new SimAtomic(this.option.rootRouter, this.getSimstanceManager());
        const target = this.option.window.document.querySelector(this.option.selector);
        if (target && routerAtomic.getValue()) {
            const id = 'root-router';
            const startEndPoint = RawSet.createStartEndPoint({node:target, id, type:RawSetType.TARGET_ELEMENT}, this.domRenderConfig);
            target.innerHTML = '';
            target.appendChild(startEndPoint.start);
            target.insertAdjacentHTML('beforeend', this.getComponentInnerHtml(this.option.rootRouter, id));
            target.appendChild(startEndPoint.end);
        }
        return routerAtomic;
    }

    async goRouting(url: string) {
        // this.navigation.go({path:url, disabledPopEvent: true});
        // const intent = new Intent(this.navigation.getUrl() ?? '');
        // const data = await this.routing<SimAtomic, any>(intent);
        // this.afterSetting();
        // return data;
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
                    obj = simstanceManager.getOrNewSim({target:val});
                } catch (e) {
                    obj = simstanceManager.newSim({target:val})
                }
                const render = this.__render as Render;
                const scriptRunnable = obj as ScriptRunnable;
                if (render.rawSet) {
                    scriptRunnable.rawSets.set(render.rawSet, this);
                }
                return scriptRunnable.run(...args);
            }
        })
    }

    private initDomRenderTargetElements() {
        const selectors = componentSelectors;
        selectors.forEach((val, name) => {
            const component = getComponent(val);
            const items = RawSet.createComponentTargetElement(
                name,
                (e, obj, r, counstructorParam) => {
                    let newSim;
                    if (counstructorParam?.length) {
                        newSim = new val(...counstructorParam);
                    } else {
                        newSim = this.simstanceManager.newSim({target:val});
                    }
                    return newSim
                },
                component?.template,
                component?.styles
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
