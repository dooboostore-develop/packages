export abstract class Advice<T = any, R = any, C = any> {
  abstract exception(e: T, context?: C): Promise<R>;
  abstract isSupport(e: T, context?: C): Promise<boolean>;
}
