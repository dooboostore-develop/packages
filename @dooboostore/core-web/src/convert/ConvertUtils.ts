import { ConvertUtils as CoreConverUtils } from '@dooboostore/core/convert/ConvertUtils';

export namespace ConvertUtils {
  export const coreConvertUtils = CoreConverUtils;


  export function toObjectUrl(data: File | Blob): string {
    return URL.createObjectURL(data);
  }

  // 에러조심  CORS: SecurityError: Failed to execute 'convertToBlob' on 'OffscreenCanvas': Tainted "OffscreenCanvas" may not be exported.
  // export const toBlob = async (imageBitmap: ImageBitmap) => {
  //   const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  //   const context = canvas.getContext('2d');
  //   context?.drawImage(imageBitmap, 0, 0);
  //   return canvas.convertToBlob({ type: 'image/png' });
  export type ImageConvertConfig = { type: 'image/png' | 'image/jpeg' | string, quality?: number };
  export const isImageConvertConfig = (data: any): data is ImageConvertConfig => {
    return typeof data === 'object' && data !== null && typeof data.type === 'string';
  }


  export const toBlob = async (imageBitmapOrCanvas: File | HTMLImageElement | ImageBitmap | HTMLCanvasElement | OffscreenCanvas, config: ImageConvertConfig): Promise<Blob> => {
    if (imageBitmapOrCanvas instanceof File) {
      return imageBitmapOrCanvas;
    }
    let canvas: HTMLCanvasElement | OffscreenCanvas;
    if (imageBitmapOrCanvas instanceof ImageBitmap || imageBitmapOrCanvas instanceof HTMLImageElement) {
      // 1. Canvas 생성 및 설정
      canvas = document.createElement('canvas');
      canvas.width = imageBitmapOrCanvas.width;
      canvas.height = imageBitmapOrCanvas.height;
      const context = canvas.getContext('2d');
      // 2. ImageBitmap을 Canvas에 그리기
      context.drawImage(imageBitmapOrCanvas, 0, 0);
    } else {
      // 1. OffscreenCanvas 또는 HTMLCanvasElement를 사용
      canvas = imageBitmapOrCanvas;
    }
    // 3. Canvas를 Blob으로 변환 (Promise 사용)
    return new Promise((resolve, reject) => {
      try {
        if (canvas instanceof OffscreenCanvas) {
          // @ts-ignore
          return canvas.convertToBlob({type: config.type, quality: config.quality})
        } else {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Blob 생성 실패'));
            }
          }, config.type, config.quality); // 'image/png' 또는 'image/jpeg' 선택 가능
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  export const toBase64 = async (imageBitmapOrCanvas: File | Blob | HTMLImageElement | ImageBitmap | HTMLCanvasElement | OffscreenCanvas | Promise<File | Blob | HTMLImageElement | ImageBitmap | HTMLCanvasElement | OffscreenCanvas> , config: ImageConvertConfig): Promise<string> => {
    const target = imageBitmapOrCanvas instanceof Promise ? await imageBitmapOrCanvas : imageBitmapOrCanvas;
    if (target instanceof Blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string); // data:image/jpeg;base64,...
        reader.onerror = () => reject(new Error('파일 읽기 실패'));
        reader.readAsDataURL(target);
      });
    }

    let canvas: HTMLCanvasElement | OffscreenCanvas;
    if (target instanceof ImageBitmap || target instanceof HTMLImageElement) {
      // 1. Canvas 생성 및 설정
      canvas = document.createElement('canvas');
      canvas.width = target.width;
      canvas.height = target.height;
      const context = canvas.getContext('2d');
      // 2. ImageBitmap을 Canvas에 그리기
      context.drawImage(target, 0, 0);
    } else {
      // 1. OffscreenCanvas 또는 HTMLCanvasElement를 사용
      canvas = target;
    }


    return new Promise((resolve, reject) => {
      try {
        if (canvas instanceof OffscreenCanvas) {
          // @ts-ignore
          const blob: Blob = canvas.convertToBlob({type: config.type, quality: config.quality})
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              // reader.result에는 "data:image/png;base64,iVBORw0KGgo..." 와 같은 문자열이 포함됩니다.
              resolve(reader.result as string);
            };
            reader.onerror = (error) => {
              reject(new Error('Blob을 base64로 변환하는 중 오류 발생: ' + error));
            };
            reader.readAsDataURL(blob);
          } else {
            reject(new Error('Blob 생성 실패'));
          }
        } else {
          const base64String = canvas.toDataURL(config.type, config.quality); // "data:image/png;base64,..."
          resolve(base64String);
        }
      } catch (e) {
        reject(e);
      }
    })
  }

  export function toImageBitmap(target: File | Blob | HTMLImageElement | HTMLCanvasElement | OffscreenCanvas): Promise<ImageBitmap> {
    return createImageBitmap(target)
  }

  // 에러조심  CORS: SecurityError: Failed to execute 'convertToBlob' on 'OffscreenCanvas': Tainted "OffscreenCanvas" may not be exported.
  export const toBlobURL = async (imageBitmapOrCanvas: ImageBitmap | HTMLCanvasElement | OffscreenCanvas, config: ImageConvertConfig): Promise<string> => {
    const blob = await toBlob(imageBitmapOrCanvas, config);
    return ConvertUtils.toObjectUrl(blob)
  };

  export const compressImageToBase64 = async (img: ImageBitmap | File, config: { maxWidth: number } & ImageConvertConfig) => {
    const imageBitmapOrCanvas = await ConvertUtils.compressImage(img, config);
    return ConvertUtils.toBase64(imageBitmapOrCanvas, config);
  }

  export async function compressImage(img: ImageBitmap | File, config: { maxWidth: number } & ImageConvertConfig): Promise<Blob>;
  export async function compressImage(img: ImageBitmap | File, config: { maxWidth: number } & ImageBitmapOptions): Promise<ImageBitmap>;
  export async function compressImage(img: ImageBitmap | File, config: { maxWidth: number } & (ImageConvertConfig | ImageBitmapOptions)): Promise<Blob | ImageBitmap> {
// 원하는 크기 설정 (예: 최대 너비 800px)
//     console.log('--------------------11')
    if (img instanceof File) {
      img = await ConvertUtils.toImageBitmap(img);
    }
    // console.log('--------------------22')
    const target = img as ImageBitmap;
    return new Promise<Blob | Promise<ImageBitmap>>((resolve, reject) => {
      const MAX_WIDTH = config.maxWidth;
      let width = target.width;
      let height = target.height;

      if (width > MAX_WIDTH) {
        height = (MAX_WIDTH / width) * height;
        width = MAX_WIDTH;
      }
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(target, 0, 0, width, height);

      if (isImageConvertConfig(config)) {
        // Canvas를 Blob으로 변환 (압축 품질 0.7)
        canvas.toBlob(async (blob) => {
          resolve(blob);
        }, config.type, config.quality); // JPEG 포맷, 품질 0.7
      } else {
        resolve(createImageBitmap(canvas));
      }
    })

  }


}

