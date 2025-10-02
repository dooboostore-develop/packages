import { RawSet } from '../rawsets/RawSet';

export interface OnInitRender {
    onInitRender(param: any, rawSet:RawSet): Promise<void>;
}

export function isOnInitRender(obj: any): obj is OnInitRender {
    return typeof obj?.onInitRender === 'function';
}