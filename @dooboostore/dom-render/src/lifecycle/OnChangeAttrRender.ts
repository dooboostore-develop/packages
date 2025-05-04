import { RawSet } from '../rawsets/RawSet';

export type OtherData = {
    rawSet?: RawSet
}
export interface OnChangeAttrRender {
    onChangeAttrRender(name: string, value: any, other: OtherData): void;
}

export const isOnChangeAttrRender = (obj: any): obj is OnChangeAttrRender => {
    return typeof obj?.onChangeAttrRender === 'function';
}
