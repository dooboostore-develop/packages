import {Filter} from '@dooboostore/simple-boot-http-server/filters/Filter';
import {HttpHeaders} from '../codes/HttpHeaders';
import {Intent, PublishType} from '@dooboostore/simple-boot/intent/Intent';
import {IntentManager} from '@dooboostore/simple-boot/intent/IntentManager';
import {Sim} from '@dooboostore/simple-boot/decorators/SimDecorator';
import {HttpStatus} from '@dooboostore/simple-boot-http-server/codes/HttpStatus';
import {RequestResponse} from '@dooboostore/simple-boot-http-server/models/RequestResponse';
import {SimpleBootHttpServer} from '@dooboostore/simple-boot-http-server/SimpleBootHttpServer';
import { Mimes } from '../codes/Mimes';

@Sim
export class IntentSchemeFilter implements Filter {
    constructor(private intentManager: IntentManager) {
    }

    async onInit(app: SimpleBootHttpServer) {
    }

    async before(rrr: RequestResponse) {
        const rr = rrr;
        const url = rr.reqUrl;
        const contentLength = Number(rr.reqHeader(HttpHeaders.ContentLength.toLowerCase() ?? '0'));
        const acceptType = rr.reqHeader(HttpHeaders.Accept);
        const intentScheme = rr.reqHeader(HttpHeaders.XSimpleBootSsrIntentScheme);
        if (acceptType === Mimes.ApplicationJsonPostSimpleBootSsrIntentScheme && intentScheme) {
            let intent = new Intent(`${intentScheme}:/${url}`);
            intent.publishType = PublishType.INLINE_DATA_PARAMETERS;
            // const responseHeader = {} as any;
            // responseHeader[HttpHeaders.ContentType] = Mimes.ApplicationJson;
            if (contentLength > 0) {
                intent.data = [await rr.reqBodyJsonData(), rr];
                const rdatas = this.intentManager.publish(intent);
                const rdata = rdatas[0];
                const wdata = rdata instanceof Promise ? await rdata : rdata;
                rr.resStatusCode(HttpStatus.Ok);
                rr.resSetHeader(HttpHeaders.ContentType, [Mimes.ApplicationJson])
                await rr.resEnd(wdata ? JSON.stringify(wdata) : undefined);
            } else {
                intent.data = rr.reqUrlSearchParams.length > 0 ? [rr.reqUrlSearchParamsObj, rr] : [rr];
                const rdatas = this.intentManager.publish(intent);
                const rdata = rdatas[0];
                const wdata = rdata instanceof Promise ? await rdata : rdata;
                rr.resStatusCode(HttpStatus.Ok);
                rr.resSetHeader(HttpHeaders.ContentType, [Mimes.ApplicationJson])
                await rr.resEnd(wdata ? JSON.stringify(wdata) : undefined);
            }
            // console.log('---------3--intent request', rr.req.readable, rr.req.readableLength);
            return false;
        } else {
            return true;
        }
    }

    async after(rr: RequestResponse) {
        return true;
    }

}
