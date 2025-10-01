import { Runnable } from '@dooboostore/core/runs/Runnable';
import { StringUtils } from '@dooboostore/core/string/StringUtils';

export class StringExample implements Runnable {
  run(): void {
    console.log('\n=== String Utils Example ===\n');
    
    // Trim examples
    console.log('1. Trim:');
    const text = '  hello world  ';
    console.log('  Original:', `"${text}"`);
    console.log('  Trimmed:', `"${StringUtils.trim(text)}"`);
    
    // Padding examples
    console.log('\n2. Padding:');
    const num = '42';
    console.log('  Original:', num);
    console.log('  Left pad (5 chars with 0):', StringUtils.lpad('0', 5, num));
    console.log('  Right pad (5 chars with -):', StringUtils.rpad('-', 5, num));
    
    // Substring examples
    console.log('\n3. Substring:');
    const str = 'Hello World';
    console.log('  Original:', str);
    console.log('  Left 5 chars:', StringUtils.lsubString(str, 5));
    console.log('  Right 5 chars:', StringUtils.rsubString(str, 5));
    
    // Delete enter/newline
    console.log('\n4. Delete Enter:');
    const multiLine = 'Line 1\nLine 2\rLine 3\r\nLine 4';
    console.log('  Original:', multiLine);
    console.log('  Without newlines:', StringUtils.deleteEnter(multiLine));
    
    // Pick emoji
    console.log('\n5. Pick Emoji:');
    const textWithEmoji = 'Hello 👋 World 🌍 !';
    console.log('  Original:', textWithEmoji);
    console.log('  Emojis:', StringUtils.pickEmoji(textWithEmoji));
    
    // Regex operations
    console.log('\n6. Regex operations:');
    const html = 'Price: &pound;100 &amp; &copy;2024';
    console.log('  HTML entities:', html);
    console.log('  Unescaped:', StringUtils.unescape(html));
    
    console.log('\n=========================\n');
  }
}
