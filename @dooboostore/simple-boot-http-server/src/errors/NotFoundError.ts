import {HttpError} from './HttpError';
import {HttpStatus} from '../codes/HttpStatus';

export class NotFoundError extends HttpError {
    constructor({status = HttpStatus.NotFound, message = 'Not Found'}: {status?: number, message?: string} = {}) {
        super({status, message});
    }
}
