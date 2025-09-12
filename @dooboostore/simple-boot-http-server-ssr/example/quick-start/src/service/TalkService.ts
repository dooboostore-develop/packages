import { RequestResponse } from '@dooboostore/simple-boot-http-server/models/RequestResponse';
import { Config, SymbolIntentApiServiceProxy } from '@dooboostore/simple-boot-http-server-ssr/proxy/SymbolIntentApiServiceProxy';

export namespace TalkService {
  export const SYMBOL = Symbol.for('TalkService');
  export type TalkRequest = { seq: number }
  export type TalkResponse = { name: string, content: string };
}

export interface TalkService {
  talk(request: TalkService.TalkRequest, data?: RequestResponse | ((config: Config<TalkService.TalkRequest>) => Promise<TalkService.TalkResponse>)): Promise<TalkService.TalkResponse>;
}