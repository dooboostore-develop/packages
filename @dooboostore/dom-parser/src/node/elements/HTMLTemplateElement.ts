import { HTMLElementBase } from './HTMLElementBase';
import { DocumentFragmentBase } from '../DocumentFragmentBase';
import { Node, TEXT_NODE } from "../Node";
import {Text} from '../Text'
import {ElementFactory} from '../../factory/ElementFactory';
import { NodeBase } from "../NodeBase";

/**
 * The **`HTMLTemplateElement`** class represents an HTML `<template>` element.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLTemplateElement)
 */
export class HTMLTemplateElement extends HTMLElementBase {
    private _content: DocumentFragmentBase;
    
    constructor(tagName: string, ownerDocument?: any) {
        super(tagName, ownerDocument);
        
        // Create the content DocumentFragment
        this._content = new DocumentFragmentBase(ownerDocument);
        
        // Parse innerHTML into the content fragment instead of the template itself
        this._parseContentFromInnerHTML();
    }

    /**
     * Gets the content DocumentFragment of the template.
     */
    get content(): DocumentFragmentBase {
        return this._content;
    }

    /**
     * Override innerHTML setter to populate the content fragment
     */
    set innerHTML(value: string) {
        // Clear existing content
        while (this._content.childNodes.length > 0) {
            const child = this._content.childNodes[0];
            if (child) {
                this._content.removeChild(child);
            }
        }

        // Parse HTML into content fragment
        if (value.trim()) {
            this._parseHTMLIntoContent(value);
        }
    }

    /**
     * Override innerHTML getter to return content fragment's innerHTML
     */
    get innerHTML(): string {
        // Generate HTML from content fragment's children
        let html = '';
        for (let i = 0; i < this._content.childNodes.length; i++) {
            const child = this._content.childNodes[i];
            if (child && 'outerHTML' in child) {
                html += (child as any).outerHTML;
            } else if (child && child.nodeType === TEXT_NODE) {
                html += (child as any).textContent || '';
            } else if (child && child.nodeType === 8) { // COMMENT_NODE
                html += `<!--${(child as any).textContent || ''}-->`;
            }
        }
        return html;
    }

    /**
     * Override appendChild to add children to both template and content
     * Template elements can have direct children, and they're also copied to content
     */
    appendChild<T extends Node>(node: T): T {
        // Add to template itself (like normal element)
        const result = super.appendChild(node);
        
        // Also add a clone to the content fragment
        if ('cloneNode' in node) {
            this._content.appendChild((node as any).cloneNode(true));
        }
        
        return result;
    }

    private _parseContentFromInnerHTML(): void {
        // If template already has children from parsing, move them to content
        const children = [...this._childNodesInternal];
        for (const child of children) {
            if (child) {
                this.removeChild(child);
                this._content.appendChild(child);
            }
        }
    }

    private _parseHTMLIntoContent(html: string): void {
        // Better approach: Create a temporary container and leverage ElementBase's innerHTML
        // This avoids code duplication and ensures consistency
        const tempContainer = new (require('./ElementBase').ElementBase)('div', this._ownerDocument);
        
        // Use ElementBase's proven innerHTML parsing
        tempContainer.innerHTML = html;
        
        // Move all parsed children to the content fragment
        while (tempContainer.firstChild) {
            this._content.appendChild(tempContainer.firstChild);
        }
    }


}