import { Runnable } from '@dooboostore/core/runs/Runnable';
import { DateUtils } from '@dooboostore/core/date/DateUtils';

export class DateExample implements Runnable {
  run(): void {
    console.log('\n=== Date Utils Example ===\n');
    
    const now = new Date();
    console.log('Current date:', now);
    
    // Format example
    console.log('\n1. Format dates:');
    console.log('  yyyy-MM-dd:', DateUtils.format(now, 'yyyy-MM-dd'));
    console.log('  yyyy/MM/dd HH:mm:ss:', DateUtils.format(now, 'yyyy/MM/dd HH:mm:ss'));
    
    // Add time example
    console.log('\n2. Add time:');
    const tomorrow = DateUtils.add({ days: 1 }, now);
    console.log('  Tomorrow:', DateUtils.format(tomorrow, 'yyyy-MM-dd'));
    
    const nextWeek = DateUtils.add({ days: 7 }, now);
    console.log('  Next week:', DateUtils.format(nextWeek, 'yyyy-MM-dd'));
    
    const nextMonth = DateUtils.add({ months: 1 }, now);
    console.log('  Next month:', DateUtils.format(nextMonth, 'yyyy-MM-dd'));
    
    // Age calculation
    console.log('\n3. Age calculation:');
    const birthDate = new Date('1990-01-01');
    console.log('  Birth date:', DateUtils.format(birthDate, 'yyyy-MM-dd'));
    console.log('  Age:', DateUtils.age(birthDate), 'years');
    console.log('  Counting age:', DateUtils.countingAge(birthDate));
    
    // Compare dates
    console.log('\n4. Compare dates:');
    const date1 = new Date('2024-01-01');
    const date2 = new Date('2024-12-31');
    console.log('  Date1:', DateUtils.format(date1, 'yyyy-MM-dd'));
    console.log('  Date2:', DateUtils.format(date2, 'yyyy-MM-dd'));
    console.log('  Compare result:', DateUtils.compare(date1, date2));
    console.log('  Same date?', DateUtils.isSameDate(date1, date2));
    
    console.log('\n=========================\n');
  }
}
