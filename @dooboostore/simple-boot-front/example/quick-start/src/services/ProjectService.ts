import {Sim} from '@dooboostore/simple-boot/decorators/SimDecorator';
import { SimstanceManager } from '@dooboostore/simple-boot/simstance/SimstanceManager';

@Sim
export class ProjectService {
    constructor(public sim: SimstanceManager) {
        // console.log('----sim', sim);
    }
    sum(a: number, b: number): number {
        return a + b;
    }
}