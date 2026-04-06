import {HttpError} from './HttpError';
import {HttpStatus} from '../codes/HttpStatus';

export class InternalServerError extends HttpError {
  constructor(
    input: { status?: number; message?: string } | string = {},
  ) {
    const {status = HttpStatus.InternalServerError, message = 'Internal Server Error'} =
      typeof input === 'string' ? {message: input} : input;
    super({status, message});
  }
}
