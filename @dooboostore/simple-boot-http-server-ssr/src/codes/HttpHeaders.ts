import { HttpHeaders as AHttpHeaders } from '@dooboostore/simple-boot-http-server/codes/HttpHeaders';
import { Mimes } from './Mimes';

export const HttpHeaders = {
  ...AHttpHeaders,
  XSimpleBootSsrIntentScheme: 'x-simple-boot-ssr-intent-scheme'
};
export type HttpHeadersType = typeof HttpHeaders;

export const makeIntentHeaderBySymbolFor = (symbol: Symbol): HeadersInit => {
  return {
    [HttpHeaders.Accept]: Mimes.ApplicationJsonPostSimpleBootSsrIntentScheme,
    [HttpHeaders.XSimpleBootSsrIntentScheme]: `Symbol.for(${symbol.description})`
  }
};


