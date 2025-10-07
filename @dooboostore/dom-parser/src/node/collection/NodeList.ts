import { Node } from '../Node';

/**
 * **`NodeList`** objects are collections of nodes, usually returned by properties such as Node.childNodes and methods such as document.querySelectorAll().
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/NodeList)
 */
export class NodeList<T extends Node = Node> {
    // 인덱스 시그니처 선언
    [index: number]: T;
    
    private _nodes: T[] = [];

    constructor(nodes: T[] = []) {
        this._nodes = [...nodes];
        
        // 인덱스 시그니처 구현을 위한 프록시 설정
        return new Proxy(this, {
            get(target, prop) {
                // 숫자 인덱스인 경우
                if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                    const index = parseInt(prop, 10);
                    return target._nodes[index] || null;
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
                    return index >= 0 && index < target._nodes.length;
                }
                return prop in target;
            }
        });
    }

    /**
     * The **`NodeList.length`** property returns the number of items in a NodeList.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/NodeList/length)
     */
    get length(): number {
        return this._nodes.length;
    }

    /**
     * Returns a node from a `NodeList` by index.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/NodeList/item)
     */
    item(index: number): T | null {
        if (index < 0 || index >= this._nodes.length) {
            return null;
        }
        return this._nodes[index];
    }

    /**
     * Executes a provided function once for each `Node` value in the `NodeList`.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/NodeList/forEach)
     */
    forEach(callbackfn: (value: T, key: number, parent: NodeList) => void, thisArg?: any): void {
        this._nodes.forEach((node, index) => {
            callbackfn.call(thisArg, node, index, this);
        });
    }

    // 내부적으로 노드 추가/제거를 위한 메서드들 (DOM 조작 시 사용)
    _addNode(node: T): void {
        this._nodes.push(node);
    }

    _removeNode(node: T): boolean {
        const index = this._nodes.indexOf(node);
        if (index !== -1) {
            this._nodes.splice(index, 1);
            return true;
        }
        return false;
    }

    _insertNode(index: number, node: T): void {
        this._nodes.splice(index, 0, node);
    }

    // Iterator 지원 (for...of 사용 가능)
    *[Symbol.iterator](): Iterator<T> {
        for (const node of this._nodes) {
            yield node;
        }
    }

    /**
     * Returns an iterator allowing to go through all keys contained in this object.
     * The keys are unsigned integer (index).
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/NodeList/keys)
     */
    *keys(): IterableIterator<number> {
        for (let i = 0; i < this._nodes.length; i++) {
            yield i;
        }
    }

    /**
     * Returns an iterator allowing to go through all values contained in this object.
     * The values are Node objects.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/NodeList/values)
     */
    *values(): IterableIterator<T> {
        for (const node of this._nodes) {
            yield node;
        }
    }

    /**
     * Returns an iterator allowing to go through all key/value pairs contained in this object.
     * The key is an unsigned integer (index) and the value is a Node object.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/NodeList/entries)
     */
    *entries(): IterableIterator<[number, T]> {
        for (let i = 0; i < this._nodes.length; i++) {
            yield [i, this._nodes[i]];
        }
    }
}