import { ReflectUtils } from '@dooboostore/core';

export interface EventListenerOption {
    target: string | any;
    name: string;
}
const EventListenerMetadataKey = Symbol.for('simple-boot:event-listener-metadata');
export const EventListener = (option: EventListenerOption) => {
    return ReflectUtils.metadata(EventListenerMetadataKey, option);
}

export const getEventListener = (target: any, propertyKey: string): EventListenerOption | undefined => {
    return ReflectUtils.getMetadata(EventListenerMetadataKey, target, propertyKey);
}
