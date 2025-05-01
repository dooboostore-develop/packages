import {Filter} from '../filters/Filter';
import {HttpStatus} from '../codes/HttpStatus';
import {RequestResponse} from '../models/RequestResponse';
import {SimpleBootHttpServer} from '../SimpleBootHttpServer';

export class HttpStatusFilter implements Filter {

    constructor(private httpStatus: HttpStatus | number) {
    }

    async before(rr: RequestResponse, app: SimpleBootHttpServer) {
        // res.writeHead(this.httpStatus);
        rr.resStatusCode(this.httpStatus);
        rr.resEnd();
        return false;
    }

    async after(rr: RequestResponse, app: SimpleBootHttpServer) {
        return true;
    }

    async onInit(app: SimpleBootHttpServer){
    }
}
