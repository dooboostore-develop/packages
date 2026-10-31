/**
 * DOM-tree helpers for selector matching. Pure functions over node shapes —
 * no selector parsing here.
 */

export function isInputElement(element: any): boolean {
    const tagName = (element.tagName || '').toLowerCase();
    return tagName === 'input' || tagName === 'select' || tagName === 'textarea';
}

export function isFirstChild(element: any): boolean {
    const parent = element.parentNode;
    if (!parent || !('children' in parent)) return false;

    const children = (parent as any).children;
    return children.length > 0 && children[0] === element;
}

export function isLastChild(element: any): boolean {
    const parent = element.parentNode;
    if (!parent || !('children' in parent)) return false;

    const children = (parent as any).children;
    return children.length > 0 && children[children.length - 1] === element;
}

export function getChildIndex(element: any): number {
    const parent = element.parentNode;
    if (!parent || !('children' in parent)) return -1;

    const children = (parent as any).children;
    for (let i = 0; i < children.length; i++) {
        if (children[i] === element) {
            return i;
        }
    }
    return -1;
}

export function elementSiblings(element: any): any[] {
    const parent = element.parentNode as any;
    if (!parent || !('children' in parent)) return [];
    return Array.from(parent.children);
}

export function getChildIndexOfType(element: any): number {
    const tag = (element.tagName || '').toLowerCase();
    let index = 0;
    for (const sibling of elementSiblings(element)) {
        if (sibling === element) return index;
        if (((sibling.tagName || '') as string).toLowerCase() === tag) index++;
    }
    return -1;
}

export function getChildIndexFromEnd(element: any): number {
    const siblings = elementSiblings(element);
    const i = siblings.indexOf(element as any);
    return i === -1 ? -1 : siblings.length - 1 - i;
}

export function getChildIndexOfTypeFromEnd(element: any): number {
    const tag = (element.tagName || '').toLowerCase();
    const same = elementSiblings(element).filter(s => ((s.tagName || '') as string).toLowerCase() === tag);
    const i = same.indexOf(element as any);
    return i === -1 ? -1 : same.length - 1 - i;
}

export function getElementSiblingCount(element: any): number {
    return elementSiblings(element).length;
}

export function getTreeRoot(element: any): any {
    let node = element;
    while (node && node.parentNode) {
        node = node.parentNode;
    }
    return node;
}

export function previousElementSibling(element: any): any {
    let sibling = element.previousSibling;
    while (sibling) {
        if (sibling.nodeType === 1) return sibling;
        sibling = sibling.previousSibling;
    }
    return null;
}

/**
 * Match a 0-based element index against an :nth-child() an+b expression.
 * Supports odd/even, plain integers and an+b steps (2n, 2n+1, -n+2, n ...).
 */
export function matchesNth(index: number, expr: string): boolean {
    const s = expr.toLowerCase().replace(/\s+/g, '');
    let a: number;
    let b: number;
    if (s === 'odd') {
        a = 2; b = 1;
    } else if (s === 'even') {
        a = 2; b = 0;
    } else {
        const intMatch = s.match(/^([+-]?\d+)$/);
        if (intMatch) {
            a = 0; b = parseInt(intMatch[1], 10);
        } else {
            const nMatch = s.match(/^([+-]?\d*)n([+-]\d+)?$/);
            if (!nMatch) return false;
            const aStr = nMatch[1];
            a = aStr === '' || aStr === '+' ? 1 : aStr === '-' ? -1 : parseInt(aStr, 10);
            b = nMatch[2] ? parseInt(nMatch[2], 10) : 0;
        }
    }
    const p = index + 1; // 1-based position
    if (a === 0) return p === b;
    const d = p - b;
    if (a > 0) return d >= 0 && d % a === 0;
    return d <= 0 && d % a === 0;
}

/**
 * Input types with user-alterable values (verified against Chromium;
 * hidden/checkbox/radio/button/submit/reset/image/file/color/range are not).
 */
