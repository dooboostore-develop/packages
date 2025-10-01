import {Script} from '@dooboostore/simple-boot-front/decorators/Script';
import {Sim} from '@dooboostore/simple-boot/decorators/SimDecorator';
import {ScriptRunnable} from '@dooboostore/simple-boot-front/script/ScriptRunnable';
@Sim
@Script({
    name: 'concat'
})
export class ConcatScript extends ScriptRunnable {
    run(data1: string, data2: string): any {
        return data1 + ' or ' + data2;
    }
}