import { RoutingDataSet } from '../route/RouterManager';

export namespace RouterAction {
  export interface CanActivate {
    canActivate(url: RoutingDataSet, data?: any): Promise<void>;
  }
  export const isCanActivate = (obj: any): obj is CanActivate => {
    return typeof obj?.canActivate === 'function';
  };

  export interface OnRouting {
    onRouting(r: RoutingDataSet): Promise<void>;
  }

  export const isOnRouting = (obj: any): obj is OnRouting => {
    return typeof obj?.onRouting === 'function';
  };

  export interface HasActivate {
    hasActivate(checkObj: any): boolean;
  }

  export const isHasActivate = (obj: any): obj is HasActivate => {
    return typeof obj?.hasActivate === 'function';
  };
}
