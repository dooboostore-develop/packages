// 전체 테스트 진입점 - node --test test/index.test.ts 하나로 다 돈다.
import 'reflect-metadata';
import './server/server.test.ts';
import './server/content-type-generator.test.ts';
import './server/spa-fallback.test.ts';
import './server/post-send-error.test.ts';
import './server/data-view-body.test.ts';
import './server/res-end-variants.test.ts';
import './server/filter-halt.test.ts';
import './server/graceful-close.test.ts';
