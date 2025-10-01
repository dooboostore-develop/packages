import 'reflect-metadata'
import * as prompts from '@clack/prompts';
import { Runnable } from '@dooboostore/core/runs/Runnable';

// Import all examples
import { ConvertExample } from './convert/ConvertExample';
import { FetchExample } from './fetch/FetchExample';
import { FileExample } from './file/FileExample';
import { MemoryExample } from './memory/MemoryExample';
import { PathExample } from './path/PathExample';
import { ProcessExample } from './process/ProcessExample';

// Example registry
const examples: Record<string, { title: string; class: new () => Runnable }> = {
  convert: { title: 'Convert - Buffer/String conversions', class: ConvertExample },
  fetch: { title: 'Fetch - HTTP page downloader', class: FetchExample },
  file: { title: 'File - File system operations', class: FileExample },
  memory: { title: 'Memory - Memory usage utilities', class: MemoryExample },
  path: { title: 'Path - Path manipulation utilities', class: PathExample },
  process: { title: 'Process - Process information utilities', class: ProcessExample },
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
  
  prompts.intro('🚀 DoobooStore Core-Node Examples');
  
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
