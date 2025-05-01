export interface OnDrThisBind {
    onDrThisBind(): void;
}
export const isOnDrThisBind = (obj: any): obj is OnDrThisBind => {
    return typeof obj?.onDrThisBind === 'function';
}