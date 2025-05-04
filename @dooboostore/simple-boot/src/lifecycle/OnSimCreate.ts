export interface OnSimCreate {
    onSimCreate(): void;
}
export const isOnSimCreate = (obj: any): obj is OnSimCreate => {
    return typeof obj?.onSimCreate === 'function';
}