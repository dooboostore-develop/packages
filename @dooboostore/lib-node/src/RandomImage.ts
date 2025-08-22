import { createCanvas } from 'canvas';
import { RandomUtils } from '@dooboostore/core/random/RandomUtils';
import * as fs from 'node:fs';


type RandomImageConfig = { mimeType?: 'image/png' | 'image/jpeg', size: { w: number, h: number } };
type RandomImageBase64Config = RandomImageConfig & { quality?: number, }
type RandomImageBufferConfig = RandomImageConfig;
type RandomImageFileConfig = RandomImageBufferConfig & { path: string };

export class RandomImage {
  say() {
    console.log('say')
  }


  private generate(config: RandomImageConfig) {
    const canvas = createCanvas(config.size.w, config.size.h); // 200x200 이미지
    const ctx = canvas.getContext('2d');

    const width = canvas.width;
    const height = canvas.height;
    // 랜덤 배경색
    ctx.fillStyle = RandomUtils.rgb();
    ctx.fillRect(0, 0, width, height);

    // 도형 종류 배열
    const shapes = ['circle', 'rectangle', 'triangle', 'star'];
    const numShapes = Math.floor(Math.random() * 3) + 1; // 1~3개의 도형

    for (let i = 0; i < numShapes; i++) {
      const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
      ctx.fillStyle = RandomUtils.rgb();

      // 랜덤 위치와 크기
      const size = Math.min(width, height) * (Math.random() * 0.3 + 0.2); // 20~50% 크기
      const x = Math.random() * (width - size);
      const y = Math.random() * (height - size);

      switch (shapeType) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'rectangle':
          ctx.fillRect(x, y, size, size * (Math.random() * 0.5 + 0.5)); // 비율 랜덤
          break;

        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(x + size / 2, y);
          ctx.lineTo(x, y + size);
          ctx.lineTo(x + size, y + size);
          ctx.closePath();
          ctx.fill();
          break;

        case 'star':
          const spikes = 5;
          const outerRadius = size / 2;
          const innerRadius = outerRadius * 0.4;
          ctx.beginPath();
          for (let j = 0; j < spikes * 2; j++) {
            const radius = j % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI / spikes) * j - Math.PI / 2;
            ctx.lineTo(
              x + size / 2 + radius * Math.cos(angle),
              y + size / 2 + radius * Math.sin(angle)
            );
          }
          ctx.closePath();
          ctx.fill();
          break;
      }
    }

    return canvas;
  }

  base64(config: RandomImageBase64Config) {
    // Base64로 변환
    if (config.mimeType === 'image/jpeg') {
      return this.generate(config).toDataURL(config.mimeType, config.quality)
    } else {
      return this.generate(config).toDataURL(config.mimeType); // data:image/png;base64,...
    }
  }

  writeFileSync(config: RandomImageFileConfig) {
    const buffer = this.buffer(config);
    fs.writeFileSync(config.path, buffer);
  }

  writeFile(config: RandomImageFileConfig) {
    const buffer = this.buffer(config);
    return fs.promises.writeFile(config.path, buffer);
  }


  buffer(config: RandomImageBufferConfig) {
    // Buffer로 변환
    if (config.mimeType === 'image/jpeg') {
      return this.generate(config).toBuffer(config.mimeType)
    } else {
      return this.generate(config).toBuffer('image/png'); // Buffer
    }
  }
}