import { Element } from '../elements/Element';

/**
 * **`HTMLCollection`** represents a generic collection of HTML elements.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLCollection)
 */
export class HTMLCollection {
    // 인덱스 시그니처 선언
    [index: number]: Element;
    
    private _elements: Element[] = [];

    constructor(elements: Element[] = []) {
        this._elements = [...elements];
        
        // 인덱스 시그니처 구현을 위한 프록시 설정
        return new Proxy(this, {
            get(target, prop) {
                // 숫자 인덱스인 경우
                if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                    const index = parseInt(prop, 10);
                    return target._elements[index] || null;
                }
                // 일반 프로퍼티/메서드인 경우
                return (target as any)[prop];
            },
            
            set(target, prop, value) {
                // 숫자 인덱스 설정 방지 (읽기 전용)
                if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                    return false;
                }
                (target as any)[prop] = value;
                return true;
            },
            
            has(target, prop) {
                if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                    const index = parseInt(prop, 10);
                    return index >= 0 && index < target._elements.length;
                }
                return prop in target;
            }
        });
    }

    /**
     * Returns the number of elements in the collection.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLCollection/length)
     */
    get length(): number {
        return this._elements.length;
    }

    /**
     * Returns the element at the specified index, or null if the index is out of range.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLCollection/item)
     */
    item(index: number): Element | null {
        if (index < 0 || index >= this._elements.length) {
            return null;
        }
        return this._elements[index];
    }

    /**
     * Returns the element with the specified ID or name, or null if no such element exists.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLCollection/namedItem)
     */
    namedItem(name: string): Element | null {
        for (const element of this._elements) {
            if (element.id === name || element.getAttribute('name') === name) {
                return element;
            }
        }
        return null;
    }

    /**
     * Returns an iterator for the collection.
     */
    [Symbol.iterator](): IterableIterator<Element> {
        return this._elements[Symbol.iterator]();
    }

    // 내부적으로 요소 추가/제거를 위한 메서드들 (DOM 조작 시 사용)
    _addElement(element: Element): void {
        this._elements.push(element);
    }

    _removeElement(element: Element): boolean {
        const index = this._elements.indexOf(element);
        if (index !== -1) {
            this._elements.splice(index, 1);
            return true;
        }
        return false;
    }

    _insertElement(index: number, element: Element): void {
        this._elements.splice(index, 0, element);
    }
}
