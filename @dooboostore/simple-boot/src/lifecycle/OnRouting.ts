import { RoutingDataSet } from '../route/RouterAction';

export interface OnRouting {
    onRouting(r: RoutingDataSet): Promise<void>;
}
export const isOnRouting = (obj: any): obj is OnRouting => {
    return typeof obj?.onRouting === 'function';
}