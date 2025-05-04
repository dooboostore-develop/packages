import {Filter} from '../filters/Filter';
import {HttpStatus} from '../codes/HttpStatus';
import {RequestResponse} from '../models/RequestResponse';
import {SimpleBootHttpServer} from '../SimpleBootHttpServer';

export class HttpStatusFilter implements Filter {

    constructor(private httpStatus: HttpStatus | number) {
    }

    async proceedBefore({rr, app}: {rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any>}) {
        // res.writeHead(this.httpStatus);
        rr.resStatusCode(this.httpStatus);
        rr.resEnd();
        return false;
    }

    async proceedAfter({rr, app}: {rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any>}) {
        return true;
    }

    async onInit(app: SimpleBootHttpServer){
    }
}
