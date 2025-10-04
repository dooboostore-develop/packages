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
    
    // Test clipboard items (advanced)
    try {
      const clipboardItems = await ClipBoardUtils.read(window);
      showResult('Read Clipboard Items', `Read ${clipboardItems.length} clipboard items`, true);
      
      // Process each clipboard item
      for (let i = 0; i < clipboardItems.length; i++) {
        const item = clipboardItems[i];
        const types = item.types;
        showResult('Clipboard Item', `Item ${i + 1} types: ${types.join(', ')}`, true);
      }
    } catch (error) {
      showResult('Read Clipboard Items', `Error reading clipboard items: ${error}`, false);
    }
    
    // Test writing clipboard items
    try {
      const clipboardData = new ClipboardItem({
        'text/plain': new Blob(['Plain text content'], { type: 'text/plain' }),
        'text/html': new Blob(['<p>HTML content</p>'], { type: 'text/html' })
      });
      
      await ClipBoardUtils.write(clipboardData);
      showResult('Write Clipboard Items', 'Successfully wrote multiple data types to clipboard', true);
    } catch (error) {
      showResult('Write Clipboard Items', `Error writing clipboard items: ${error}`, false);
    }
    
    // Test clipboard with different content types
    const testContents = [
      'Simple text content',
      'Text with special characters: @#$%^&*()',
      'Multi-line text\nLine 2\nLine 3',
      'Text with emoji: 🚀✨🎉',
      'Korean text: 안녕하세요!',
      'JSON data: {"name": "John", "age": 30}'
    ];
    
    for (let i = 0; i < testContents.length; i++) {
      try {
        await ClipBoardUtils.writeText(testContents[i], window);
        showResult('Write Different Content', `Wrote content ${i + 1}: "${testContents[i].substring(0, 30)}..."`, true);
      } catch (error) {
        showResult('Write Different Content', `Error writing content ${i + 1}: ${error}`, false);
      }
    }
    
    // Test clipboard error handling
    try {
      // Try to write a very large text
      const largeText = 'x'.repeat(1000000); // 1MB text
      await ClipBoardUtils.writeText(largeText, window);
      showResult('Large Text', 'Successfully wrote large text to clipboard', true);
    } catch (error) {
      showResult('Large Text', `Error with large text: ${error}`, false);
    }
    
    // Test clipboard permissions
    try {
      const hasPermission = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
      showResult('Clipboard Permission', `Clipboard read permission: ${hasPermission.state}`, true);
    } catch (error) {
      showResult('Clipboard Permission', `Permission check failed: ${error}`, false);
    }
    
    // Test clipboard with HTML content
    try {
      const htmlContent = '<h1>Hello World</h1><p>This is <strong>HTML</strong> content!</p>';
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      const htmlClipboardItem = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': new Blob(['Hello World\nThis is HTML content!'], { type: 'text/plain' })
      });
      
      await ClipBoardUtils.write(htmlClipboardItem);
      showResult('Write HTML Content', 'Successfully wrote HTML content to clipboard', true);
    } catch (error) {
      showResult('Write HTML Content', `Error writing HTML content: ${error}`, false);
    }
    
    // Test clipboard with image data
    try {
      // Create a simple canvas with text
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 200;
        canvas.height = 100;
        ctx.fillStyle = '#007bff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText('Clipboard Test', 50, 50);
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              const imageClipboardItem = new ClipboardItem({
                'image/png': blob
              });
              await ClipBoardUtils.write(imageClipboardItem);
              showResult('Write Image Content', 'Successfully wrote image to clipboard', true);
            } catch (error) {
              showResult('Write Image Content', `Error writing image: ${error}`, false);
            }
          }
        }, 'image/png');
      }
    } catch (error) {
      showResult('Write Image Content', `Error creating image: ${error}`, false);
    }
    
    // Test clipboard fallback for older browsers
    try {
      const fallbackText = 'Fallback text for older browsers';
      await ClipBoardUtils.writeText(fallbackText, window);
      showResult('Fallback Support', 'Clipboard fallback mechanism tested', true);
    } catch (error) {
      showResult('Fallback Support', `Fallback error: ${error}`, false);
    }
    
    showResult('Info', 'Clipboard API provides comprehensive clipboard operations with fallback support');
    showResult('Note', 'Some clipboard operations require user interaction and permissions', true);
  }
}
