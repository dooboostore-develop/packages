import { getSim } from '@dooboostore/simple-boot/decorators/SimDecorator';

export const SaveAroundAfter = (obj: any, propertyKey: string, args: any[], beforeReturn: any) => {
    const simstanceManager = obj._SimpleBoot_simstanceManager;
    const simOption = obj._SimpleBoot_simOption;
    const config = getSim(obj);
    if (simstanceManager && simOption && config?.scheme) {
        if (!simOption.window.server_side_data) {
            simOption.window.server_side_data = {};
        }
        const key = config.scheme+'_'+propertyKey;
        if (beforeReturn instanceof Promise) {
            beforeReturn.then((it) => {
                simOption.window.server_side_data[key] = JSON.stringify(it);
                return it;
            });
        } else {
            simOption.window.server_side_data[key] = JSON.stringify(beforeReturn);
        }
    }
    return beforeReturn;
}


export const getStorage = (window: Window) => {
    return (window as any).aroundStorage;
}
