import { Promises } from '@dooboostore/core/promise';

export namespace ElementUtils {


  export type LoadImageCallbackType = { onload: (img: HTMLImageElement) => void, onerror: OnErrorEventHandler };
  export type LoadAudioCallbackType = { onload: (img: HTMLAudioElement) => void, onerror: (e: ErrorEvent) => void };


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

  export const toInnerHTML = (documentFragment: DocumentFragment, config: { document: Document }) => {
    // if (documentFragment) {
    const tempDiv = config.document.createElement('div');
    tempDiv.appendChild(documentFragment.cloneNode(true));
    console.log('DocumentFragment innerHTML:', tempDiv.innerHTML);
    return tempDiv.innerHTML;
    // }
  }

  export const nodeList = (documentFragment: DocumentFragment) => {
    return Array.from(documentFragment.childNodes)
  }

  export const cloneNodeList = (documentFragment: DocumentFragment) => {
    return Array.from(documentFragment.childNodes).map(node => node.cloneNode(true));
  }
}