import { Runnable } from '@dooboostore/core/runs/Runnable';
import { ConvertUtils } from '@dooboostore/core/convert/ConvertUtils';

export class ConvertExample implements Runnable {
  run(): void {
    console.log('\n=== Convert Utils Example ===\n');
    
    console.log('1. Object to URL query string:');
    const params = { page: 1, limit: 10, sort: 'name' };
    console.log('  Params:', params);
    console.log('  Query string:', ConvertUtils.objToGetURL(params));
    
    console.log('\n2. Map to/from JSON:');
    const map = new Map([
      ['name', 'John'],
      ['age', '30'],
      ['city', 'Seoul']
    ]);
    console.log('  Original Map:', map);
    const jsonStr = ConvertUtils.mapToJson(map);
    console.log('  To JSON:', jsonStr);
    const restored = ConvertUtils.jsonToMap(jsonStr);
    console.log('  From JSON:', restored);
    
    console.log('\n3. Object to Map:');
    const obj = { username: 'john', email: 'john@example.com', role: 'admin' };
    console.log('  Object:', obj);
    const strMap = ConvertUtils.objToStrMap(obj);
    console.log('  Converted Map:', strMap);
    
    console.log('\n4. Decode URI:');
    const encoded = '%ED%95%9C%EA%B5%AD%EC%96%B4';
    console.log('  Encoded:', encoded);
    console.log('  Decoded:', ConvertUtils.decodeURIString(encoded));
    
    console.log('\n5. String to Object:');
    const jsonString = '{"name": "Test", "value": 123}';
    console.log('  JSON string:', jsonString);
    console.log('  Parsed object:', ConvertUtils.strToObject(jsonString));
    
    console.log('\n=========================\n');
  }
}
