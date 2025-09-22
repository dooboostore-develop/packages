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

    async proceedBefore({rr, app}: {rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any>}) {
        // const rr = rrr;
        const url = rr.reqUrl;
        const contentLength = Number(rr.reqHeader(HttpHeaders.ContentLength.toLowerCase() ?? '0'));
        const acceptType = rr.reqHeader(HttpHeaders.Accept);
        const contentType = rr.reqHeader(HttpHeaders.ContentType);
        const intentScheme = rr.reqHeader(HttpHeaders.XSimpleBootSsrIntentScheme);
        if (acceptType === Mimes.ApplicationJsonPostSimpleBootSsrIntentScheme && intentScheme) {
            let intent = new Intent(`${intentScheme}:/${url}`);
            intent.publishType = PublishType.INLINE_DATA_PARAMETERS;
            // const responseHeader = {} as any;
            // responseHeader[HttpHeaders.ContentType] = Mimes.ApplicationJson;
            if (contentLength > 0) {
                if (contentType.includes(Mimes.ApplicationJson)) {
                    intent.data = [await rr.reqBodyJsonData(), rr];
                } else if (contentType.includes(Mimes.MultipartFormData)) {
                    intent.data = [await rr.reqBodyMultipartFormDataObject(), rr];
                }
                const rdatas = await this.intentManager.publish(intent);
                const rdata = rdatas[0];
                const wdata = rdata instanceof Promise ? await rdata : rdata;
                rr.resStatusCode(HttpStatus.Ok);
                rr.resSetHeader(HttpHeaders.ContentType, [Mimes.ApplicationJson])
                await rr.resEnd(wdata ? JSON.stringify(wdata) : undefined);
            } else {
                intent.data = rr.reqUrlSearchParamTuples.length > 0 ? [rr.reqUrlSearchParamsObj, rr] : [rr];
                const rdatas = await this.intentManager.publish(intent);
                const rdata = rdatas[0];
                const wdata = rdata instanceof Promise ? await rdata : rdata;
                // const wdata =undefined;
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

    async proceedAfter({rr, app}: {rr: RequestResponse, app: SimpleBootHttpServer, carrier: Map<string, any>}) {
        return true;
    }

}
