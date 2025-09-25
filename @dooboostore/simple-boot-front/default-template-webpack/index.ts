import { SimFrontOption, UrlType } from '@dooboostore/simple-boot-front/option/SimFrontOption';
import { SimpleBootFront } from '@dooboostore/simple-boot-front/SimpleBootFront';
import { Index } from './src/index';
// const config = new SimFrontOption(window).setUrlType(UrlType.hash);
const config = new SimFrontOption(window).setRootRouter(Index).setUrlType(UrlType.path);
// const config = new SimFrontOption(window).setUrlType(UrlType.path);
const simpleApplication = new SimpleBootFront(config);
simpleApplication.run();
