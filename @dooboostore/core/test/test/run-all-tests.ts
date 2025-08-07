import { observableTest } from './Observable.test';
import { intervalTest } from './interval.test';
import { takeTest } from './take.test';
import { lastValueFromTest } from './lastValueFrom.test';
import { internalIntegrationTest } from './internal-integration.test';
import { internalExtendedTest } from './internal-extended.test';
import { internalOperatorsTest } from './internal-operators.test';
import { allInternalFunctionsTest } from './all-internal-functions.test';
import { timerTest } from './timer.test';
import { creationFunctionsTest } from './creation-functions.test';
import { deferFixTest } from './defer-fix.test';
import { simpleInternalTest } from './simple-internal.test';
import { newOperatorsTest } from './new-operators.test';
import { switchMapTest } from './switchMap.test';
import { catchErrorTest } from './catchError.test';
import { retryTest } from './retry.test';
import { scanReduceTest } from './scan-reduce.test';
import { timingOperatorsTest } from './timing-operators.test';
import { utilityOperatorsTest } from './utility-operators.test';
import { operatorsIntegrationTest } from './operators-integration.test';

export const runAllTests = async () => {
    console.log('🚀 Starting comprehensive test suite for @dooboostore/core message system');
    console.log('='.repeat(80));

    try {
        console.log('\n📋 Test 1: Basic Observable functionality');
        await observableTest();

        console.log('\n⏰ Test 2: Interval function');
        await intervalTest();

        console.log('\n🎯 Test 3: Take operator');
        await takeTest();

        console.log('\n🔚 Test 4: LastValueFrom utility');
        await lastValueFromTest();

        console.log('\n🔗 Test 5: Internal integration');
        await internalIntegrationTest();

        console.log('\n📦 Test 6: Extended internal functions');
        await internalExtendedTest();

        console.log('\n⚙️ Test 7: Internal operators');
        await internalOperatorsTest();

        console.log('\n🎯 Test 8: Comprehensive all functions test');
        await allInternalFunctionsTest();

        console.log('\n⏲️ Test 9: Timer function detailed test');
        await timerTest();

        console.log('\n🏭 Test 10: Creation functions detailed test');
        await creationFunctionsTest();

        console.log('\n🔧 Test 11: Defer fix test');
        await deferFixTest();

        console.log('\n🎯 Test 12: Simple internal functions test');
        await simpleInternalTest();

        console.log('\n🔧 Test 13: New operators test');
        await newOperatorsTest();

        console.log('\n🔀 Test 14: SwitchMap operator detailed test');
        await switchMapTest();

        console.log('\n🛡️ Test 15: CatchError operator detailed test');
        await catchErrorTest();

        console.log('\n🔄 Test 16: Retry operator detailed test');
        await retryTest();

        console.log('\n📊 Test 17: Scan & Reduce operators test');
        await scanReduceTest();

        console.log('\n⏱️ Test 18: Timing operators test');
        await timingOperatorsTest();

        console.log('\n🔧 Test 19: Utility operators test');
        await utilityOperatorsTest();

        console.log('\n🎯 Test 20: Operators integration test');
        await operatorsIntegrationTest();

        console.log('\n' + '='.repeat(80));
        console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
        console.log('✅ Observable system is working correctly');
        console.log('✅ All internal functions are implemented properly');
        console.log('✅ Operator chaining works as expected');
        console.log('✅ Error handling is robust');
        console.log('✅ Type compatibility is maintained');
        console.log('='.repeat(80));

    } catch (error) {
        console.error('\n❌ TEST SUITE FAILED:');
        console.error(error);
        console.log('='.repeat(80));
    }
};