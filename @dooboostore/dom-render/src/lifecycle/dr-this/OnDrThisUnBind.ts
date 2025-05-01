export interface OnDrThisUnBind {
    onDrThisUnBind(): void;
}
export const isOnDrThisUnBind = (obj: any): obj is OnDrThisUnBind => {
    return typeof obj?.onDrThisUnBind === 'function';
}