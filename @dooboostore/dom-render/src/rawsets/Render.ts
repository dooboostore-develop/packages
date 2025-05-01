import { CreatorMetaData } from './CreatorMetaData';
import { Router } from '../routers/Router';
import { RawSet } from './RawSet';

export type Render = {
    rawSet?: RawSet;
    scripts?: { [n: string]: any };
    bindScript?: string;
    renderScript?: string;
    element?: any;
    attribute?: any;
    creatorMetaData?: CreatorMetaData;
    router?: Router;
    range?: any;
    value?: any;
    currentThis?: any;
    currentThisPath?: any;
    nearThisPath?: string,
    nearThis?: any;
    parentThisPath?: string,
    parentThis?: any,
    rootObject?: any,
    [n: string]: any; // component?: any; //component instance
}
