import 'reflect-metadata'
import * as prompts from '@clack/prompts';
import { Runnable } from '@dooboostore/core/runs/Runnable';

// Import all examples
import { AdviceExample } from './advice/AdviceExample';
import { ArrayExample } from './array/ArrayExample';
import { CodeExample } from './code/CodeExample';
import { ConvertExample } from './convert/ConvertExample';
import { DateExample } from './date/DateExample';
import { EntityExample } from './entity/EntityExample';
import { ExpressionExample } from './expression/ExpressionExample';
import { FetchExample } from './fetch/FetchExample';
import { FunctionExample } from './function/FunctionExample';
import { ImageExample } from './image/ImageExample';
import { IteratorExample } from './iterators/IteratorExample';
import { LoggerExample } from './logger/LoggerExample';
import { MathExample } from './math/MathExample';
import { MessageExample } from './message/MessageExample';
import { ObjectExample } from './object/ObjectExample';
import { OptionalExample } from './optional/OptionalExample';
import { PromiseExample } from './promise/PromiseExample';
import { QueueExample } from './queues/QueueExample';
import { RandomExample } from './random/RandomExample';
import { ReflectExample } from './reflect/ReflectExample';
import { ScheduleExample } from './schedule/ScheduleExample';
import { StorageExample } from './storage/StorageExample';
import { StringExample } from './string/StringExample';
import { TransactionExample } from './transaction/TransactionExample';
import { UrlExample } from './url/UrlExample';
import { ValidExample } from './valid/ValidExample';

// Example registry
const examples: Record<string, { title: string; class: new () => Runnable }> = {
  advice: { title: 'Advice Pattern - Exception handling pattern', class: AdviceExample },
  array: { title: 'Array Utils - Array manipulation utilities', class: ArrayExample },
  code: { title: 'Code - Type-safe code/status pattern', class: CodeExample },
  convert: { title: 'Convert Utils - Data conversion utilities', class: ConvertExample },
  date: { title: 'Date Utils - Date formatting and operations', class: DateExample },
  entity: { title: 'Entity - Point2D, Point3D, Rect, Vector', class: EntityExample },
  expression: { title: 'Expression - Expression evaluation', class: ExpressionExample },
  fetch: { title: 'Fetch - HTTP fetcher utilities', class: FetchExample },
  function: { title: 'Function Utils - Function utilities', class: FunctionExample },
  image: { title: 'Image Utils - Image manipulation utilities', class: ImageExample },
  iterators: { title: 'Iterators - Range and iterator utilities', class: IteratorExample },
  logger: { title: 'Logger - Logging utilities', class: LoggerExample },
  math: { title: 'Math Utils - Mathematical utilities', class: MathExample },
  message: { title: 'Message/Observable - Reactive programming with Subject', class: MessageExample },
  object: { title: 'Object Utils - Object manipulation utilities', class: ObjectExample },
  optional: { title: 'Optional - Null-safe value handling', class: OptionalExample },
  promise: { title: 'Promise Utils - Promise utilities and helpers', class: PromiseExample },
  queues: { title: 'Queues - AsyncBlockingQueue', class: QueueExample },
  random: { title: 'Random Utils - Random generation utilities', class: RandomExample },
  reflect: { title: 'Reflect Utils - Reflection utilities', class: ReflectExample },
  schedule: { title: 'Schedule - Task scheduling utilities', class: ScheduleExample },
  storage: { title: 'Storage - MemoryStorage and storage utilities', class: StorageExample },
  string: { title: 'String Utils - String manipulation utilities', class: StringExample },
  transaction: { title: 'Transaction - Transaction management', class: TransactionExample },
  url: { title: 'URL Utils - URL manipulation utilities', class: UrlExample },
  valid: { title: 'Valid Utils - Validation utilities', class: ValidExample },
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
  
  prompts.intro('🚀 DoobooStore Core Examples');
  
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