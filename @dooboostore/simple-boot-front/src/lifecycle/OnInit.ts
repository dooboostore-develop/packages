import { RawSet } from '@dooboostore/dom-render/rawsets/RawSet';
export type OnInitParameter = {
    makerObj: any;
    rawSet: RawSet;
}
export interface OnInit {
    onInit(...data: any): any;
}
export const isOnInit = (obj: any): obj is OnInit => {
    return obj && typeof obj.onInit === 'function';
}