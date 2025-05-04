// TODO: 나중에 넣어야될까 자식element가 완료되었을때는 on-rendered..뭐이런게있어서.  이게 다른 프레임워크처럼 자식들이 다 만들어지고 내가 만들어지는게 아니라. 비동기적으로 이루어지니깐 알수가없긴한데..
// 훔.. 우선 보류 아무도 사용하는곳은 없음
/**
 * @deprecated  아직 적용안됨
 */
export interface OnCreateRendered {
  onCreateRendered(...param: any[]): void;
}
export const isOnCreateRendered = (obj: any): obj is OnCreateRendered => {
  return typeof obj?.onCreateRendered === 'function';
}