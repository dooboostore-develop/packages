import { Intent } from '../intent/Intent';
import { RouterModule } from '../route/RouterModule';
import { RouterManager } from '../route/RouterManager';

export type RoutingDataSet = {
intent: Intent, routerModule: RouterModule, routerManager: RouterManager
}
export interface RouterAction {
    canActivate(url: RoutingDataSet, data?:  any ): Promise<void>;
    hasActivate?(checkObj: any): boolean;
}

export const isRouterAction = (obj: any): obj is RouterAction => {
    if (!obj) return false;
    return typeof obj.canActivate === 'function';
}
