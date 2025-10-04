import { Runnable } from '@dooboostore/core/runs/Runnable';
import { EventUtils } from '@dooboostore/core-web/event/EventUtils';
import { showResult } from '../index';

export class EventExample implements Runnable {
  async run(): Promise<void> {
    showResult('Event Utils', 'Testing event handling with Observable pattern');
    
    // Create a test button element
    const testButton = document.createElement('button');
    testButton.textContent = 'Click Me!';
    testButton.style.padding = '10px 20px';
    testButton.style.margin = '10px';
    testButton.style.backgroundColor = '#007bff';
    testButton.style.color = 'white';
    testButton.style.border = 'none';
    testButton.style.borderRadius = '4px';
    testButton.style.cursor = 'pointer';
    
    // Add button to output
    const output = document.getElementById('output');
    if (output) {
      output.appendChild(testButton);
    }
    
    // Subscribe to click events
    let clickCount = 0;
    const clickSubscription = EventUtils.htmlElementEventObservable(testButton, 'click').subscribe({
      next: (event) => {
        clickCount++;
        showResult('Click Event', `Button clicked ${clickCount} times!`, true);
        
        if (clickCount >= 3) {
          showResult('Event Cleanup', 'Unsubscribing after 3 clicks', true);
          clickSubscription.unsubscribe();
        }
      }
    });
    
    // Subscribe to mouse events
    const mouseSubscription = EventUtils.htmlElementEventObservable(testButton, 'mouseenter').subscribe({
      next: (event) => {
        showResult('Mouse Enter', 'Mouse entered button area', true);
      }
    });
    
    // Subscribe to mouse leave events
    const mouseLeaveSubscription = EventUtils.htmlElementEventObservable(testButton, 'mouseleave').subscribe({
      next: (event) => {
        showResult('Mouse Leave', 'Mouse left button area', true);
      }
    });
    
    // Clean up after 10 seconds
    setTimeout(() => {
      clickSubscription.unsubscribe();
      mouseSubscription.unsubscribe();
      mouseLeaveSubscription.unsubscribe();
      showResult('Cleanup', 'All event subscriptions cleaned up', true);
    }, 10000);
    
    showResult('Info', 'EventUtils provides reactive event handling with Observable pattern');
    showResult('Instructions', 'Click the button above to test event handling!', true);
  }
}