import { Resolver } from './Resolver';
import { RequestResponse } from '../models/RequestResponse';
import { Resource } from '../models/datas/Resource';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';

@Sim
export class ResourceResorver implements Resolver {
    resolve(data: string | undefined, rr: RequestResponse): Promise<void> {
        return new Resource(data ?? rr).write(rr);
    }
}