import {HttpError} from './HttpError';
import {HttpStatus} from '../codes/HttpStatus';

export class BadRequestError extends HttpError {
  constructor(
    input: { status?: number; message?: string } | string = {},
  ) {
    const {status = HttpStatus.BadRequest, message = 'Bad Request'} =
      typeof input === 'string' ? {message: input} : input;
    super({status, message});
  }
}
