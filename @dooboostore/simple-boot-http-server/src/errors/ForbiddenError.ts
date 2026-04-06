import {HttpError} from './HttpError';
import {HttpStatus} from '../codes/HttpStatus';

export class ForbiddenError extends HttpError {
  constructor(
    input: { status?: number; message?: string } | string = {},
  ) {
    const {status = HttpStatus.Forbidden, message = 'Forbidden'} =
      typeof input === 'string' ? {message: input} : input;
    super({status, message});
  }
}
