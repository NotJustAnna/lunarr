import { createLogger } from '@/app/logger';
import { performance } from 'perf_hooks';

export function TimeTracker(name: string) {
  const logger = createLogger('TimeTracker');
  return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => any>) => {
    const oldValue = descriptor.value!;
    descriptor.value = function (this: any, ...args: any[]) {
      const start = performance.now();
      let errored = false;
      try {
        return oldValue.apply(this, args);
      } catch (e) {
        errored = true;
        throw e;
      } finally {
        const end = performance.now();
        logger.debug(`${name} took ${end - start}ms${errored ? ' (errored)' : ''}`);
      }
    };
  };
}

export function AsyncTimeTracker(name: string) {
  const logger = createLogger('AsyncTimeTracker');
  return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => {
    const oldValue = descriptor.value!;
    descriptor.value = async function (this: any, ...args: any[]) {
      const start = performance.now();
      let errored = false;
      try {
        return await oldValue.apply(this, args);
      } catch (e) {
        errored = true;
        throw e;
      } finally {
        const end = performance.now();
        logger.debug(`${name} took ${end - start}ms${errored ? ' (errored)' : ''}`);
      }
    };
  };
}
