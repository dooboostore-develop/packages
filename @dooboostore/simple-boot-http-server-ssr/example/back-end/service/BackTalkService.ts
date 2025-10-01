import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { RequestResponse } from '@dooboostore/simple-boot-http-server/models/RequestResponse';
import { TalkService } from '@src/service/TalkService';

@Sim({symbol: TalkService.SYMBOL})
export class BackTalkService implements TalkService {
  async talk(request: TalkService.TalkRequest, rr?: RequestResponse): Promise<TalkService.TalkResponse> {
    return {
          name: 'hello intent api',
          content: new Date().toISOString(),
        };
  }
}