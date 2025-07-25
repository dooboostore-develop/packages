import { getSim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { AroundForceReturn } from '@dooboostore/simple-boot/decorators/aop/AOPDecorator';
import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';

export const LoadAroundBefore = (obj: any, propertyKey: string, args: any[]) => {
    const simstanceManager = obj._SimpleBoot_simstanceManager;
    const simOption = obj._SimpleBoot_simOption;
    const config = getSim(obj);
    if (simstanceManager && simOption && config?.scheme) {
        const key = config.scheme + '_' + propertyKey;
        const type = ReflectUtils.getReturnType(obj, propertyKey);
        const isHas = (key in (simOption.window.server_side_data ?? {}))
        if (isHas) {
            const data = simOption.window.server_side_data?.[key];
            delete simOption.window.server_side_data?.[key];
            let rdata;
            if (type === Promise) {
                rdata = Promise.resolve(data);
            } else {
                rdata = data;
            }
            throw new AroundForceReturn(rdata);
        } else {
            return args;
        }
    }
    return args;
}
