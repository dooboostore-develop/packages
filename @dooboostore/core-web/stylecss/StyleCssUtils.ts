export namespace StyleCssUtils {
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