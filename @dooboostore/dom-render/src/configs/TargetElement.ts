import {RawSet} from '../rawsets/RawSet';
import {DomRenderConfig} from '../configs/DomRenderConfig';
import {Attrs} from '../rawsets/Attrs';
import {CreatorMetaData} from '../rawsets/CreatorMetaData';
import {Render} from '../rawsets/Render';

export type TargetElement<T = any> = {
    name: string;
    noStrip?:boolean;
    template?: string | ((instance: T)=> Promise<string>);
    styles?: string | (string[]) | ((instance: T)=> Promise<string>);
    callBack: (target: Element, obj: any, rawSet: RawSet, attrs: Attrs, config: DomRenderConfig) => Promise<DocumentFragment | undefined>;
    complete?: (target: Element, obj: any, rawSet: RawSet) => void;
    __render?: Render;
    __creatorMetaData?: CreatorMetaData;
};
