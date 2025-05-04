export interface OnSimCreateCompleted<T = any> {
    onSimCreateProxyCompleted(proxyThis: T): void;
}
export const isOnSimCreateProxyCompleted = (obj: any): obj is OnSimCreateCompleted => {
    return typeof obj?.onSimCreateProxyCompleted === 'function';
}

