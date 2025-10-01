import { Runnable } from '@dooboostore/core/runs/Runnable';
import { Optional } from '@dooboostore/core/optional/Optional';

export class OptionalExample implements Runnable {
  run(): void {
    console.log('\n=== Optional Example ===\n');
    
    // Creating Optional values
    const presentValue = Optional.of('Hello');
    const emptyValue = Optional.empty<string>();
    const nullableValue = Optional.ofNullable(null);
    const nullableValue2 = Optional.ofNullable('World');
    
    console.log('1. Checking presence:');
    console.log('  Present value exists?', presentValue.isPresent());
    console.log('  Empty value exists?', emptyValue.isPresent());
    console.log('  Nullable value (null) exists?', nullableValue.isPresent());
    console.log('  Nullable value (not null) exists?', nullableValue2.isPresent());
    
    // Using orElse
    console.log('\n2. Using orElse for default values:');
    console.log('  Present value or default:', presentValue.orElse('Default'));
    console.log('  Empty value or default:', emptyValue.orElse('Default'));
    console.log('  Nullable (null) or default:', nullableValue.orElse('Default'));
    console.log('  Nullable (not null) or default:', nullableValue2.orElse('Default'));
    
    // Practical example
    console.log('\n3. Practical example - Config values:');
    
    const getUserConfig = (key: string): Optional<string> => {
      const configs: Record<string, string | null> = {
        'theme': 'dark',
        'language': 'ko',
        'fontSize': null
      };
      return Optional.ofNullable(configs[key]);
    };
    
    console.log('  Theme:', getUserConfig('theme').orElse('light'));
    console.log('  Language:', getUserConfig('language').orElse('en'));
    console.log('  Font size:', getUserConfig('fontSize').orElse('14px'));
    console.log('  Unknown:', getUserConfig('unknown').orElse('default'));
    
    console.log('\n=========================\n');
  }
}
