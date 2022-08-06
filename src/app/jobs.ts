import { Duration, toMilliseconds } from '@/utils/duration';
import { createLogger } from '@/app/logger';

export interface JobOptions {
  id: string;
  name: string;
  interval: Duration;
  runImmediately?: boolean;
}

export enum JobStatus {
  SCHEDULED = 'SCHEDULED',
  RUNNING = 'RUNNING',
  NOT_SCHEDULED = 'NOT_SCHEDULED',
}

export abstract class AbstractJob {
  private static readonly log = createLogger('AbstractJob');

  id: string;
  name: string;
  interval: Duration;
  nextExecution?: Date;
  executing = false;
  private timeout?: NodeJS.Timeout;

  protected constructor(options: JobOptions) {
    this.id = options.id;
    this.name = options.name;
    this.interval = options.interval;
    if (options.runImmediately) {
      // this needs to be called after the constructor
      setImmediate(() => this.executeNow());
    } else {
      this.reschedule();
    }
  }

  get status() {
    if (this.executing) {
      return JobStatus.RUNNING;
    }
    if (this.timeout) {
      return JobStatus.SCHEDULED;
    }
    return JobStatus.NOT_SCHEDULED;
  }

  executeNow() {
    if (this.executing) {
      return;
    }
    this.stop();
    try {
      this.executing = true;
      const result = this.run();
      if (result instanceof Promise) {
        result
          .catch((error) => AbstractJob.log.error(`Job \"${this.name}\" failed with an error`, { error }))
          .then(() => {
            this.executing = false;
            this.reschedule();
          });
      } else {
        this.executing = false;
        this.reschedule();
      }
    } catch (error) {
      AbstractJob.log.error(`Job \"${this.name}\" failed with an error`, { error });
      this.executing = false;
      this.reschedule();
    }
  }

  stop() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      delete this.timeout;
    }
    delete this.nextExecution;
  }

  reschedule() {
    if (this.executing) {
      return;
    }
    this.stop();
    this.timeout = setTimeout(() => this.executeNow(), toMilliseconds(this.interval));
    const date = new Date();
    date.setTime(date.getTime() + toMilliseconds(this.interval));
    this.nextExecution = date;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      duration: this.interval,
      nextExecution: this.nextExecution,
      status: this.status,
    };
  }

  protected abstract run(): void | Promise<void>;
}
