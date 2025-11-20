import { Intent } from './Intent';

export interface IntentSubscribe {
    intentSubscribe(...args: any[]): void;
    intentSubscribe(intent: Intent): void;
}
export const isIntentSubscribe = (obj: unknown): obj is IntentSubscribe => {
  return !!obj && typeof (obj as any).intentSubscribe === 'function';
};