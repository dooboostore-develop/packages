import { RawSet, RenderResult } from '../rawsets/RawSet';

export type OnRawSetRenderedOtherData = {
  renderResult?: RenderResult
  //     rawSet?: RawSet
}
export interface OnChildRawSetRendered {
    onChildRawSetRendered (): Promise<void>;
}

export const isOnChildRawSetRendered= (obj: any): obj is OnChildRawSetRendered => {
    return typeof obj?.onChildRawSetRendered === 'function';
}
