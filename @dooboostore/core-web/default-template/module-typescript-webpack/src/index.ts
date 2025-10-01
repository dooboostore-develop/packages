import { AnimationFrameUtils } from '@dooboostore/core-web/animation/AnimationFrameUtils';

document.querySelector('body').innerHTML = AnimationFrameUtils.fps.toString();
console.log(AnimationFrameUtils.fps);