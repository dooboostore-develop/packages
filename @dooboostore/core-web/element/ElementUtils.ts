import { Promises } from '@dooboostore/core/promise';

export namespace ElementUtils {


  export type LoadImageCallbackType = { onload: (img: HTMLImageElement) => void, onerror: OnErrorEventHandler };
  export type LoadAudioCallbackType = { onload: (img: HTMLAudioElement) => void, onerror: (e: ErrorEvent) => void };
  export type LoadImageBitMapCallbackType = { onload: (img: ImageBitmap) => void, onerror: (e:any)=>void };

  export function loadImage(src: string): Promise<HTMLImageElement>;
  export function loadImage(src: string, callback: LoadImageCallbackType): void;
  export function loadImage(src: string, callback?: LoadImageCallbackType): Promise<HTMLImageElement> | void {
    let targetCallback: (img: HTMLImageElement) => void;
    let promise: Promise<HTMLImageElement> | undefined = undefined;
    if (callback) {
      targetCallback = callback.onload;
    } else {
      const r = Promises.withResolvers<HTMLImageElement>();
      promise = r.promise;
      targetCallback = r.resolve;
    }
    const img = new Image();
    // img.crossOrigin = 'Anonymous';
    img.onload = () => {
      targetCallback(img);
    };
    if (callback && callback.onerror) {
      img.onerror = callback.onerror;
    }
    img.src = src;
    return promise;
  }

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
    }).then(it =>{
      targetCallback(it);
    }).catch(it => {
      catchCallback(it);
    })
    return promise;
  }

  export function loadAudio(src: string): Promise<HTMLAudioElement>;
  export function loadAudio(src: string, callback: LoadAudioCallbackType): void;
  export function loadAudio(src: string, callback?: LoadAudioCallbackType): Promise<HTMLAudioElement> | void {
    let targetCallback: (audio: HTMLAudioElement) => void;
    let error: (e: any) => void;
    let promise: Promise<HTMLAudioElement> | undefined = undefined;
    if (callback) {
      targetCallback = callback.onload;
      error = callback.onerror;
    } else {
      const r = Promises.withResolvers<HTMLAudioElement>();
      promise = r.promise;
      error = r.reject;
      targetCallback = r.resolve;
    }
    const audio = new Audio('path/to/audio1.mp3');
    audio.addEventListener('canplay', () => {
      targetCallback(audio);
    });
    audio.addEventListener('error', (e) => {
      callback.onerror(e);
    });
    audio.load();
    return promise;
  }
}