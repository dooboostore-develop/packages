import { Runnable } from '@dooboostore/core/runs/Runnable';
import { RawSet } from '@dooboostore/dom-render/rawsets/RawSet';
import { DomRenderProxy } from '@dooboostore/dom-render/DomRenderProxy';
export abstract class ScriptRunnable implements Runnable {
    // 훔 아래 로직이? 왜있었는지 까먹었지만 ..훔 제거해야될듯?
    public rawSets = new Map<RawSet, any>();
    public render() {
        this.rawSets.forEach((value, key) => {
            if (key.isConnected) {
                (value._DomRender_proxy as DomRenderProxy<any>)?.render([key]);
            } else {
                this.rawSets.delete(key);
            }
        })
    }
    abstract run(...arg: any): any;
}
