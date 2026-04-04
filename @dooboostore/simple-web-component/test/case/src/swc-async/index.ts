import swcRegister from '@dooboostore/simple-web-component';

swcRegister(window);
console.log('>>> SwcAsync module loaded:' );

// Redefine global fetchData to support mode switching for interactive testing
(window as any).fetchData = (mode: 'success' | 'error' = 'success') => {
  console.log('>>> [Test] fetchData called with mode:', mode);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (mode === 'success') {
        resolve({ id: Date.now(), title: 'Remote Data Loaded', timestamp: new Date().toLocaleTimeString() });
      } else {
        reject(new Error('Simulated Network Error!'));
      }
    }, 1500);
  });
};

const asyncEl = document.getElementById('my-async') as any;

document.getElementById('success-btn')?.addEventListener('click', () => {
  asyncEl.setAttribute('on-get-value', "window.fetchData('success')");
});

document.getElementById('error-btn')?.addEventListener('click', () => {
  asyncEl.setAttribute('on-get-value', "window.fetchData('error')");
});
