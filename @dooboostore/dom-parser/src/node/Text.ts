import { CharacterData } from './CharacterData';
import { ChildNode } from './ChildNode';
import {TEXT_NODE} from "./Node";

/**
 * The **`Text`** interface represents a text node in the DOM.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Text)
 */
export interface Text extends CharacterData, ChildNode {
    readonly nodeType: typeof TEXT_NODE; // TEXT_NODE
    readonly nodeName: '#text';
    
    /**
     * The **`Text.splitText()`** method breaks the Text node into two nodes at the specified offset, keeping both nodes in the tree as siblings.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Text/splitText)
     */
    splitText(offset: number): Text;
    
    /**
     * The **`Text.wholeText`** read-only property returns the full text of all Text nodes logically adjacent to the node.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Text/wholeText)
     */
    readonly wholeText: string;
}

// Note: TextBase is the implementation class for this interface

