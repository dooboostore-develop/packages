import { ConstructorType } from '../types';
export namespace  ReflectUtils {
    export const getParameterTypes = (target: any, propertyKey?: string | symbol): ConstructorType<any>[] => {
      // console.log('---------param')
        if (propertyKey) {
            return Reflect.getMetadata('design:paramtypes', target, propertyKey) || [];
        } else {
            return Reflect.getMetadata('design:paramtypes', target) || [];
        }
    }


    export const getReturnType = (target: any, propertyKey: string | symbol): any  => {
        return Reflect.getMetadata('design:returntype', target, propertyKey);
    }

    // @Reflect.metadata("design:type", Point)
    export const getType = (target: any, propertyKey?: string | symbol): any => {
        if (propertyKey) {
            return Reflect.getMetadata('design:type', target, propertyKey);
        } else {
            return Reflect.getMetadata('design:type', target);
        }
    }

    export const getMetadata = <T = any>(metadataKey: any, target: any, propertyKey?: string | symbol): T | undefined => {
        if (propertyKey) {
            return Reflect.getMetadata(metadataKey, target, propertyKey);
        } else {
            return Reflect.getMetadata(metadataKey, target);
        }
    }

    export const getMetadataKeys = (target: any) => {
        return Reflect.getMetadataKeys(target);
    }

    export const getOwnMetadata = (metadataKey: any, target: any, propertyKey?: string): number[] | any => {
        if (propertyKey) {
            return Reflect.getOwnMetadata(metadataKey, target, propertyKey);
        } else {
            return Reflect.getOwnMetadata(metadataKey, target);
        }
    }

    export const getMetadatas = (target: any) => {
        return ReflectUtils.getMetadataKeys(target).map(it => ReflectUtils.getMetadata(it, target));
    }

    export const metadata = (metadataKey: any, data: any) => {
        return Reflect.metadata(metadataKey, data);
    }

    export const defineMetadata = (metadataKey: any, value: any, target: any, propertyKey?: string | symbol) => {
        // console.log("Reflect:",Reflect)
        if (propertyKey && Reflect.defineMetadata) {
            Reflect.defineMetadata(metadataKey, value, target, propertyKey);
        } else if (Reflect.defineMetadata) {
            Reflect.defineMetadata(metadataKey, value, target);
            // Reflect.defineMetadata("design:paramtypes", value, target);
        }
        // console.log("Reflect:",Reflect.getMetadata(metadataKey, target))
        // console.log("Reflect:",Reflect.getMetadata('design:paramtypes', target))
    }
}
