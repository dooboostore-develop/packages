import { Filter } from '../filters/Filter';
import { RequestResponse } from '../models/RequestResponse';
import {SimpleBootHttpServer} from '../SimpleBootHttpServer';

export class ThrowFilter implements Filter {
    constructor(private error: any) {
    }

    async onInit(app: SimpleBootHttpServer){
    }

    async proceedBefore({rr, app}: {rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any>}) {
        return true;
    }

    async proceedAfter({rr, app}: {rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any>}) {
        const sw = rr.resIsDone();
        if (!sw) {
            throw this.error;
        };
        return false;
    }
}
