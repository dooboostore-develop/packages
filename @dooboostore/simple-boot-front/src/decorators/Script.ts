import { ConstructorType } from '@dooboostore/core/types.js';
import { ReflectUtils } from '@dooboostore/simple-boot/utils/reflect/ReflectUtils';
import { ScriptRunnable } from '../script/ScriptRunnable';

export const scripts = new Map<string, ConstructorType<ScriptRunnable>>();
export interface ScriptConfig {
    name?: string
}

export const ScriptMetadataKey = Symbol('Script');

export type GenericClassDecorator<T> = (target: T) => void;

export const Script = (config?: ScriptConfig): GenericClassDecorator<ConstructorType<ScriptRunnable>> => {
    return (target: ConstructorType<any>) => {
        // default set
        if (!config) {
            config = {}
        }
        if (!config.name) {
            config.name = target.name;
        }
        scripts.set(config.name, target);
        ReflectUtils.defineMetadata(ScriptMetadataKey, config, target);
        return target;
    }
}

export const getScript = (target: ConstructorType<any> | Function | any): ScriptConfig | undefined => {
    if (target && typeof target === 'object') {
        target = target.constructor;
    }
    try {
        return ReflectUtils.getMetadata(ScriptMetadataKey, target);
    } catch (e) {
    }
}
