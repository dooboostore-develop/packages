import { ConvertUtils as CoreConverUtils } from '@dooboostore/core/convert/ConvertUtils';

export namespace ConvertUtils {
  export const coreConvertUtils = CoreConverUtils;


  // 에러조심  CORS: SecurityError: Failed to execute 'convertToBlob' on 'OffscreenCanvas': Tainted "OffscreenCanvas" may not be exported.
  // export const toBlob = async (imageBitmap: ImageBitmap) => {
  //   const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  //   const context = canvas.getContext('2d');
  //   context?.drawImage(imageBitmap, 0, 0);
  //   return canvas.convertToBlob({ type: 'image/png' });
  // }
  const toBlob = async (imageBitmap: ImageBitmap) => {
      // 1. Canvas 생성 및 설정
      const canvas = document.createElement('canvas');
      canvas.width = imageBitmap.width;
      canvas.height = imageBitmap.height;
      const context = canvas.getContext('2d');

      // 2. ImageBitmap을 Canvas에 그리기
      context.drawImage(imageBitmap, 0, 0);

      // 3. Canvas를 Blob으로 변환 (Promise 사용)
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Blob 생성 실패'));
          }
        }, 'image/png'); // 'image/png' 또는 'image/jpeg' 선택 가능
      });
  }


  // 에러조심  CORS: SecurityError: Failed to execute 'convertToBlob' on 'OffscreenCanvas': Tainted "OffscreenCanvas" may not be exported.
  export const toBlobURL = async (imageBitmap: ImageBitmap): Promise<string> => {
    const promise = new Promise<string>((resolve, reject) => {
      try {
        // 5. 캔버스 생성
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;

        // 7. ImageBitmap을 크기 조절하며 그리기
        ctx.drawImage(imageBitmap, 0, 0);
        document.body.appendChild(canvas);
        canvas.toBlob((blob) => {
          const imageUrl = URL.createObjectURL(blob);
          resolve(imageUrl);
          const img = new Image();
          img.src = imageUrl;
          document.body.appendChild(img);
        }, 'image/png');
      } catch (e) {
        reject(e);
      }
    });
    // 선택적으로 캔버스에서 이미지로 변환해 표시

    return promise;
  };
  export const toBase64 = (imageBitmap: ImageBitmap) => {
    const canvas = document.createElement('canvas');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageBitmap, 0, 0);

    // 캔버스에서 Base64로 변환
    const base64String = canvas.toDataURL('image/png'); // "data:image/png;base64,..."
    return base64String;
    // console.log(base64String);
  };
  export const formDataToFormDataEntryValueObj = <T = { [key: string]: FormDataEntryValue | FormDataEntryValue[] }>(
    data: FormData | HTMLFormElement
  ): T => {
    if (data instanceof HTMLFormElement) {
      data = new FormData(data);
    }
    const obj: any = {};
    data.forEach((value, key) => {
      if (Array.isArray(obj[key])) {
        obj[key].push(value);
      } else if (obj[key] !== undefined || !isNaN(obj[key])) {
        obj[key] = [obj[key], value];
      } else {
        obj[key] = value;
      }
    });
    return obj;
  };
}

