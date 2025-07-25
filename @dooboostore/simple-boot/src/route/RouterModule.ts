import { ConstructorType, isDefined } from '@dooboostore/core/types';
import {SimAtomic} from '../simstance/SimAtomic';
import {Intent} from '../intent/Intent';
import {SimstanceManager} from '../simstance/SimstanceManager';
import {getInjection} from '../decorators/inject/Injection';
import { MethodNoSuch } from '../throwable/MethodNoSuch';
import { getRoute, getRouter, getRoutes } from '../decorators/route/Router';
import { Expression } from '@dooboostore/core/expression/Expression';

export class RouterModule<R = SimAtomic, M = any> {
    private _pathData?: Expression.Path.PathNameData;
    private _data?: any;
    private _intent?: Intent;
    private _propertyKeys?: (string | symbol)[];
    private _path?: string;

    public get path(): string | undefined {
        return this._path;
    }

    public set path(value: string | undefined) {
        this._path = value;
    }

    public get data(): any {
        return this._data;
    }

    public set data(value: any) {
        this._data = value;
    }

    public get intent(): Intent | undefined {
        return this._intent;
    }

    public set intent(value: Intent | undefined) {
        this._intent = value;
    }

    public get propertyKeys(): (string | symbol)[] | undefined {
        return this._propertyKeys;
    }

    public set propertyKeys(value: (string | symbol)[] | undefined) {
        this._propertyKeys = value;
    }

    public get pathData(): Expression.Path.PathNameData | undefined {
        return this._pathData;
    }

    public set pathData(value: Expression.Path.PathNameData | undefined) {
        this._pathData = value;
    }


    constructor(private simstanceManager: SimstanceManager, public router?: R, public module?: {targetKeyType? : ConstructorType<any> | Function, originalType: ConstructorType<any> | Function}, public routerChains: R[] = []) {
    }

    getRouterPath(join = '') {
        return this.getRouterPaths().map(it=>it??'').join(join)
    }

    getRouterPaths() {
        return this.routerChains.map(it => getRouter(it instanceof SimAtomic ? it.type : it)?.path);
    }

    getRouterPathData(pathName: string) {
       return Expression.Path.pathNameData(pathName, this.getRouterPath());
    }

    getModuleInstance<T = M>(): T | undefined ;
    getModuleInstance<T = M>(propertyKey?: string | symbol, instanceBind: boolean | any = true): T | undefined {
        const instance = this.simstanceManager.getOrNewSim<T>({target:this.module?.targetKeyType, originTypeTarget: this.module?.originalType});
        if (propertyKey && this.propertyKeys && this.propertyKeys.includes(propertyKey)) {
            let instanceElement = (instance as any)[propertyKey];
            if (instanceBind && typeof instanceBind === 'boolean') {
                instanceElement = instanceElement.bind(instance);
            } else if (instanceBind && typeof instanceBind === 'object') {
                instanceElement = instanceElement.bind(instanceBind);
            }
            return instanceElement;
        } else {
            return instance;
        }
    }

    executeModuleProperty(propertyKey: string | symbol, ...param: any[]): any {
        const target = this.getModuleInstance() as any;
        if (propertyKey) {
            const config = getInjection(target, propertyKey);
            if (config) {
                const other = new Map<any, any>();
                param.forEach(it => other.set(it.constructor, it));
                return this.simstanceManager.executeBindParameterSim({target, targetKey: propertyKey}, other)
            } else {
                if (target[propertyKey]) {
                    return target[propertyKey]?.(...param);
                } else {
                    throw new MethodNoSuch(`${propertyKey.toString()} noSuch`, propertyKey.toString(), propertyKey)
                }
            }
        }
    }

    get lastRouteChain() {
        return this.routerChains[this.routerChains.length - 1];
    }

    get lastRouteChainValue() {
        return (this.lastRouteChain as unknown as SimAtomic<any>).getValue();
    }

    hasActivateInLastRoute(obj: any) {
        return this.lastRouteChainValue?.hasActivate(obj) === true;
    }

    get queryParams(): { [key: string]: string } | undefined {
        if (this.intent) {
            return this.intent.queryParams;
        }
    }

    get queryParamsAfterDecodeURI(): { [key: string]: string } | undefined {
        if (this.intent) {
            return this.intent.queryParamsAfterDecodeURI;
        }
    }
}
