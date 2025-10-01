import { Runnable } from '@dooboostore/core/runs/Runnable';
import { EventUtils } from '@dooboostore/core-web/event/EventUtils';
import { showResult } from '../index';

export class EventExample implements Runnable {
  async run(): Promise<void> {
    showResult('Event Utils', 'Testing event observable utilities');

    // Create a test button
    const output = document.getElementById('output');
    if (!output) return;
    
    const button = document.createElement('button');
    button.textContent = 'Click Me!';
    button.style.padding = '10px 20px';
    button.style.fontSize = '16px';
    button.style.margin = '10px 0';
    button.style.cursor = 'pointer';
    button.style.background = '#667eea';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '6px';
    output.appendChild(button);
    

    showResult('Event Listener Added', 'Click the button to see events in action!', true);
    showResult('Info', 'EventUtils provides Observable-based event handling for DOM elements');
    
    // Observable 예제도 추가
    showResult('Testing Observable', 'Creating Observable-based event listener...', true);
    const clickObservable = EventUtils.htmlElementEventObservable(button, 'click');
    const subscription = clickObservable.subscribe({
      next: (event) => {
        console.log('Observable click event:', event);
        showResult('Observable Event', 'Observable detected a click!', true);
      }
    });
    
    // Cleanup after 30 seconds
    setTimeout(() => {
      subscription.unsubscribe();
      button.remove();
    }, 30000);
  }
}
