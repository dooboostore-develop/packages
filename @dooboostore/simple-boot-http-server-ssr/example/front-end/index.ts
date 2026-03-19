import 'reflect-metadata'
import Factory, { MakeSimFrontOption } from '@lazycollect-src/bootfactory';
import { services } from 'service';

const using = [...services]
Factory.create(MakeSimFrontOption(window), using).then(it => {
  it.run();
});