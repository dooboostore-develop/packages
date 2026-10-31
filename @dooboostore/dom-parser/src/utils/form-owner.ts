/**
 * Form association (HTML Standard, "association of controls and forms").
 *
 * - A listed control with a `form` attribute is owned by the first element
 *   in tree order in the same tree whose ID matches, if that element is a
 *   form. An absent match or a non-form match means NO owner — there is no
 *   fallback to the ancestor form. (Verified against Chromium.)
 * - Without the attribute, the owner is the nearest ancestor form, if any.
 */

const LISTED_TAGS = new Set([
    'BUTTON',
    'FIELDSET',
    'INPUT',
    'OBJECT',
    'OUTPUT',
    'SELECT',
    'TEXTAREA',
]);

export const LISTED_FORM_TAGS = 'button,fieldset,input,object,output,select,textarea';

export function isListedElement(node: any): boolean {
    return !!node && node.nodeType === 1 && LISTED_TAGS.has(String(node.tagName || '').toUpperCase());
}

function findByIdInTree(root: any, id: string): any | null {
    if (!root || !id) return null;
    if (typeof root.getElementById === 'function') {
        return root.getElementById(id);
    }
    // Fallback for element roots (detached trees): manual tree-order walk.
    const queue: any[] = [root];
    for (let head = 0; head < queue.length; head++) {
        const node = queue[head];
        if (node && node.nodeType === 1 && typeof node.getAttribute === 'function' && node.getAttribute('id') === id) {
            return node;
        }
        const children = node ? node._childNodesInternal || node.childNodes : null;
        if (children) {
            for (let i = 0; i < children.length; i++) queue.push(children[i]);
        }
    }
    return null;
}

export function formOwnerFor(control: any): any | null {
    if (!isListedElement(control)) return null;

    const formAttr = typeof control.getAttribute === 'function' ? control.getAttribute('form') : null;
    if (formAttr !== null && formAttr !== undefined) {
        const scope = typeof control.getRootNode === 'function' ? control.getRootNode() : control.ownerDocument;
        const candidate = findByIdInTree(scope || control.ownerDocument, formAttr);
        if (candidate && String(candidate.tagName || '').toUpperCase() === 'FORM') {
            return candidate;
        }
        return null;
    }

    let node = control.parentNode;
    while (node) {
        if (node.nodeType === 1 && String(node.tagName || '').toUpperCase() === 'FORM') {
            return node;
        }
        node = node.parentNode;
    }
    return null;
}
