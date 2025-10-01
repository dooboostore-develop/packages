import { Runnable } from '@dooboostore/core/runs/Runnable';
import { ElementUtils } from '@dooboostore/core-web/element/ElementUtils';
import { showResult, showCode } from '../index';

export class ElementExample implements Runnable {
  async run(): Promise<void> {
    showResult('Element Utils', 'Testing DOM element utilities');
    
    // Load image example
    showResult('Loading Image', 'Loading a test image...', true);
    
    try {
      const img = await ElementUtils.loadImage('https://dooboostore-develop.github.io/assets/images/dooboostore.png');
      showResult('Image Loaded', `Image size: ${img.width}x${img.height}`, true);
      
      // Display the image
      const output = document.getElementById('output');
      if (output) {
        const imgEl = document.createElement('img');
        imgEl.src = img.src;
        imgEl.style.maxWidth = '150px';
        imgEl.style.borderRadius = '8px';
        imgEl.style.margin = '10px 0';
        output.appendChild(imgEl);
      }
    } catch (error) {
      showResult('Image Load Error', `${error}`, false);
    }
    
    showResult('Info', 'ElementUtils provides utilities for loading images, audio, and more');
  }
}
