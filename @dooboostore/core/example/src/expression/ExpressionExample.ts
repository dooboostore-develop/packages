import { Runnable } from '@dooboostore/core/runs/Runnable';
import { Expression } from '@dooboostore/core/expression/Expression';

export class ExpressionExample implements Runnable {
  run(): void {
    console.log('\n=== Expression Example ===\n');
    
    // Basic expression binding
    console.log('1. Basic Expression Binding:');
    const template1 = 'Hello ${name}, you have ${count} messages!';
    const data1 = { name: 'John', count: 5 };
    const result1 = Expression.bindExpression(template1, data1);
    console.log('  Template:', template1);
    console.log('  Data:', data1);
    console.log('  Result:', result1);
    
    // Expression with functions
    console.log('\n2. Expression with Functions:');
    const template2 = 'User ${name} has ${format:count} items';
    const data2 = { 
      name: 'Alice', 
      count: 1000,
      format: (value: number) => value.toLocaleString()
    };
    const result2 = Expression.bindExpression(template2, data2);
    console.log('  Template:', template2);
    console.log('  Data:', { name: data2.name, count: data2.count, format: 'function' });
    console.log('  Result:', result2);
    
    // Complex expression with multiple functions
    console.log('\n3. Complex Expression with Multiple Functions:');
    const template3 = 'Welcome ${name}! Your score is ${format:score} (${grade:score})';
    const data3 = {
      name: 'Bob',
      score: 85,
      format: (value: number) => value.toString().padStart(3, '0'),
      grade: (value: number) => {
        if (value >= 90) return 'A';
        if (value >= 80) return 'B';
        if (value >= 70) return 'C';
        return 'D';
      }
    };
    const result3 = Expression.bindExpression(template3, data3);
    console.log('  Template:', template3);
    console.log('  Data:', { name: data3.name, score: data3.score, format: 'function', grade: 'function' });
    console.log('  Result:', result3);
    
    // Expression with missing data
    console.log('\n4. Expression with Missing Data:');
    const template4 = 'Hello ${name}, your role is ${role}';
    const data4 = { name: 'Charlie' }; // role is missing
    const result4 = Expression.bindExpression(template4, data4);
    console.log('  Template:', template4);
    console.log('  Data:', data4);
    console.log('  Result:', result4);
    
    // Path expression parsing
    console.log('\n5. Path Expression Parsing:');
    const pathName1 = '/users/123/profile';
    const urlExpression1 = '/users/{id}/profile';
    const pathData1 = Expression.Path.pathNameData(pathName1, urlExpression1);
    console.log('  Path:', pathName1);
    console.log('  Expression:', urlExpression1);
    console.log('  Parsed Data:', pathData1);
    
    const pathName2 = '/api/v1/posts/456/comments';
    const urlExpression2 = '/api/v1/posts/{postId}/comments';
    const pathData2 = Expression.Path.pathNameData(pathName2, urlExpression2);
    console.log('  Path:', pathName2);
    console.log('  Expression:', urlExpression2);
    console.log('  Parsed Data:', pathData2);
    
    // Path expression with regex validation
    console.log('\n6. Path Expression with Regex Validation:');
    const pathName3 = '/users/abc123';
    const urlExpression3 = '/users/{id:[0-9]+}';
    const pathData3 = Expression.Path.pathNameData(pathName3, urlExpression3);
    console.log('  Path:', pathName3);
    console.log('  Expression:', urlExpression3);
    console.log('  Parsed Data (should be undefined due to regex mismatch):', pathData3);
    
    const pathName4 = '/users/123456';
    const pathData4 = Expression.Path.pathNameData(pathName4, urlExpression3);
    console.log('  Path:', pathName4);
    console.log('  Expression:', urlExpression3);
    console.log('  Parsed Data (should match):', pathData4);
    
    // Complex path expression
    console.log('\n7. Complex Path Expression:');
    const pathName5 = '/api/v2/users/123/posts/456/edit';
    const urlExpression5 = '/api/v{version}/users/{userId:[0-9]+}/posts/{postId:[0-9]+}/edit';
    const pathData5 = Expression.Path.pathNameData(pathName5, urlExpression5);
    console.log('  Path:', pathName5);
    console.log('  Expression:', urlExpression5);
    console.log('  Parsed Data:', pathData5);
    
    // Expression with nested objects
    console.log('\n8. Expression with Nested Objects:');
    const template5 = 'User ${user.name} from ${user.address.city} has ${user.stats.posts} posts';
    const data5 = {
      user: {
        name: 'David',
        address: {
          city: 'Seoul'
        },
        stats: {
          posts: 42
        }
      }
    };
    const result5 = Expression.bindExpression(template5, data5);
    console.log('  Template:', template5);
    console.log('  Data:', JSON.stringify(data5, null, 2));
    console.log('  Result:', result5);
    
    // Expression with array access
    console.log('\n9. Expression with Array Access:');
    const template6 = 'First item: ${items.0}, Last item: ${getLast:items}';
    const data6 = {
      items: ['apple', 'banana', 'cherry'],
      getLast: (arr: string[]) => arr[arr.length - 1]
    };
    const result6 = Expression.bindExpression(template6, data6);
    console.log('  Template:', template6);
    console.log('  Data:', { items: data6.items, getLast: 'function' });
    console.log('  Result:', result6);
    
    // Multiple expressions in one template
    console.log('\n10. Multiple Expressions in One Template:');
    const template7 = '${greeting} ${name}! Today is ${date} and you have ${count} ${pluralize:count,item}';
    const data7 = {
      greeting: 'Good morning',
      name: 'Emma',
      date: new Date().toLocaleDateString(),
      count: 1,
      pluralize: (count: number, word: string) => count === 1 ? word : word + 's'
    };
    const result7 = Expression.bindExpression(template7, data7);
    console.log('  Template:', template7);
    console.log('  Data:', { ...data7, pluralize: 'function' });
    console.log('  Result:', result7);
    
    console.log('\n=========================\n');
  }
}