import { AnimationFrameUtils } from '@dooboostore/core-web/animation/AnimationFrameUtils';

console.log('AnimationFrameUtils FPS:', AnimationFrameUtils.fps);

// Example usage
const element = document.getElementById('app');
if (element) {
  element.innerHTML = `
    <h1>Core Web Example</h1>
    <p>AnimationFrameUtils FPS: ${AnimationFrameUtils.fps}</p>
  `;
}
