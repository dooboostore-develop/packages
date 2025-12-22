import {Subject} from "../../src/message";
import {bufferTime} from "../../src/message/operators";
// import {fromEvent, bufferTime, Subject} from 'rxjs';

const subject = new Subject<string>()
const buffered = subject.asObservable().pipe(bufferTime(0));
const subscription = buffered.subscribe(x => console.log('-------', x));

console.log('manealTest start');

let cnt = 0;
const intervalId = setInterval(() => {
  const now = new Date();
  const str = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
  if (cnt < 10) {
    subject.next(str);
  }
  cnt++;
}, 10)

setTimeout(() => {
  subscription.unsubscribe();
  clearInterval(intervalId);
  // console.log('manealTest end - process will exit');
  // process.exit(0);
}, 5000)