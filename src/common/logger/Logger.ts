export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export abstract class Logger {
  protected constructor(readonly name: string) {}

  abstract log(level: LogLevel, msg: any): void;
  abstract log(level: LogLevel, msg: string, meta: object): void;
  abstract log(level: LogLevel, msg: any, meta?: object): void;

  info(msg: any): void;
  info(msg: string, meta: object): void;
  info(msg: any, meta?: object): void {
    this.log('info', msg, meta);
  }

  warn(msg: any): void;
  warn(msg: string, meta: object): void;
  warn(msg: any, meta?: object): void {
    this.log('warn', msg, meta);
  }

  error(msg: any): void;
  error(msg: string, meta: object): void;
  error(msg: any, meta?: object): void {
    this.log('error', msg, meta);
  }

  debug(msg: any): void;
  debug(msg: string, meta: object): void;
  debug(msg: any, meta?: object): void {
    this.log('debug', msg, meta);
  }
}
