import { RenderTransactionDrawObj } from './RenderTransactionDrawObj';
import { Runnable } from '../../../runs/Runnable';

export abstract class RenderTransactionRunnableDrawObj<T = any> extends RenderTransactionDrawObj<T> implements  Runnable {

    abstract run(...args: any[]): void;
    abstract stop?(): void;

}
