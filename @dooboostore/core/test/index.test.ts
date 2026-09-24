// 전체 테스트 진입점 - node --test test/index.test.ts 하나로 다 돈다.
// 각 파일이 자기 test()를 모듈 로드 시점에 등록하므로 그냥 import만 하면 됨.
import './fetch/bug1-error-callback.test.ts';
import './fetch/bug2-errorTransform-hang.test.ts';
import './fetch/bug3-beforeProxyFetch-discarded.test.ts';
import './fetch/bug4-timeout-signal-conflict.test.ts';
import './fetch/bug5-afterProxyFetch-stale.test.ts';
import './fetch/bug6-url-mutation.test.ts';
import './fetch/bug7-headers-instance-dropped.test.ts';
import './fetch/bug8-shared-config-race.test.ts';
