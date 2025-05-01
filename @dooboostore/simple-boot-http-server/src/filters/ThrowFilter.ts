import { Filter } from '../filters/Filter';
import { RequestResponse } from '../models/RequestResponse';
import {SimpleBootHttpServer} from '../SimpleBootHttpServer';

export class ThrowFilter implements Filter {
    constructor(private error: any) {
    }

    async onInit(app: SimpleBootHttpServer){
    }

    async before(rr: RequestResponse, app: SimpleBootHttpServer) {
        return true;
    }

    async after(rr: RequestResponse, app: SimpleBootHttpServer) {
        const sw = rr.resIsDone();
        if (!sw) {
            throw this.error;
        };
        return false;
    }
}
