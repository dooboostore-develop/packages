import {HttpError} from './HttpError';
import {HttpStatus} from '../codes/HttpStatus';

export class ForbiddenError extends HttpError {
    constructor({status = HttpStatus.Forbidden, message = 'Forbidden'}: {status?: number, message?: string} = {}) {
        super({status, message});
    }
}
