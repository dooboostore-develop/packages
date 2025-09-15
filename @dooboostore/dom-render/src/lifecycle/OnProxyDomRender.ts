import {DomRenderConfig} from 'configs/DomRenderConfig';

export interface OnProxyDomRender {
    onProxyDomRender(config: DomRenderConfig): void;
}
export const isOnProxyDomRender = (obj: any): obj is OnProxyDomRender =>
    typeof obj?.onProxyDomRender === 'function';