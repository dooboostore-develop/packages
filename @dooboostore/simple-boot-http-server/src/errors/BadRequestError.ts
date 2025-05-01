import {HttpError} from './HttpError';
import {HttpStatus} from '../codes/HttpStatus';

export class BadRequestError extends HttpError {
    constructor({status = HttpStatus.BadRequest, message = 'Bad Request'}: {status?: number, message?: string} = {}) {
        super({status, message});
    }
}
