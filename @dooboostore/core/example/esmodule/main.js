// Note: We must use a relative path to the bundled file
// because we are not using an importmap in this version.
import { RandomUtils } from '../../src/dist/dist/bundle.js';

const randomColor = RandomUtils.rgb();
console.log('Random Color (from main.js):', randomColor);
document.body.style.backgroundColor = randomColor;
