import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { SimOption } from '@dooboostore/simple-boot/SimOption';
import { Lifecycle, Sim, SimConfig } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { RandomUtils } from '@dooboostore/core/random/RandomUtils';
import { ConstructorType } from '@dooboostore/core/types';
import { Inject } from '@dooboostore/simple-boot/decorators/inject/Inject';
import { OnSimCreate } from '@dooboostore/simple-boot/lifecycle/OnSimCreate';
import { OnSimCreateCompleted } from '@dooboostore/simple-boot/lifecycle/OnSimCreateCompleted';
import { CacheManager } from '@dooboostore/simple-boot/cache/CacheManager';

class WW{

  constructor(private s:string) {
    console.log('ww constructor')
  }
  say(){
    console.log('ww')
  }
}

abstract class Profile{
  abstract say(): void;
}
@Sim({type: WW})
class ProfileA extends Profile{
   uuid = `ProfileA-${RandomUtils.uuid()}`;
   constructor() {
     super();
     console.log('ProfileA constructor')
   }
  say() {
    console.log('ProfileA say')
  }
}
@Sim({type: WW})
class ProfileB extends Profile{
   uuid = `ProfileB-${RandomUtils.uuid()}`;
   constructor() {
     super();
     console.log('ProfileB constructor')
   }
  say() {
    console.log('ProfileB say')
  }
}


@Sim
class UserA {
   uuid = `UserA-${RandomUtils.uuid()}`;
  constructor(@Inject({type: WW}) public pa: WW[]
              // , p: ProfileA, pp: ProfileB
  ) {
    // console.log('---',pa);
    // console.log('---',pa, p,pp);
    // pa.forEach(it => it.say())
  }
  say() {
    console.log('say')
  }
}

class UserNormalA {
 uuid = `UserNormalA-${RandomUtils.uuid()}`;
 say() {
   console.log('UserNormalA: say:', this.uuid)
 }
}
class UserNormalB {
 uuid = `UserNormalB-${RandomUtils.uuid()}`;
 say() {
   console.log('UserNormalB: say:', this.uuid)
 }
}
class UserNormalC {
 uuid = `UserNormalC-${RandomUtils.uuid()}`;
 say() {
   console.log('UserNormalC: say:', this.uuid)
 }
}

const TTSymbol = Symbol('TT')
// Sim({symbol: TTSymbol})(()=> {
//   return {a: 'name'}
// })
// Sim({symbol: TTSymbol, scope: Lifecycle.Transient})(() =>{
//   console.log('new TT')
//   return {a: 'name'}
// })
// Sim({symbol: TTSymbol, scope: Lifecycle.Singleton})({a: 'name'})

// const TT = () => {
//   return {a: 'name'}
// }

export const diTest = async () => {
  // Helper function to log test results
  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }


  const option = new SimOption();
  const simpleApplication = new SimpleApplication(option);
  const other = new Map<ConstructorType<any> | Function | SimConfig, any>();
  // other.set(UserNormalA, new UserNormalA())
  // other.set(UserNormalB, new UserNormalB())
  // simpleApplication.addSim({symbol: TTSymbol}, {a:2})
  other.set({type: WW}, new UserNormalA())
  other.set({type: WW}, new UserNormalB())
  other.set(WW, new UserNormalC())
  other.set({symbol: TTSymbol, scope: Lifecycle.Transient}, () => {
    console.log('new ')
    return {a: 'name'};
  })
  simpleApplication.run(other);
  const user = simpleApplication.sim(UserA);
 assert(user.pa.length === 5, 'di Test')

  let tt = simpleApplication.sim(TTSymbol);
  console.log('tt', tt);

  let ttt = simpleApplication.sim(TTSymbol);
  console.log('tt', ttt)

  let tttt = simpleApplication.sim(TTSymbol);
  console.log('tt', tttt)

  console.log(tt === ttt)
 // assert(user.pa.length === 5, 'di Test')

}