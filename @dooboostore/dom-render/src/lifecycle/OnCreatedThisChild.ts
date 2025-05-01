import { OnCreateRenderDataParams } from '../lifecycle/OnCreateRenderData';


export interface OnCreatedThisChild {
  onCreatedThisChild(child: any, childData: OnCreateRenderDataParams): void;
}

export const isOnCreatedThisChild= (obj: any): obj is OnCreatedThisChild => {
  return typeof obj?.onCreatedThisChild === 'function';
}