import { Runnable } from '@dooboostore/core/runs/Runnable';
import { WindowUtils } from '@dooboostore/core-web/window/WindowUtils';
import { showResult } from '../index';

export class WindowExample implements Runnable {
  async run(): Promise<void> {
    showResult('Window Utils', 'Testing window event observable utilities');
    
    // Create scroll observable
    const scrollObservable = WindowUtils.eventObservable(window, 'scroll');
    let scrollCount = 0;
    
    const subscription = scrollObservable.subscribe((event) => {
      scrollCount++;
      const scrollY = window.scrollY;
      showResult('Scroll Event', `Scroll count: ${scrollCount}, Y position: ${scrollY}px`, true);
    });
    
    showResult('Scroll Observable Created', 'Try scrolling the page to see events!', true);
    
    // Create resize observable
    const resizeObservable = WindowUtils.eventObservable(window, 'resize');
    let resizeCount = 0;
    
    const resizeSubscription = resizeObservable.subscribe((event) => {
      resizeCount++;
      showResult('Resize Event', `Resize count: ${resizeCount}, Window size: ${window.innerWidth}x${window.innerHeight}`, true);
    });
    
    showResult('Resize Observable Created', 'Try resizing the window to see events!', true);
    showResult('Info', 'WindowUtils provides Observable-based event handling for window events');
    
    // Cleanup after 30 seconds
    setTimeout(() => {
      subscription.unsubscribe();
      resizeSubscription.unsubscribe();
      showResult('Cleanup', 'Event subscriptions unsubscribed', true);
    }, 30000);
  }
}
