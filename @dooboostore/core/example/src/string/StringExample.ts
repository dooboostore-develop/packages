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
    const textWithEmoji = 'Hello 👋 World 🌍 ! 🚀';
    console.log('  Original:', textWithEmoji);
    console.log('  Emojis:', StringUtils.pickEmoji(textWithEmoji));
    
    // HTML entity unescaping
    console.log('\n6. HTML Entity Unescaping:');
    const html = 'Price: &pound;100 &amp; &copy;2024';
    console.log('  HTML entities:', html);
    console.log('  Unescaped:', StringUtils.unescape(html));
    
    // Expression execution
    console.log('\n7. Expression Execution:');
    const template = 'Hello ${name}, you have ${count} messages!';
    const data = { name: 'John', count: 5 };
    console.log('  Template:', template);
    console.log('  Data:', data);
    console.log('  Result:', StringUtils.executeExpression(template, data));
    
    // Ellipsis
    console.log('\n8. Ellipsis:');
    const longText = 'This is a very long text that should be truncated';
    console.log('  Original:', longText);
    console.log('  Truncated (20 chars):', StringUtils.ellipsis(longText, 20));
    console.log('  Truncated (50 chars):', StringUtils.ellipsis(longText, 50));
    
    // Korean postposition
    console.log('\n9. Korean Postposition:');
    const koreanNames = ['김철수', '박영희', '이민수'];
    koreanNames.forEach(name => {
      const withEun = StringUtils.appendPostposition(name, { vowel: '은', consonant: '은' });
      const withI = StringUtils.appendPostposition(name, { vowel: '이', consonant: '이' });
      console.log(`  ${name} -> ${withEun}, ${withI}`);
    });
    
    // String appending
    console.log('\n10. String Appending:');
    const baseString = 'Hello';
    console.log('  Base string:', baseString);
    console.log('  Append 3 times "!":', StringUtils.lappend(3, '!'));
    
    // Regex operations
    console.log('\n11. Regex Operations:');
    const textWithNumbers = 'I have 5 apples and 10 oranges, total 15 fruits';
    const numberRegex = /\d+/g;
    const matches = StringUtils.regexExec(numberRegex, textWithNumbers);
    console.log('  Text:', textWithNumbers);
    console.log('  Number matches:', matches.map(m => m[0]));
    
    // Regex replacement
    console.log('\n12. Regex Replacement:');
    const phoneText = 'Call me at 010-1234-5678 or 02-123-4567';
    const phoneRegex = /(\d{3,4})-(\d{3,4})-(\d{4})/g;
    const phoneMatches = StringUtils.regexExec(phoneRegex, phoneText);
    const maskedText = StringUtils.regexExecArrayReplace(phoneText, phoneMatches, (match) => {
      return `${match[1]}-****-${match[3]}`;
    });
    console.log('  Original:', phoneText);
    console.log('  Masked:', maskedText);
    
    // Special character escaping
    console.log('\n13. Special Character Escaping:');
    const specialChars = '.*+?^${}()|[]\\';
    console.log('  Special chars:', specialChars);
    console.log('  Escaped:', StringUtils.escapeSpecialCharacterRegExp(specialChars));
    
    console.log('\n=========================\n');
  }
}