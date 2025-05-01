import { DrawData } from './DrawData';

export interface Drawable<T = any> {
    draw(draw: DrawData<T>): void;
}
