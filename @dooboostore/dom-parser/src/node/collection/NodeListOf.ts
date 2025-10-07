import { Node } from '../Node';
import { NodeList } from './NodeList';

/**
 * **`NodeListOf<TNode>`** is a generic version of NodeList that provides type safety for specific node types.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/NodeList)
 */
export class NodeListOf<TNode extends Node> extends NodeList<TNode> {
    // 인덱스 시그니처를 명시적으로 선언하여 타입 추론 지원
    [index: number]: TNode;
    
    constructor(nodes: TNode[] = []) {
        // 부모 NodeList의 생성자를 호출하면서 타입이 지정된 노드들을 전달
        super(nodes as TNode[]);
    }

    // 타입 안전성을 위한 오버라이드 - 단순 캐스팅만
    item(index: number): TNode | null {
        return super.item(index) as TNode | null;
    }

    forEach(callbackfn: (value: TNode, key: number, parent: NodeListOf<TNode>) => void, thisArg?: any): void {
        super.forEach((node, index) => {
            callbackfn.call(thisArg, node as TNode, index, this);
        }, thisArg);
    }
}