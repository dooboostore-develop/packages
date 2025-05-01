import { ConvertUtils as CoreConverUtils } from '@dooboostore/core/convert/ConvertUtils';

export namespace ConvertUtils {
  export const coreConvertUtils = CoreConverUtils;


  // 에러조심  CORS: SecurityError: Failed to execute 'convertToBlob' on 'OffscreenCanvas': Tainted "OffscreenCanvas" may not be exported.
  export const toBlob = async (imageBitmap: ImageBitmap) => {
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const context = canvas.getContext('2d');
    context?.drawImage(imageBitmap, 0, 0);
    return canvas.convertToBlob({ type: 'image/png' });
  }
  // 에러조심  CORS: SecurityError: Failed to execute 'convertToBlob' on 'OffscreenCanvas': Tainted "OffscreenCanvas" may not be exported.
  export const toBlobURL = async (imageBitmap: ImageBitmap): Promise<string> => {
    // const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    // const context = canvas.getContext('2d');
    // context?.drawImage(imageBitmap, 0, 0);
    // return canvas.convertToBlob({ type: 'image/png' });


    // 8. 캔버스를 DOM에 추가
    // document.body.appendChild(canvas);

    const promise = new Promise<string>((resolve, reject) => {
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
        // resolve(imageUrl);
        const img = new Image();
        img.src = imageUrl;
        document.body.appendChild(img);
      }, 'image/png');
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

