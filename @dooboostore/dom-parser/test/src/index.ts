// DOM Parser Test Suite
console.log('🧪 DOM Parser Test Suite Starting...');

// 환경변수로 특정 테스트 지정 가능
const testName = process.env.TEST_NAME;

if (!testName) {
  // 모든 테스트 실행
  console.log('🎯 Running all DOM Parser tests...\n');

  import('./dom/parsing.test');
  import('./dom/manipulation.test');
  import('./dom/fragment.test');
  import('./dom/advanced.test');
  import('./dom/cloning.test');
  import('./dom/clonenode.test');
  import('./dom/append.test');
  import('./dom/innerHTML.test');
  import('./dom/innerHTML-complex.test');
  import('./dom/modern.test');

  import('./dom/document.test');
  import('./dom/domparser.test');
  import('./dom/location.test');
  import('./dom/popstate.test');
  import('./dom/document-events.test');
  import('./dom/innertext.test');
  import('./dom/nodeiterator.test');
  import('./dom/performance.test');
  import('./dom/attribute.test');
  import('./dom/webcomponent.test');
  import('./dom/webcomponent-lifecycle.test');
  import('./dom/TemplateParsing.test');
  import('./dom/template-browser-parity.test');
  import('./dom/simple-web-component.test');
  import('./dom/dom-parser.test');
  import('./dom/body.test');
  import('./dom/textnode.test');
} else {
  // 특정 테스트만 실행
  console.log(`🎯 Running ${testName} tests...\n`);

  switch (testName) {
    case 'webcomponent':
      import('./dom/webcomponent.test');
      break;
    case 'webcomponent-lifecycle':
      import('./dom/webcomponent-lifecycle.test');
      break;
    case 'performance':
      import('./dom/performance.test');
      break;
    case 'attribute':
      import('./dom/attribute.test');
      break;
    case 'parsing':
      import('./dom/parsing.test');
      break;
    case 'manipulation':
      import('./dom/manipulation.test');
      break;
    case 'fragment':
      import('./dom/fragment.test');
      break;
    case 'advanced':
      import('./dom/advanced.test');
      break;
    case 'cloning':
      import('./dom/cloning.test');
      break;
    case 'clonenode':
      import('./dom/clonenode.test');
      break;
    case 'append':
      import('./dom/append.test');
      break;
    case 'innerHTML':
      import('./dom/innerHTML.test');
      break;
    case 'modern':
      import('./dom/modern.test');
      break;
    case 'document':
      import('./dom/document.test');
      break;
    case 'domparser':
      import('./dom/domparser.test');
      break;
    case 'location':
      import('./dom/location.test');
      break;
    case 'popstate':
      import('./dom/popstate.test');
      break;
    case 'document-events':
      import('./dom/document-events.test');
      break;
    case 'innertext':
      import('./dom/innertext.test');
      break;
    case 'nodeiterator':
      import('./dom/nodeiterator.test');
      break;
    case 'template':
      import('./dom/TemplateParsing.test');
      break;
    case 'browser-parity':
      import('./dom/template-browser-parity.test');
      break;
    case 'simple-web-component.test':
      import('./dom/simple-web-component.test');
      break;
    case 'dom-parser.test':
      import('./dom/dom-parser.test');
      break;
    case 'body.test':
      import('./dom/body.test');
      break;
    case 'textnode.test':
      import('./dom/textnode.test');
      break;
    default:
      console.error(`❌ Unknown test: ${testName}`);
      console.log('Available tests: parsing, manipulation, fragment, advanced, cloning, clonenode, append, innerHTML, modern, document, domparser, location, popstate, document-events, innertext, nodeiterator, webcomponent');
      process.exit(1);
  }
}
