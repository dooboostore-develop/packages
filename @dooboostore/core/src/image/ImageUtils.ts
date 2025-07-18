import { Promises } from '../promise';

export type LoadImageBitMapCallbackType = { onload: (img: ImageBitmap) => void, onerror: (e: any) => void };

export namespace ImageUtils {
  export function loadImageBitMap(src: string): Promise<ImageBitmap>;
  export function loadImageBitMap(src: string, callback: LoadImageBitMapCallbackType): void;
  export function loadImageBitMap(src: string, callback?: LoadImageBitMapCallbackType): Promise<ImageBitmap> | void {
    let targetCallback: (img: ImageBitmap) => void;
    let catchCallback: (e: any) => void;
    let promise: Promise<ImageBitmap> | undefined = undefined;
    if (callback) {
      targetCallback = callback.onload;
      catchCallback = callback.onerror;
    } else {
      const r = Promises.withResolvers<ImageBitmap>();
      promise = r.promise;
      targetCallback = r.resolve;
      catchCallback = r.reject;
    }

    fetch(src, {
      mode: 'cors', // CORS 요청 (기본값)
      credentials: 'omit' // "anonymous"와 유사: 인증 정보(쿠키, HTTP 인증) 포함하지 않음
    }).then(response => {
      return response.blob();
    }).then(it => {
      return createImageBitmap(it);
    }).then(it => {
      targetCallback(it);
    }).catch(it => {
      catchCallback(it);
    })
    return promise;
  }
}