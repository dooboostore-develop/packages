import {IntentSchemeFilter, ResourceFilter, SimpleBootHttpServer} from '@dooboostore/simple-boot-http-server';
import path from 'path';
import bootfactory from "@swc-src/bootfactory";
import {HttpSSRServerOption, SimpleBootHttpSSRServer, SSRSimpleWebComponentDomParserFilter} from "@dooboostore/simple-boot-http-server-ssr";
import {UrlUtils} from "@dooboostore/core";
import '@swc-back-end/services';
import {UserService} from '@swc-src/services/UserService';
import {services} from "@swc-back-end/services";

const frontDistPath = path.resolve(__dirname, '../dist-front-end');
const resourceFilter = new ResourceFilter(frontDistPath,
  [
    /\.ico/,
    /\.png$/,
    /\.map$/,
    /\.json$/,
    '/bundle.js',
    // {
    //   request: (rr) => {
    //     // API 경로는 제외 (현재는 없지만 미래를 위해)
    //     if (RegExp('/api/.*').test(rr.reqUrlPathName)) {
    //       return false;
    //     }
    //     // 정적 파일 확장자가 포함된 경로는 index.html로 보내지 않음
    //     if (/\.(js|css|map|ico|png|jpg|jpeg|gif|json|xml|txt)$/.test(rr.reqUrlPathName)) {
    //       return false;
    //     }
    //     // 그 외 모든 GET 요청은 index.html로 (SPA 라우팅)
    //     return RegExp('/.+').test(rr.reqUrlPathName) && rr.reqMethod()?.toUpperCase() === 'GET';
    //   },
    //   dist: 'index.html'
    // }
  ]
);
// 1. Configure the SWC SSR Filter
const swcFilter = new SSRSimpleWebComponentDomParserFilter({
  frontDistPath: frontDistPath,
  frontDistIndexFileName: 'index.html',
  ssrExcludeFilter: (rr) => {
    // 정적 자원에 대해서는 SSR을 시도하지 않음
    return /\.(js|css|map|ico|png|jpg|jpeg|gif|json|xml|txt)$/.test(rr.reqUrlPathName);
  },
  registerComponents: async (window: any) => {
    // window.
    // 1. Register Core SWC Elements
    const urlPath = UrlUtils.getUrlPath(window.location);
    // console.log('vvvvvvvvvvvvvvv-', urlPath);
    const otherInstance = new Map<symbol, any>();
    services.forEach(it => {
      // @ts-ignore
      otherInstance.set(it.symbol, server.sim(it.symbol));
    })
    await bootfactory(window, otherInstance, urlPath);

    console.log('✅ Registered components for request');
  }
});

// 2. Setup Server with Options
const option = new HttpSSRServerOption({
  listen: {port: 3030},
  filters: [resourceFilter, IntentSchemeFilter, swcFilter]
});
option.listen.hostname = '0.0.0.0'
option.listen.listeningListener = (server: SimpleBootHttpServer) => {
  console.log(`🚀 SWC SSR Test Server startUP! listening on ${server.option.address}`);
};
const server = new SimpleBootHttpSSRServer(option);

// 3. Run the server
server.run();

// console.log('vvvv1111vvvv')