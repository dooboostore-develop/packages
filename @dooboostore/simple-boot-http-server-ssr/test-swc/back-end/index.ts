import {SimpleBootHttpServer} from '@dooboostore/simple-boot-http-server';
import {SSRSimpleWebComponentFilter} from '../../src/filters/SSRSimpleWebComponentFilter';
import swcRegister from '@dooboostore/simple-web-component';
import path from 'path';
import bootfactory from "@swc-src/bootfactory";
import {HttpSSRServerOption} from "@dooboostore/simple-boot-http-server-ssr";
import {SimpleBootHttpSSRServer} from "@dooboostore/simple-boot-http-server-ssr";
import {ResourceFilter} from "@dooboostore/simple-boot-http-server";
import {UrlUtils} from "@dooboostore/core";

const frontDistPath = path.resolve(__dirname, '../dist-front-end');
const resourceFilter = new ResourceFilter(frontDistPath,
  [
    'assets/privacy.html', 'assets/.*', '\.js$', '\.json$', '\.map$', '\.ico$', '\.png$', '\.jpg$', '\.jpeg$', '\.gif$', 'offline\.html$', 'webmanifest$', 'manifest\.json', 'service-worker\.js$', 'googlebe4b1abe81ab7cf3\.html$',
    {request: 'afdbb6c5792b6c672142773e362326ee.txt', dist: 'assets/afdbb6c5792b6c672142773e362326ee.txt'},
    {request: 'robots.txt', dist: 'assets/robots.txt'},
    {request: 'sitemap.xml', dist: 'assets/sitemap.xml'},
    {request: 'naverf7a766d54ed77440fcb1e98032fd97b5.html', dist: 'assets/naverf7a766d54ed77440fcb1e98032fd97b5.xml'},
    {request: 'naverc6b5be8b7be28510abeabc458c6c40fe.html', dist: 'assets/naverc6b5be8b7be28510abeabc458c6c40fe.html'},
    {request: 'Ads.txt', dist: 'assets/Ads.txt'},
    {request: 'ads.txt', dist: 'assets/Ads.txt'},
    {request: '/worlds/.*', dist: 'index.html'},
    // {request:'/', dist:'index.html'},
    // {
    //   request: (rr) => {
    //     if (RegExp('/api/.*').test(rr.reqUrlPathName)) {
    //       return false;
    //     }
    //     return RegExp('/.*').test(rr.reqUrlPathName) && rr.reqMethod()?.toUpperCase() === 'GET';
    //   },
    //   dist: 'index.html'
    // }
  ]
);
// 1. Configure the SWC SSR Filter
const swcFilter = new SSRSimpleWebComponentFilter({
  frontDistPath: frontDistPath,
  frontDistIndexFileName: 'index.html',
  registerComponents: async (window: any) => {
    // window.
    // 1. Register Core SWC Elements
    swcRegister(window);
    const urlPath = UrlUtils.getUrlPath(window.location);
    console.log('vvvvvvvvvvvvvvv-', urlPath);
    bootfactory(window, urlPath);

    console.log('✅ Registered components for request');
  }
});

// 2. Setup Server with Options
const option = new HttpSSRServerOption({
  listen: {port: 8080},
  filters: [resourceFilter, swcFilter]
});
option.listen.hostname = '0.0.0.0'
option.listen.listeningListener = (server: SimpleBootHttpServer) => {
  console.log(`http server startUP! listening on ${server.option.address}`);
};
const server = new SimpleBootHttpSSRServer(option);

// 3. Run the server
server.run();
console.log('🚀 SWC SSR Test Server running on http://localhost:8080');
