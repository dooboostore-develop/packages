import 'reflect-metadata';
import { SimFrontOption, UrlType } from '@dooboostore/simple-boot-front/option/SimFrontOption';
import { SimpleBootFront } from '@dooboostore/simple-boot-front/SimpleBootFront';
import { IndexRouterComponent } from './pages/index.router.component';
import { ConcatScript } from './scripts/concat.script';

// Configure Simple Boot Front application
const config = new SimFrontOption(
  {
    window,
    urlType: UrlType.path,
    using:[ConcatScript]
  },
  {
    rootRouter:IndexRouterComponent
  })

// Create and run the application
const app = new SimpleBootFront(config).run();
