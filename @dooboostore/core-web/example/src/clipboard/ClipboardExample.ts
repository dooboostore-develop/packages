import { Runnable } from '@dooboostore/core/runs/Runnable';
import { ClipBoardUtils } from '@dooboostore/core-web/clipboard/ClipBoardUtils';
import { showResult } from '../index';

export class ClipboardExample implements Runnable {
  async run(): Promise<void> {
    showResult('Clipboard API', 'Testing clipboard read/write operations');
    
    // Write text to clipboard
    const testText = 'Hello from @dooboostore/core-web!';
    try {
      await ClipBoardUtils.writeText(testText, window);
      showResult('Write Text', `Successfully wrote to clipboard: "${testText}"`, true);
    } catch (error) {
      showResult('Write Text', `Error: ${error}`, false);
    }
    
    // Read text from clipboard
    try {
      const text = await ClipBoardUtils.readText(window);
      showResult('Read Text', `Read from clipboard: "${text}"`, true);
    } catch (error) {
      showResult('Read Text', 'Note: Reading clipboard requires user permission', false);
    }
    
    showResult('Info', 'Clipboard API allows copy/paste operations programmatically');
  }
}
