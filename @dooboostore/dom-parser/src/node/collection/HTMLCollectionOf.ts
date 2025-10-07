import { Element } from '../elements/Element';
import { HTMLCollection } from './HTMLCollection';

/**
 * **`HTMLCollectionOf<T>`** is a generic version of HTMLCollection that provides type safety for specific element types.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLCollection)
 */
export class HTMLCollectionOf<T extends Element> extends HTMLCollection {
    // 인덱스 시그니처를 명시적으로 선언하여 타입 추론 지원
    [index: number]: T;
    
    constructor(elements: T[] = []) {
        // 부모 HTMLCollection의 생성자를 호출하면서 타입이 지정된 요소들을 전달
        super(elements as Element[]);
    }

    // 타입 안전성을 위한 오버라이드 - 단순 캐스팅만
    item(index: number): T | null {
        return super.item(index) as T | null;
    }

    namedItem(name: string): T | null {
        return super.namedItem(name) as T | null;
    }
}