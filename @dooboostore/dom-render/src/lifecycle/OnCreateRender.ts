export interface OnCreateRender {
  onCreateRender(...param: any[]): void;
}
export const isOnCreateRender = (obj: any): obj is OnCreateRender => {
  return typeof obj?.onCreateRender === 'function';
}