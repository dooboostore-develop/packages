import { SimpleBootFront } from '@dooboostore/simple-boot-front/SimpleBootFront';
import { ConstructorType } from '@dooboostore/core/types';
import { SimFrontOption } from '@dooboostore/simple-boot-front/option/SimFrontOption';
export abstract class SimpleBootHttpSSRFactory {
    public abstract factory(simFrontOption: SimFrontOption, using: (ConstructorType<any> | Function)[], domExcludes: ConstructorType<any>[]): Promise<SimpleBootFront> ;

    public async create(simFrontOption: SimFrontOption, using: (ConstructorType<any> | Function)[] = [], domExcludes: ConstructorType<any>[] = []): Promise<SimpleBootFront> {
        const front = await this.factory(simFrontOption, using, domExcludes);
        return front;
    }
}
