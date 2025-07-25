import 'reflect-metadata'
import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';

export interface EventListenerOption {
    target: string | any;
    name: string;
}
const EventListenerMetadataKey = Symbol('EventListener');
export const EventListener = (option: EventListenerOption) => {
    return ReflectUtils.metadata(EventListenerMetadataKey, option);
}

export const getEventListener = (target: any, propertyKey: string): EventListenerOption | undefined => {
    return ReflectUtils.getMetadata(EventListenerMetadataKey, target, propertyKey);
}
