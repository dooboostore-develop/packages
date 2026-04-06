import {HttpError} from './HttpError';
import {HttpStatus} from '../codes/HttpStatus';

export class NotFoundError extends HttpError {
  constructor(
    input: { status?: number; message?: string } | string = {},
  ) {
    const {status = HttpStatus.NotFound, message = 'Not Found'} =
      typeof input === 'string' ? {message: input} : input;
    super({status, message});
  }
}
