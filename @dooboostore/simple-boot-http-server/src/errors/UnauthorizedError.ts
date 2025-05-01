import {HttpError} from './HttpError';
import {HttpStatus} from '../codes/HttpStatus';

export class UnauthorizedError extends HttpError {
    constructor({status = HttpStatus.Unauthorized, message = 'Unauthorized'}: {status?: number, message?: string} = {}) {
        super({status, message});
    }
}
