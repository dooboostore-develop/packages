import { DomRenderFinalProxy } from '../types/Types';

export type ComponentSetConfig = {objPath?: string | null, beforeComponentSet?: ComponentSet};
export class ComponentSet<T = any> {
    private _config: ComponentSetConfig;
    private _template?: string;
    private _styles?: string[] | string;
    constructor(public obj: T, source: {template?: string, styles?: (string[]) | string}, config?: ComponentSetConfig) {
        this._template = source.template;
        this._styles = source.styles;
        this._config = DomRenderFinalProxy.final(Object.assign({objPath: 'obj'} as ComponentSetConfig, config))
    }
    get template() {
        return this._template;
    }
    get styles() {
        return this._styles;
    }
    get config() {
        return this._config;
    }
    public setTemplateStyle(set: {template?: string, styles?: string | (string[])}) {
        this._template = set.template;
        this._styles = set.styles;
    }
}
