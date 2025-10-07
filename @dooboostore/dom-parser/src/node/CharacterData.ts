import { Node } from './Node';
import { ChildNode } from './ChildNode';

/**
 * The **`CharacterData`** abstract interface represents a Node object that contains characters.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData)
 */
export interface CharacterData extends Node, ChildNode {
    /**
     * The **`CharacterData.data`** property represents the textual data contained in this object.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/data)
     */
    data: string;
    
    /**
     * The **`CharacterData.length`** read-only property returns the number of characters in the contained data.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/length)
     */
    readonly length: number;
    
    /**
     * The **`CharacterData.appendData()`** method appends the given string to the CharacterData.data string.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/appendData)
     */
    appendData(data: string): void;
    
    /**
     * The **`CharacterData.deleteData()`** method removes the specified amount of characters.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/deleteData)
     */
    deleteData(offset: number, count: number): void;
    
    /**
     * The **`CharacterData.insertData()`** method inserts the provided data into this CharacterData node's current data.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/insertData)
     */
    insertData(offset: number, data: string): void;
    
    /**
     * The **`CharacterData.replaceData()`** method replaces a portion of the existing data with the specified data.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/replaceData)
     */
    replaceData(offset: number, count: number, data: string): void;
    
    /**
     * The **`CharacterData.substringData()`** method returns a portion of the existing data.
     * 
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/substringData)
     */
    substringData(offset: number, count: number): string;
}