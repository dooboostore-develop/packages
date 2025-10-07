// ElementBase 생성 경로 디버깅
const { DomParser } = require('../dist/cjs/index.js');

console.log('🔍 ElementBase 생성 경로 분석');

try {
    const parser = new DomParser('<div></div>');
    const document = parser.document;
    
    // 다양한 요소 생성해보기
    const div = document.createElement('div');
    console.log('div:', {
        constructor: div.constructor.name,
        tagName: div.tagName,
        localName: div.localName,
        nodeType: div.nodeType
    });
    
    const span = document.createElement('span');
    console.log('span:', {
        constructor: span.constructor.name,
        tagName: span.tagName,
        localName: span.localName
    });
    
    const unknown = document.createElement('unknown-element');
    console.log('unknown:', {
        constructor: unknown.constructor.name,
        tagName: unknown.tagName,
        localName: unknown.localName
    });
    
    // 상속 체계 확인
    console.log('\n🔍 상속 체계:');
    console.log('div instanceof ElementBase:', div.constructor.name);
    console.log('div prototype chain:', Object.getPrototypeOf(div).constructor.name);
    console.log('div prototype chain 2:', Object.getPrototypeOf(Object.getPrototypeOf(div)).constructor.name);
    
} catch (error) {
    console.error('Error:', error.message);
}