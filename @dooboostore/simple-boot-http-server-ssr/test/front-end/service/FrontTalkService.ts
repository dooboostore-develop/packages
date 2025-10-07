import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Config, SymbolIntentApiServiceProxy } from '@dooboostore/simple-boot-http-server-ssr/proxy/SymbolIntentApiServiceProxy';
import { RequestResponse } from '@dooboostore/simple-boot-http-server/models/RequestResponse';
import { TalkService } from '@src/service/TalkService';

@Sim({
  symbol: TalkService.SYMBOL,
  proxy:SymbolIntentApiServiceProxy
})
export class FrontTalkService implements TalkService {
  async talk(request: TalkService.TalkRequest, data?:  ((config: Config<TalkService.TalkRequest>) => Promise<TalkService.TalkResponse>)): Promise<TalkService.TalkResponse> {
    return data!({body: request});
  }
}