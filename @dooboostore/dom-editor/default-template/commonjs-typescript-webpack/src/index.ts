import { DomEditor } from '@dooboostore/dom-editor';

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    // 이제 훨씬 간단합니다! 셀렉터 문자열이나 HTMLElement 둘 다 가능
    // HTML string으로 초기화
    const editor1 = new DomEditor('#editor-container', {
      debug: true,
      enableMobileSupport: true,
      dragDelay: 500,
      initialContent: `
        <div class="draggable welcome-card">
          <h2>🎉 Welcome to DOM Editor!</h2>
          <p>이제 사용법이 훨씬 간단해졌습니다!</p>
          <p>new DomEditor('#target') 또는 new DomEditor(element) 만 하면 끝!</p>
        </div>
        <div class="draggable feature-box">
          <h3>✨ 자동 설정</h3>
          <p>• Root container 자동 생성</p>
          <p>• Property panel 자동 생성 (floating!)</p>
          <p>• 모든 이벤트 리스너 자동 설정</p>
          <p>• initialContent는 string 또는 ElementData 객체 지원!</p>
        </div>
      `
    });

    // 전역에서 테스트할 수 있도록 노출
    (window as any).editor = editor1;

    // Export 테스트 함수
    (window as any).testExport = () => {
      const data = editor1.exportData();
      console.log('Exported Data:', data);
      alert('Export 데이터가 콘솔에 출력되었습니다!');
    };

    (window as any).testStructuredData = () => {
      // 구조화된 데이터로 테스트
      const structuredData = {
        tagName: 'div',
        className: 'draggable',
        id: 'structured-test',
        children: [
          {
            tagName: 'h2',
            textContent: '📊 구조화된 데이터 테스트'
          },
          {
            tagName: 'p',
            textContent: 'ElementData 객체로 생성된 요소입니다!'
          },
          {
            tagName: 'div',
            className: 'draggable',
            children: [
              {
                tagName: 'h4',
                textContent: '🎯 중첩된 요소'
              },
              {
                tagName: 'p',
                textContent: '구조화된 데이터에서도 중첩이 완벽하게 지원됩니다.'
              }
            ]
          }
        ]
      };

      editor1.loadContent(structuredData);
      console.log('구조화된 데이터로 콘텐츠를 로드했습니다!');
    };

    console.log('콘솔에서 window.testStructuredData() 또는 window.testExport() 를 실행해보세요!');

    console.log('Dom Editor App started successfully!');
  } catch (error) {
    console.error('Failed to initialize Dom Editor App:', error);
  }
});