import { RawSet } from '../rawsets/RawSet';

export type OnDestroyRenderParams = { rawSet: RawSet };

export interface OnDestroyRender {
    onDestroyRender(data: OnDestroyRenderParams): void;
}

export const isOnDestroyRender = (obj: any): obj is OnDestroyRender => {
    return typeof obj?.onDestroyRender === 'function';
};