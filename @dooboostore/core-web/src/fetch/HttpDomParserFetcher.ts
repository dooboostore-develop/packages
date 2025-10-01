import { HttpFetcher, HttpFetcherConfig, HttpFetcherTarget } from '@dooboostore/core/fetch/HttpFetcher';
import { FetcherRequest } from '@dooboostore/core/fetch/Fetcher';

export type HttpDomParserFetcherConfig<CONFIG> = HttpFetcherConfig<CONFIG, Document> & {
  bypassTransform?: boolean;
  forceParserType?: DOMParserSupportedType;
};

export class HttpDomParserFetcher<
  CONFIG,
  PIPE extends { responseData?: any }
> extends HttpFetcher<CONFIG, Document, PIPE> {

  get<T = Document>(
    config: FetcherRequest<HttpFetcherTarget, Document, HttpDomParserFetcherConfig<CONFIG>, T>
  ): Promise<T> {
    return super.get(config);
  }

  protected execute(
    fetcherRequest: FetcherRequest<HttpFetcherTarget, any, HttpDomParserFetcherConfig<CONFIG>>
  ): Promise<any> {
    return super.execute(fetcherRequest).then(async (response: Response) => {
      const config = fetcherRequest.config;
      if (config?.bypassTransform) {
        return response;
      }

      const responseText = await response.text();
      const contentType = response.headers.get('content-type')?.split(';')[0] ?? 'text/html';
      
      let parserType: DOMParserSupportedType;

      if (config?.forceParserType) {
        parserType = config.forceParserType;
      } else {
        switch (contentType) {
          case 'text/xml':
          case 'application/xml':
          case 'application/xhtml+xml':
            parserType = 'application/xml';
            break;
          case 'image/svg+xml':
            parserType = 'image/svg+xml';
            break;
          case 'text/html':
          default:
            parserType = 'text/html';
            break;
        }
      }
      
      const parser = new DOMParser();
      return parser.parseFromString(responseText, parserType);
    });
  }
}
