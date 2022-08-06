import { createLogger } from '@/app/logger';

export function ErrorToll(name: string) {
  const logger = createLogger('ErrorToll');
  return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) => {
    const oldValue = descriptor.value!;
    descriptor.value = async function (this: any, ...args: any[]) {
      try {
        return await oldValue.apply(this, args);
      } catch (error) {
        logger.error(`${name} errored`, { error, args });
        throw error;
      }
    };
  };
}
