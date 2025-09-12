import Factory, { MakeSimFrontOption } from '@src/bootfactory';
import { services } from 'service';

const using = [...services]
Factory.create(MakeSimFrontOption(window), using).then(it => {
  it.run();
});