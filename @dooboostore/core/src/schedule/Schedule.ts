import { Runnable } from '../runs/Runnable';

export namespace Schedule {
  export const SYMBOL = Symbol('Schedule');
  export type State = 'INITIALIZE' | 'RUNNING' | 'DONE-AND-WAITING' | 'STOPPED' | 'ERROR' | 'SUCCESS';
}

export interface Schedule<T = void, R = void> extends Runnable<Promise<R>, T> {
  spec: string;
  name?: string;
  description?: string;
  history?: { state: Schedule.State; date: Date; input?: T }[];
  state: Schedule.State;
  isReady?: boolean;
  totalCount: number;
  successCount: number;
  errorCount: number;

  run(data: T): Promise<R>;
  execute(data: T): Promise<R>;
}

export abstract class ScheduleBase<T = void, R = void> implements Schedule<T, R> {
  /*
      *    *    *    *    *    *
      ┬    ┬    ┬    ┬    ┬    ┬
      │    │    │    │    │    │
      │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
      │    │    │    │    └───── month (1 - 12)
      │    │    │    └────────── day of month (1 - 31)
      │    │    └─────────────── hour (0 - 23)
      │    └──────────────────── minute (0 - 59)
      └───────────────────────── second (0 - 59, OPTIONAL)
   */
  abstract spec: string;
  abstract name?: string;
  abstract description?: string;
  private _history?: { state: Schedule.State; date: Date; input: T, result?: R }[];
  private _state: Schedule.State = 'INITIALIZE';
  private _totalCount = 0;
  private _successCount = 0;
  private _errorCount = 0;

  get history() {
    return this._history;
  }
  get state(): Schedule.State {
    return this._state;
  }
  get totalCount() {
    return this._totalCount;
  }
  get successCount() {
    return this._successCount;
  }
  get errorCount() {
    return this._errorCount;
  }
  get isReady(): boolean {
    return !(this._state === 'RUNNING')
  }
  private addStart(input?: T, date: Date = new Date()) {
    this._history ??= [];
    this._history.push({ state: 'RUNNING', date, input });
  }
  private addError(input?: T, date: Date = new Date()) {
    this._history ??= [];
    this._history.push({ state: 'ERROR', date, input });
  }
  private addSuccess(input?: T, result:R = undefined, date: Date = new Date()) {
    this._history ??= [];
    this._history.push({ state: 'SUCCESS', date, input, result });
  }


  async run(data: T): Promise<R> {
    this._state = 'RUNNING';
    this.addStart();
    const startDate = new Date();
      let result: R;
    try {
      console.log('Running schedule', this.name, startDate);
      result = await this.execute(data);
      this._successCount++;
      this.addSuccess(data, result);
    } catch (e) {
      this.addError(e);
      this._errorCount++;
      const endDate = new Date();
      console.error('Error schedule', this.name, endDate, endDate.getTime() - startDate.getTime(), e);
    } finally {
      this._totalCount++;
      const endDate = new Date();
      console.log('Done schedule', this.name, endDate, endDate.getTime() - startDate.getTime());
    }
    this._state = 'DONE-AND-WAITING';
    return result!;
  }

  abstract execute(data: T): Promise<R>;
}
