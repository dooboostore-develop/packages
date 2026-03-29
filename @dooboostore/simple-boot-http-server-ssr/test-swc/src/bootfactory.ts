import register, {SwcAppInterface} from '@dooboostore/simple-web-component';
import { componentFactories } from './component';
import { pageFactories } from './pages';
import { SwcAttributeConfigType } from '@dooboostore/simple-web-component/elements/SwcAppEngine';
import IndexRouterFactory, {IndexRouter} from './pages/index.router';
export default (w: Window, path?: string) => {
  console.log('bootfactory');
  register(w, [...componentFactories, ...pageFactories]);

  // w.document.addEventListener('DOMContentLoaded', () => {
    const appBody = w.document.querySelector('#app') as SwcAppInterface;
    if (appBody && (appBody as any).connect) {
      // const rootRouter = IndexRouterFactory(w);
      // console.log('v vvv', rootRouter);
      const config: SwcAttributeConfigType = {
        rootRouter: IndexRouter.SYMBOL,
        routeType: 'path',
        path: path??'/',
        window: w
      };
      (appBody as any).connect(config);
    }
  // });


  return appBody;
  // (w as any).applicationConfig = (app: any): SwcAttributeConfigType => {
  //   console.log('vvvvvvvvvvvvvvv')
  //   return {
  //     rootRouter: IndexRouter(w),
  //     path: '/hello/good2',
  //     window: w
  //   };
  // };
};
