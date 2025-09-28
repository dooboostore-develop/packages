export namespace StyleCssUtils {

  export const getPropertyValue = (valueName: string, config: { el: Element; window: Window }) => {
    return config.window.getComputedStyle(config.el).getPropertyValue(valueName);
  };

  export const setPropertyValue = (valueName: string, value: string, el: HTMLElement) => {
    el.style.setProperty(valueName, value);
  };

  export const getComputedStyle = (config: { el: Element; window: Window }) => {
    return config.window.getComputedStyle(config.el);
  };

  export const getPropertyEntries = (config: { el?: Element; window: Window }) => {
    const variables = new Set<string>();
    let targetElement = config.el;
    if (!config.el) {
      targetElement = config.window.document.documentElement;
      Array.from(config.window.document.styleSheets).forEach(sheet => {
        try {
          Array.from(sheet.cssRules).forEach(rule => {
            // :root 또는 다른 선택자에서 커스텀 속성 찾기
            if ('style' in rule && rule.style instanceof CSSStyleDeclaration) {
              Array.from(rule.style)
                .filter(prop => prop.startsWith('--'))
                .forEach(prop => variables.add(prop));
            }
          });
        } catch (e) {
          console.warn('스타일시트 접근 제한:', e); // CORS로 인해 외부 CSS 접근 불가 시
        }
      });
    }

    const computedStyles = config.window.getComputedStyle(targetElement);
    Array.from(computedStyles).filter(prop => prop.startsWith('--')).forEach(it => {
      variables.add(it);
    })

    return Array.from(variables).map(it => [it, computedStyles.getPropertyValue(it)])
  };


  // export class CssVarDebugger {
  //     static getAllCssVars(element = document.documentElement) {
  //       const styles = getComputedStyle(element);
  //       const allVars = {};
  //
  //       for (let i = 0; i < styles.length; i++) {
  //         const prop = styles[i];
  //         if (prop.startsWith('--')) {
  //           allVars[prop] = styles.getPropertyValue(prop);
  //         }
  //       }
  //
  //       return allVars;
  //     }
  //
  //     static logCssVars(selector = ':root') {
  //       const element = document.querySelector(selector);
  //       console.table(this.getAllCssVars(element));
  //     }
  //   }
  //   // 특정 컴포넌트의 루트 요소에 대해
  //   const componentElement = document.querySelector('컴포넌트 선택자');
  //   const computedStyles = window.getComputedStyle(componentElement);
  //   console.log('All CSS variables:',
  //     [...computedStyles].filter(prop => prop.startsWith('--')).map(prop =>
  //       `${prop}: ${computedStyles.getPropertyValue(prop)}`
  //     )
  //   );
  //   // 특정 요소의 CSS 변수 값 가져오기
  //   const element = document.querySelector('선택자');
  //   const value = getComputedStyle(element).getPropertyValue('--변수명');
  //
  // // 전역 CSS 변수 값 가져오기 (:root에 정의된 변수)
  //   const globalValue = getComputedStyle(document.documentElement).getPropertyValue('--변수명');
  //
  // // CSS 변수 값 설정하기
  //   element.style.setProperty('--변수명', '새 값');
}
