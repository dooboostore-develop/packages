// import { Element } from '../elements/Element';
import { HTMLCollectionImp } from './HTMLCollectionImp';

/**
 * **`HTMLCollectionOf<T>`** is a generic version of HTMLCollection that provides type safety for specific element types.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLCollection)
 */
export class HTMLCollectionOfImp<T extends Element> extends HTMLCollectionImp implements HTMLCollectionOfImp<T>{


}