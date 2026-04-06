// DOM Parser Test Suite
console.log('🧪 DOM Parser Test Suite Starting...');

// 환경변수로 특정 테스트 지정 가능
// @ts-ignore
const testName = process.env.TEST_NAME;

if (!testName) {
  // 모든 테스트 실행
  console.log('🎯 Running all DOM Parser tests...\n');


  import('./dom/TemplateParsing.test');
} else {
  // 특정 테스트만 실행
  console.log(`🎯 Running ${testName} tests...\n`);

  switch (testName) {
    case 'template':
      import('./dom/TemplateParsing.test');
      break;
    default:
      console.error(`❌ Unknown test: ${testName}`);
      console.log('Available tests: parsing, manipulation, fragment, advanced, cloning, clonenode, append, innerHTML, modern, document, domparser, location, popstate, document-events, innertext, nodeiterator, webcomponent');
      process.exit(1);
  }
}
