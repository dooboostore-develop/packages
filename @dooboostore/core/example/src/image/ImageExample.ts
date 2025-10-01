import { Runnable } from '@dooboostore/core/runs/Runnable';
import { ImageUtils } from '@dooboostore/core/image/ImageUtils';

export class ImageExample implements Runnable {
  run(): void {
    console.log('\n=== Image Utils Example ===\n');
    
    console.log('1. ImageUtils class:');
    console.log('  ImageUtils provides image manipulation utilities');
    
    console.log('\n2. Common image operations:');
    console.log('  - Resize and scale');
    console.log('  - Format conversion');
    console.log('  - Aspect ratio calculation');
    console.log('  - Data URL handling');
    console.log('  - Thumbnail generation');
    
    console.log('\n3. Image dimension calculations:');
    const width = 1920;
    const height = 1080;
    console.log(`  Original: ${width}x${height}`);
    console.log(`  Aspect ratio: ${(width/height).toFixed(2)}`);
    
    const maxWidth = 800;
    const scale = maxWidth / width;
    const newHeight = Math.round(height * scale);
    console.log(`  Scaled to fit ${maxWidth}px: ${maxWidth}x${newHeight}`);
    
    console.log('\n4. Base64 image data:');
    const sampleBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ';
    console.log('  Base64 (sample):', sampleBase64);
    console.log('  Data URL format: data:image/png;base64,' + sampleBase64);
    
    console.log('\n5. Thumbnail calculation:');
    const originalW = 4000;
    const originalH = 3000;
    const thumbMax = 200;
    const thumbScale = Math.min(thumbMax / originalW, thumbMax / originalH);
    console.log(`  Original: ${originalW}x${originalH}`);
    console.log(`  Thumbnail (max ${thumbMax}): ${Math.round(originalW * thumbScale)}x${Math.round(originalH * thumbScale)}`);
    
    console.log('\n=========================\n');
  }
}
