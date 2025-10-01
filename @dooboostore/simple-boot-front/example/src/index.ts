import 'reflect-metadata';
import { SimFrontOption, UrlType } from '@dooboostore/simple-boot-front/option/SimFrontOption';
import { SimpleBootFront } from '@dooboostore/simple-boot-front/SimpleBootFront';
import { Index } from './pages/index';

// URL 타입을 path로 설정 (hash 대신 history API 사용)
const config = new SimFrontOption(window)
  .setRootRouter(Index)
  .setUrlType(UrlType.path);

const app = new SimpleBootFront(config);
app.run();
