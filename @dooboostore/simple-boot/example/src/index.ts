import 'reflect-metadata'
import * as prompts from '@clack/prompts';
import { Runnable } from '@dooboostore/core/runs/Runnable';

// Import all examples
import { AlertExample } from './alert/AlertExample';
import { CacheExample } from './cache/CacheExample';
import { DecoratorsExample } from './decorators/DecoratorsExample';
import { IntentExample } from './intent/IntentExample';
import { RouteExample } from './route/RouteExample';
import { SimstanceExample } from './simstance/SimstanceExample';
import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';

// Example registry
const examples: Record<string, { title: string; class: new () => Runnable }> = {
  simstance: { title: 'Dependency Injection (Simstance) - Manage object lifecycles with @Sim', class: SimstanceExample },
  decorators: { title: 'Aspect-Oriented Programming - Add behavior with @Before, @After, @Around', class: DecoratorsExample },
  route: { title: 'Router System - Map URLs to controller methods with @Router', class: RouteExample },
  cache: { title: 'Method Caching - Cache expensive operations with @Cache decorator', class: CacheExample },
  intent: { title: 'Intent Events - Decouple components with pub-sub pattern', class: IntentExample },
  alert: { title: 'Alert System - Manage alerts with AlertService and AlertFactory', class: AlertExample },
};

let lastSelectedIndex = 0;

function getChoices() {
  return [
    ...Object.entries(examples).map(([key, { title }]) => ({
      value: key,
      label: title,
    })),
    { value: 'exit', label: '🙇‍♂️ Exit' }
  ];
}

async function main() {
  console.clear();
  
  prompts.intro('🚀 DoobooStore Simple-Boot Examples');
  console.log('11', require.resolve("reflect-metadata"));
  const choices = getChoices();
  
  const selected = await prompts.select({
    message: 'Select an example to run:',
    options: choices,
    initialValue: choices[lastSelectedIndex]?.value,
  });
  
  if (prompts.isCancel(selected)) {
    prompts.cancel('Operation cancelled.');
    process.exit(0);
  }
  
  const exampleKey = selected as string;
  
  // Remember the selected index
  lastSelectedIndex = choices.findIndex(c => c.value === exampleKey);
  
  // Exit option
  if (exampleKey === 'exit') {
    prompts.outro('👋 Goodbye!');
    process.exit(0);
  }
  
  const example = examples[exampleKey];
  
  if (!example) {
    prompts.cancel('Invalid example selected.');
    process.exit(1);
  }
  
  const spinner = prompts.spinner();
  spinner.start('Running example...');
  
  try {
    const instance = new example.class();
    await instance.run();
    spinner.stop('Example completed successfully! ✓');
    
    const continueRunning = await prompts.confirm({
      message: 'Do you want to run another example?',
    });
    
    if (continueRunning) {
      await main();
    } else {
      prompts.outro('👋 Goodbye!');
    }
  } catch (error) {
    spinner.stop('Example failed! ✗');
    prompts.log.error(`Error: ${error}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
