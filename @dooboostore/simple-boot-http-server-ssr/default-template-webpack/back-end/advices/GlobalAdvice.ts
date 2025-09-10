import { ExceptionHandler, ExceptionHandlerSituationType } from '@dooboostore/simple-boot/decorators/exception/ExceptionDecorator';
import { Inject } from '@dooboostore/simple-boot/decorators/inject/Inject';
import { RequestResponse } from '@dooboostore/simple-boot-http-server/models/RequestResponse';
import { backLogger } from '@back-end/logger';
import { HttpStatus } from '@dooboostore/simple-boot-http-server/codes/HttpStatus';
import { HttpHeaders } from '@dooboostore/simple-boot-http-server-ssr/codes/HttpHeaders';
import { Mimes } from '@dooboostore/simple-boot-http-server-ssr/codes/Mimes';
import { HttpError } from '@dooboostore/simple-boot-http-server/errors/HttpError';
import { InternalServerError } from '@dooboostore/simple-boot-http-server/errors/InternalServerError';

export class GlobalAdvice {

    constructor() {
    }

    @ExceptionHandler()
    async catch(@Inject({situationType: ExceptionHandlerSituationType.ERROR_OBJECT}) e: any, rr: RequestResponse) {
        backLogger.error(`GlobalAdvice.catch ${rr.reqUrl}`, e);
        if (rr.resIsDone()) {
            return;
        }
        // const header = {} as any;
        // header[HttpHeaders.ContentType] = Mimes.ApplicationJson;
        // res.writeHead(HttpStatus.InternalServerError, header);
        rr.resStatusCode(HttpStatus.InternalServerError);
        rr.resSetHeader(HttpHeaders.ContentType, Mimes.ApplicationJson);
        let data = '';
        if (e instanceof HttpError) {
            rr.resStatusCode(e.status);
            data = JSON.stringify(e);
        } else if (e instanceof Error){
            const error = new InternalServerError();
            error.data = {message: e.message, stack: e.stack};
            data = JSON.stringify(error);
        } else {
            const error = new InternalServerError();
            error.data = e;
            data = JSON.stringify(error);
        }
        await rr.resEnd(data);
    }
}
