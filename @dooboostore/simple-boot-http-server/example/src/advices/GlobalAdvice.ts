import { ExceptionHandler, ExceptionHandlerSituationType, Inject } from '@dooboostore/simple-boot';
import { RequestResponse, HttpStatus, HttpHeaders, Mimes, HttpError, InternalServerError } from '@dooboostore/simple-boot-http-server';

export class GlobalAdvice {

    constructor() {
    }

    @ExceptionHandler()
    async catch(@Inject({situationType: ExceptionHandlerSituationType.ERROR_OBJECT}) e: any, rr: RequestResponse) {
        console.error(`GlobalAdvice.catch ${rr.reqUrl}`, e);
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
