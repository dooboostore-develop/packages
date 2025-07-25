import { ConstructorType, GenericClassDecorator } from '@dooboostore/core/types';
import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';
import { SimConfigProxy, SimConfigUsing } from '@dooboostore/simple-boot/decorators/SimDecorator';

export const componentSelectors = new Map<string, ConstructorType<any>>();
export interface ComponentConfig {
    selector?: string;
    noStrip?: boolean;
    template?: string;
    styles?: (string)[]  | string;
    proxy?: SimConfigProxy;
    using?: SimConfigUsing;
}

export const ComponentMetadataKey = Symbol('Component');

// Partial<ComponentConfig>
const componentProcess = (config: ComponentConfig, target: ConstructorType<any>) => {
    if (!config.selector) {
        config.selector = target.name.toLowerCase();
    }
    ReflectUtils.defineMetadata(ComponentMetadataKey, config, target);
    componentSelectors.set(config.selector.toLowerCase(), target);
}
export function Component(target: ConstructorType<any>): void;
export function Component(config: ComponentConfig): GenericClassDecorator<ConstructorType<any>>;
export function Component(configOrTarget: ConstructorType<any> | ComponentConfig): void | GenericClassDecorator<ConstructorType<any>> {
    if (typeof configOrTarget === 'function') {
        componentProcess({}, configOrTarget);
    } else {
        return (target: ConstructorType<any>) => {
            componentProcess(configOrTarget, target);
        }
    }
}

export const getComponent = (target: ConstructorType<any> | Function | any): ComponentConfig | undefined => {
    if (target && typeof target === 'object') {
        target = target.constructor;
    }
    try {
        return ReflectUtils.getMetadata(ComponentMetadataKey, target);
    } catch (e) {
    }
}
