import { ConstructorType } from '@dooboostore/core/types';

export type ProxyHandlerType = { onProxy: <T>(it: T) => T };
export type InitOptionType = { rootRouter?: ConstructorType<any>, container?: string, excludeSim?: (ConstructorType<any> | Function)[], advice?: ConstructorType<any>[], proxy?: ProxyHandlerType };

export class SimOption {
    public rootRouter?: ConstructorType<any>
    public container?: string;
    public advice: ConstructorType<any>[];
    public proxy?: ProxyHandlerType;
    public excludeSim: ((ConstructorType<any> | Function)[]) | ((type: (ConstructorType<any> | Function)) => boolean);
    constructor({rootRouter, container, excludeSim = [], advice = [], proxy}: InitOptionType = {}) {
        this.rootRouter = rootRouter;
        this.container = container;
        this.advice = advice;
        this.excludeSim = excludeSim;
        this.proxy = proxy;
    }

    addAdvicce(advice: ConstructorType<any>) {
        this.advice.push(advice);
    }

    setAdvice(...advice: ConstructorType<any>[]): SimOption {
        this.advice = advice;
        return this;
    }
}
