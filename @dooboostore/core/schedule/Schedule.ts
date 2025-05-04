import { Runnable } from '../runs/Runnable';

export namespace Schedule {
  export const TOKEN = Symbol('Schedule');
  export type State = 'INITIALIZE' | 'RUNNING' | 'DONE-AND-WAITING' | 'STOPPED' | 'ERROR' | 'SUCCESS';
}
export interface Schedule extends Runnable {
  spec: string;
  name?: string;
  description?: string;
  history?: { state: Schedule.State; date: Date; data: any }[];
  state: Schedule.State;
  totalCount: number;
  successCount: number;
  errorCount: number;
  execute(): Promise<void>;
}

export abstract class ScheduleBase implements Schedule {
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
  public history?: { state: Schedule.State; date: Date; data: any }[];
  public state: Schedule.State = 'INITIALIZE';
  public totalCount = 0;
  public successCount = 0;
  public errorCount = 0;

  private addStart(data?: any, date: Date = new Date()) {
    this.history ??= [];
    this.history.push({ state: 'RUNNING', date, data });
  }
  private addError(data?: any, date: Date = new Date()) {
    this.history ??= [];
    this.history.push({ state: 'ERROR', date, data });
  }
  private addSuccess(data?: any, date: Date = new Date()) {
    this.history ??= [];
    this.history.push({ state: 'SUCCESS', date, data });
  }

  async run() {
    this.state = 'RUNNING';
    this.addStart();
    const startDate = new Date();
    try {
      console.log('Running schedule', this.name, startDate);
      await this.execute();
      this.successCount++;
      this.addSuccess();
    } catch (e) {
      this.addError(e);
      this.errorCount++;
      const endDate = new Date();
      console.log('Error schedule', this.name, endDate, endDate.getTime() - startDate.getTime());
    } finally {
      this.totalCount++;
      const endDate = new Date();
      console.log('Done schedule', this.name, endDate, endDate.getTime() - startDate.getTime());
    }
    this.state = 'DONE-AND-WAITING';
  }

  abstract execute(): Promise<void>;
}
