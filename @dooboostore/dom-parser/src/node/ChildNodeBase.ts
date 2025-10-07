import { NodeBase } from './NodeBase';
import { ChildNode } from './ChildNode';
// import {Text} from "./Text";

/**
 * Base implementation of the ChildNode interface
 */
export abstract class ChildNodeBase extends NodeBase implements ChildNode {
    
    // ChildNode interface implementation
    after(...nodes: (NodeBase | string)[]): void {
        if (!this.parentNode) return;
        
        const nextSibling = this.nextSibling;
        for (const node of nodes) {
            if (typeof node === 'string') {
                const { TextBase } = require('./TextBase');
                const textNode = new TextBase(node, this._ownerDocument);
                this.parentNode.insertBefore(textNode, nextSibling);
            } else {
                this.parentNode.insertBefore(node, nextSibling);
            }
        }
    }

    before(...nodes: (NodeBase | string)[]): void {
        if (!this.parentNode) return;
        
        for (const node of nodes) {
            if (typeof node === 'string') {
                const { TextBase } = require('./TextBase');
                const textNode = new TextBase(node, this._ownerDocument);
                this.parentNode.insertBefore(textNode, this);
            } else {
                this.parentNode.insertBefore(node, this);
            }
        }
    }

    remove(): void {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    }

    replaceWith(...nodes: (NodeBase | string)[]): void {
        if (!this.parentNode) return;
        
        this.before(...nodes);
        this.remove();
    }
}

// TextNode is now in a separate file