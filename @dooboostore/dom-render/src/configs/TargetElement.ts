import {RawSet} from '../rawsets/RawSet';
import {DomRenderConfig} from 'configs/DomRenderConfig';
import {Attrs} from '../rawsets/Attrs';
import {CreatorMetaData} from '../rawsets/CreatorMetaData';
import {Render} from '../rawsets/Render';

export type TargetElement = {
    name: string;
    noStrip?:boolean;
    template?: string;
    styles?: string | (string[]);
    callBack: (target: Element, obj: any, rawSet: RawSet, attrs: Attrs, config: DomRenderConfig) => Promise<DocumentFragment>;
    complete?: (target: Element, obj: any, rawSet: RawSet) => void;
    __render?: Render;
    __creatorMetaData?: CreatorMetaData;
};
