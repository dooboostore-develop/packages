import 'reflect-metadata'
import { ConstructorType } from '@dooboostore/core/types';
export class ReflectUtils {
    static getParameterTypes(target: any, propertyKey?: string | symbol): ConstructorType<any>[] {
        if (propertyKey) {
            return Reflect.getMetadata('design:paramtypes', target, propertyKey) || [];
        } else {
            return Reflect.getMetadata('design:paramtypes', target) || [];
        }
    }


    static getReturnType(target: any, propertyKey: string | symbol): any {
        return Reflect.getMetadata('design:returntype', target, propertyKey);
    }

    // @Reflect.metadata("design:type", Point)
    static getType(target: any, propertyKey?: string | symbol): any {
        if (propertyKey) {
            return Reflect.getMetadata('design:type', target, propertyKey);
        } else {
            return Reflect.getMetadata('design:type', target);
        }
    }

    static getMetadata<T = any>(metadataKey: any, target: any, propertyKey?: string | symbol): T | undefined {
        if (propertyKey) {
            return Reflect.getMetadata(metadataKey, target, propertyKey);
        } else {
            return Reflect.getMetadata(metadataKey, target);
        }
    }

    static getMetadataKeys(target: any) {
        return Reflect.getMetadataKeys(target);
    }

    static getOwnMetadata(metadataKey: any, target: any, propertyKey?: string): number[] | any {
        if (propertyKey) {
            return Reflect.getOwnMetadata(metadataKey, target, propertyKey);
        } else {
            return Reflect.getOwnMetadata(metadataKey, target);
        }
    }

    static getMetadatas(target: any) {
        return this.getMetadataKeys(target).map(it => ReflectUtils.getMetadata(it, target));
    }

    static metadata(metadataKey: any, data: any) {
        return Reflect.metadata(metadataKey, data);
    }

    static defineMetadata(metadataKey: any, value: any, target: any, propertyKey?: string | symbol) {
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
