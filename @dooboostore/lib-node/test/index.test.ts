// 전체 테스트 진입점 - node --test test/index.test.ts 하나로 다 돈다.
// 각 파일이 자기 test()를 모듈 로드 시점에 등록하므로 그냥 import만 하면 됨.
import './smoke.test.ts';
