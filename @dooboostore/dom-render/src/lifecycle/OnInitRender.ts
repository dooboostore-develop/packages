export interface OnInitRender {
    onInitRender(...param: any[]): void;
}

export function isOnInitRender(obj: any): obj is OnInitRender {
    return typeof obj?.onInitRender === 'function';
}