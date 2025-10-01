import { Runnable } from '@dooboostore/core/runs/Runnable';
import { Subject } from '@dooboostore/core/message/Subject';
import { BehaviorSubject } from '@dooboostore/core/message/BehaviorSubject';

export class MessageExample implements Runnable {
  run(): void {
    console.log('\n=== Message/Observable Example ===\n');
    
    // Subject example
    console.log('1. Subject Example:');
    const subject = new Subject<string>();
    
    const sub1 = subject.asObservable().subscribe((value) => {
      console.log('  Observer 1 received:', value);
    });
    
    const sub2 = subject.asObservable().subscribe((value) => {
      console.log('  Observer 2 received:', value);
    });
    
    subject.next('Hello');
    subject.next('World');
    
    // BehaviorSubject example
    console.log('\n2. BehaviorSubject Example (with initial value):');
    const behaviorSubject = new BehaviorSubject<number>(0);
    
    const subA = (behaviorSubject as any).asObservable().subscribe((value: number) => {
      console.log('  Observer A received:', value);
    });
    
    behaviorSubject.next(1);
    behaviorSubject.next(2);
    
    // New subscriber gets the last value
    console.log('  New subscriber joins:');
    const subB = (behaviorSubject as any).asObservable().subscribe((value: number) => {
      console.log('  Observer B received:', value);
    });
    
    behaviorSubject.next(3);
    
    console.log('\n3. BehaviorSubject getValue:');
    console.log('  Current value:', behaviorSubject.getValue());
    
    // Clean up
    sub1.unsubscribe();
    sub2.unsubscribe();
    subA.unsubscribe();
    subB.unsubscribe();
    
    console.log('\n=========================\n');
  }
}
