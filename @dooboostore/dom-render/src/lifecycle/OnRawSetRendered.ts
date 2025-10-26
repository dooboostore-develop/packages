import { RawSet, RenderResult } from '../rawsets/RawSet';

export type OnRawSetRenderedOtherData = {
  path?: string;
  value?: any;
  root: any;
  renderResult?: RenderResult
  //     rawSet?: RawSet
}
export interface OnRawSetRendered {
// TODO: 호출된곳에서 또 변수를 수정하게되면 무한루프니깐 왠만하면 사용못하게 해야한다.
    onRawSetRendered (rawSet: RawSet,otherData: OnRawSetRenderedOtherData): Promise<void>;
}

export const isOnRawSetRendered= (obj: any): obj is OnRawSetRendered => {
    return typeof obj?.onRawSetRendered === 'function';
}
