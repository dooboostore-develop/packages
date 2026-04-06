import {HttpError} from './HttpError';
import {HttpStatus} from '../codes/HttpStatus';

export class UnauthorizedError extends HttpError {
  constructor(
    input: { status?: number; message?: string } | string = {},
  ) {
    const {status = HttpStatus.Unauthorized, message = 'Unauthorized'} =
      typeof input === 'string' ? {message: input} : input;
    super({status, message});
  }
}
