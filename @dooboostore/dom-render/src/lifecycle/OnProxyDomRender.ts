import {Config} from '../configs/Config';

export interface OnProxyDomRender {
    onProxyDomRender(config: Config): void;
}
export const isOnProxyDomRender = (obj: any): obj is OnProxyDomRender =>
    typeof obj?.onProxyDomRender === 'function';