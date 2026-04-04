import swcRegister  from '@dooboostore/simple-web-component';

const { SwcChoose, SwcWhen, SwcOtherwise } = swcRegister(window);
console.log('>>> SwcChoose module loaded:', { SwcChoose, SwcWhen, SwcOtherwise });

// No extra TS logic needed as HTML handles it via setAttribute
