import {HttpError} from './HttpError';
import {HttpStatus} from '../codes/HttpStatus';

export class InternalServerError extends HttpError {
    constructor({status = HttpStatus.InternalServerError, message = 'Internal Server Error'}: {status?: number, message?: string} = {}) {
        super({status, message});
    }
}
