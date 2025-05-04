export interface OnBeforeReturnSet {
    onBeforeReturnSet(name: string, value: any, fullPath?: string[]): void;
}
export function isOnBeforeReturnSet(obj: any): obj is OnBeforeReturnSet {
    return typeof obj?.onBeforeReturnSet === 'function';
}
