import {Sim} from '@dooboostore/simple-boot/decorators/SimDecorator'
import { ScriptRunnable } from '../script/ScriptRunnable';
import { scripts } from '../decorators/Script';
import { SimstanceManager } from '@dooboostore/simple-boot/simstance/SimstanceManager';
@Sim
export class ScriptService {
    constructor(private simstanceManager: SimstanceManager) {
    }

    public getScript<T = ScriptRunnable>(name: string): T | undefined {
        const val = scripts.get(name)
        let obj: any = undefined;
        if (val) {
            try {
                obj = this.simstanceManager.getOrNewSim({target:val});
            } catch (e) {
                obj = this.simstanceManager.newSim({target:val})
            }
        }
        return obj;
    }
}
