import { ELEMENT_NODE, TEXT_NODE } from './Node';
import { SVG_NAMESPACE, MATHML_NAMESPACE } from '../utils/namespaces';

export interface GetHTMLOptions {
  serializableShadowRoots?: boolean;
  shadowRoots?: any[];
}

const COMMENT_NODE = 8;

const VOID_TAGS = ['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];

function escapeText(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\u00A0/g, '&nbsp;');
}

function escapeAttr(str: string): string {
  return escapeText(str).replace(/"/g, '&quot;');
}

function qualifiedTagName(element: any): string {
  const ns: string | null = element.namespaceURI ?? null;
  if (ns === SVG_NAMESPACE || ns === MATHML_NAMESPACE) return element.tagName;
  return (element.tagName as string).toLowerCase();
}

function openTag(element: any): string {
  const tagName = qualifiedTagName(element);
  const attrs = Array.from(element._attributes?.entries?.() ?? [] as any)
    .map(([name, value]: [string, string]) => (value === '' ? ` ${name}` : ` ${name}="${escapeAttr(value)}"`))
    .join('');
  if (VOID_TAGS.includes(tagName)) return `<${tagName}${attrs} />`;
  return `<${tagName}${attrs}>`;
}

function closeTag(element: any): string {
  const tagName = qualifiedTagName(element);
  if (VOID_TAGS.includes(tagName)) return '';
  return `</${tagName}>`;
}

export function shouldIncludeShadowRoot(shadowRoot: any, options?: GetHTMLOptions): boolean {
  if (!shadowRoot) return false;
  if (options?.shadowRoots && (options.shadowRoots as any[]).includes(shadowRoot)) return true;
  return !!(options?.serializableShadowRoots && (shadowRoot as any).serializable);
}

export function shadowTemplateOpenTag(shadowRoot: any): string {
  let s = `<template shadowrootmode="${(shadowRoot as any).mode}"`;
  if ((shadowRoot as any).delegatesFocus) s += ' shadowrootdelegatesfocus=""';
  if ((shadowRoot as any).serializable) s += ' shadowrootserializable=""';
  if ((shadowRoot as any).clonable) s += ' shadowrootclonable=""';
  return s + '>';
}

/**
 * Serialize one node, expanding includable shadow roots as declarative
 * shadow DOM templates (per getHTML). Mirrors the innerHTML/outerHTML
 * serialization rules (escaping, void tags, qualified SVG/MathML names,
 * template content).
 */
export function serializeNodeWithShadow(node: any, options?: GetHTMLOptions): string {
  const nodeType = node?.nodeType;
  if (nodeType === TEXT_NODE) {
    const text = String((node as any).textContent ?? (node as any)._nodeValue ?? '');
    const parentTag = ((node as any)._parentNodeInternal?.tagName ?? '').toLowerCase?.() ?? '';
    if (parentTag === 'style' || parentTag === 'script') return text;
    return escapeText(text);
  }
  if (nodeType === COMMENT_NODE) {
    return `<!--${(node as any).textContent || ''}-->`;
  }
  if (nodeType !== ELEMENT_NODE) return '';
  return serializeElementWithShadow(node, options);
}

function serializeElementWithShadow(element: any, options?: GetHTMLOptions): string {
  const open = openTag(element);
  if (open.endsWith('/>')) return open;
  let inner = '';
  const shadowRoot = (element as any).shadowRoot ?? (element as any)._shadowRoot ?? null;
  if (shouldIncludeShadowRoot(shadowRoot, options)) {
    inner += shadowTemplateOpenTag(shadowRoot);
    inner += serializeChildrenWithShadow((shadowRoot as any)._childNodesInternal ?? [], options);
    inner += '</template>';
  }
  let nodesToIterate: any[] = (element as any)._childNodesInternal ?? [];
  const tagName = qualifiedTagName(element);
  if (tagName === 'template' && (element as any).content) {
    nodesToIterate = Array.from(((element as any).content.childNodes ?? []) as any);
  }
  inner += serializeChildrenWithShadow(nodesToIterate, options);
  return open + inner + closeTag(element);
}

export function serializeChildrenWithShadow(children: any[] | Iterable<any>, options?: GetHTMLOptions): string {
  let html = '';
  for (const child of children as any) {
    html += serializeNodeWithShadow(child, options);
  }
  return html;
}

/**
 * Convert declarative shadow DOM `<template shadowrootmode>` children into
 * real attached shadow roots (open only, like browsers), in place.
 */
export function attachDeclarativeShadowRoots(root: any): void {
  const childNodesOf = (el: any): any[] => {
    if (el?.tagName === 'TEMPLATE' || el?.tagName === 'template') {
      return Array.from(((el.content?.childNodes ?? el.childNodes) ?? []) as any);
    }
    return Array.from((el?.childNodes ?? []) as any);
  };
  const walk = (node: any): void => {
    for (const child of childNodesOf(node)) {
      if (child?.nodeType === ELEMENT_NODE) walk(child);
    }
    if (!node || node.nodeType === 11 /* DOCUMENT_FRAGMENT */) {
      // Fragments can't host shadow roots; still walk into their children (done above).
    }
    const isElement = node?.nodeType === 1;
    if (!isElement) return;
    for (const tpl of childNodesOf(node).filter(
      (n: any) => n?.nodeType === ELEMENT_NODE && (n.tagName === 'TEMPLATE' || n.tagName === 'template')
    )) {
      const mode = String(tpl.getAttribute?.('shadowrootmode') ?? '').toLowerCase();
      if (mode !== 'open') continue;
      if (typeof node.attachShadow !== 'function') continue;
      const init: any = { mode: 'open' };
      if (tpl.hasAttribute?.('shadowrootdelegatesfocus')) init.delegatesFocus = true;
      if (tpl.hasAttribute?.('shadowrootclonable')) init.clonable = true;
      if (tpl.hasAttribute?.('shadowrootserializable')) init.serializable = true;
      try {
        const shadowRoot = node.attachShadow(init);
        const tplChildren: any[] = childNodesOf(tpl);
        for (const grandchild of tplChildren) {
          shadowRoot.appendChild(grandchild);
        }
        node.removeChild(tpl);
      } catch {
        // Host already has a shadow root: leave the template element in place.
      }
    }
  };
  walk(root);
}