export const MUTABLE_INPUT_TYPES: ReadonlySet<string> = new Set([
    'number', 'range', 'date', 'month', 'week', 'time', 'datetime-local', 'month',
    'text', 'search', 'tel', 'url', 'password', 'email',
]);

export function isReadWrite(element: any): boolean {
    const tagName = ((element.tagName || '') as string).toLowerCase();
    const hasAttr = (n: string): boolean => typeof element.hasAttribute === 'function' && element.hasAttribute(n);
    if (tagName === 'textarea') return !hasAttr('disabled') && !hasAttr('readonly');
    if (tagName === 'input') {
        if (hasAttr('disabled') || hasAttr('readonly')) return false;
        const type = (((element as any).getAttribute?.('type') as string | null) ?? 'text').toLowerCase();
        return MUTABLE_INPUT_TYPES.has(type);
    }
    const ce = typeof element.getAttribute === 'function' ? element.getAttribute('contenteditable') : null;
    return ce !== null && (ce as string).toLowerCase() !== 'false';
}

/**
 * Input types with min/max range validation (verified against Chromium;
 * text-like and checkbox/radio/button types never participate).
 */
export const RANGE_INPUT_TYPES: ReadonlySet<string> = new Set([
    'number', 'range', 'date', 'month', 'week', 'time', 'datetime-local', 'month',
]);

/**
 * Range validation state: 'in' | 'out' | null (not applicable:
 * wrong element/type, or barred by disabled/readonly).
 */
export function rangeState(element: any): 'in' | 'out' | null {
    if (typeof element.getAttribute !== 'function') return null;
    if (((element.tagName || '') as string).toLowerCase() !== 'input') return null;
    if (element.hasAttribute('disabled') || element.hasAttribute('readonly')) return null;
    const type = ((element.getAttribute('type') as string | null) ?? 'text').toLowerCase();
    if (!RANGE_INPUT_TYPES.has(type)) return null;
    const value: string = typeof element.value === 'string' ? element.value : (element.getAttribute('value') ?? '');
    if (value === '') return 'in';
    const min = element.getAttribute('min');
    const max = element.getAttribute('max');
    if (type === 'number' || type === 'range') {
        const n = parseFloat(value);
        if (Number.isNaN(n)) return 'in'; // sanitizes to empty in browsers
        if (min) { const m = parseFloat(min); if (!Number.isNaN(m) && n < m) return 'out'; }
        if (max) { const m = parseFloat(max); if (!Number.isNaN(m) && n > m) return 'out'; }
        return 'in';
    }
    if (min && value < min) return 'out';
    if (max && value > max) return 'out';
    return 'in';
}

/**
 * Input types that render a placeholder (verified against Chromium;
 * date/time/month/week/datetime-local/color/range/file/hidden and
 * checkboxes do not, even with the attribute present).
 */
export const PLACEHOLDER_INPUT_TYPES: ReadonlySet<string> = new Set([
    'text', 'search', 'tel', 'url', 'password', 'email', 'number',
]);

/**
 * Walk preceding element siblings, returning the first one accepted by `test`.
 */
export function findMatchingSibling(element: any, test: (el: any) => boolean): any {
    let sibling = previousElementSibling(element);
    while (sibling) {
        if (test(sibling)) return sibling;
        sibling = previousElementSibling(sibling);
    }
    return null;
}

/**
 * Walk ancestors (stopping at the shadow root or scoping root),
 * returning the first one accepted by `test`.
 */
export function findMatchingAncestor(element: any, test: (el: any) => boolean, scope?: any, exclusiveBoundary?: any): any {
    let ancestor = element.parentNode;
    while (ancestor) {
        // :has() anchors are exclusive boundaries: compounds must never
        // match the anchor itself (absolutized :scope semantics).
        if (exclusiveBoundary !== undefined && ancestor === exclusiveBoundary) {
            return null;
        }
        if (ancestor === scope) {
            return test(ancestor) ? ancestor : null;
        }
        if (ancestor.nodeType === 11) return null;
        if (ancestor.nodeType === 1 && test(ancestor)) return ancestor;
        ancestor = ancestor.parentNode;
    }
    return null;
}
