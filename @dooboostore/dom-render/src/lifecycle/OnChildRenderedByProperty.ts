import { RawSet } from '../rawsets/RawSet';

export interface OnChildRenderedByProperty {
    onChildRenderedByProperty(key: string, value: any): void;
}

export function isOnChildRenderedByProperty(obj: any): obj is OnChildRenderedByProperty {
    return typeof obj?.onChildRenderedByProperty === 'function';
}