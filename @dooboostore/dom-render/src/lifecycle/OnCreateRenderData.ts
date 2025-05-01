import { Render } from '../rawsets/Render';

export type OnCreateRenderDataParams = { rootParent: any, render?: Render };

export interface OnCreateRenderData {
  onCreateRenderData(data: OnCreateRenderDataParams): void;
}

export const isOnCreateRenderData = (obj: any): obj is OnCreateRenderData => {
  return typeof obj?.onCreateRenderData === 'function';
}