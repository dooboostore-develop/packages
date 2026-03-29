import swcRegister, { SwcChoose, SwcWhen, SwcOtherwise } from '@dooboostore/simple-web-component';

swcRegister(window);
console.log('>>> SwcChoose module loaded:', { SwcChoose, SwcWhen, SwcOtherwise });

// No extra TS logic needed as HTML handles it via setAttribute
