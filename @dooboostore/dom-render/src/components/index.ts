
export * from './ComponentBase';
export * from './ComponentRouterBase';
export * from './ComponentSet';
export * from './a';
export * from './appender';
export * from './checkbox';
export * from './choose';
export * from './details';
export * from './forOf';
export * from './if';
export * from './input';
export * from './promise';
export * from './radio';
export * from './router';
export * from './select';
export * from './this';
export * from './timer';

import If from './if/If';
import This from './this/This';
import Appender from './appender/Appender';
import PromiseSwitch from './promise/PromiseSwitch';
import Choose from './choose/Choose';
import CheckBox from './checkbox/CheckBox';
import Radio from './radio/Radio';
import RouterOutlet from './router/RouterOutlet';
import Select from './select/Select';
import Timer from './timer/Timer';
import Details from './details/Details';
import Input from './input/Input';
import Route from './router/Route';
import A from './a/A';
import ForOf from './forOf/ForOf';

export const drComponent = {
  ...If,
  ...This,
  ...Appender,
  ...PromiseSwitch,
  ...Choose,
  ...CheckBox,
  ...Radio,
  ...Select,
  ...Timer,
  ...Details,
  ...Input,
  ...Route,
  ...RouterOutlet,
  ...A,
...ForOf
}