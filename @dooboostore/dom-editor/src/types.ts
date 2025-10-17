/**
 * Type definitions for DOM Editor
 */

export type DragPosition = 'before' | 'after' | 'child';

export interface DragState {
  isDragging: boolean;
  isDragReady: boolean;
  draggedElement: HTMLElement | null;
  dragStartPos: { x: number; y: number };
  dragOffset: { x: number; y: number };
}

export interface TouchState {
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

export interface AnimationOptions {
  duration?: number;
  easing?: string;
  onComplete?: () => void;
}

export interface EditorEvent {
  type: string;
  element?: HTMLElement;
  data?: any;
  timestamp: number;
}

export type EditorEventHandler = (event: EditorEvent) => void;

export interface EditorEventMap {
  'element:select': EditorEvent;
  'element:deselect': EditorEvent;
  'element:add': EditorEvent;
  'element:delete': EditorEvent;
  'element:move': EditorEvent;
  'drag:start': EditorEvent;
  'drag:end': EditorEvent;
  'content:change': EditorEvent;
}