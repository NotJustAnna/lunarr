import { hasInit } from '@/app/init/interfaces';
import { container } from 'tsyringe';
import { constructor } from 'tsyringe/dist/typings/types';

type BarrelFileImport = { [key: string]: constructor<any> };

export interface BatchInitializeResult {
  instances: any[];
  errors: { error: any; initializer: any }[];
}

export function fromBarrelFile(barrel: BarrelFileImport): constructor<any>[] {
  return Object.values(barrel);
}

export async function batchInitialize(initializers: constructor<any>[] | BarrelFileImport) {
  const result: BatchInitializeResult = { instances: [], errors: [] };
  const promises: Promise<any>[] = [];

  for (const initializer of (Array.isArray(initializers) ? initializers : Object.values(initializers))) {
    try {
      const instance = container.resolve(initializer);
      if (hasInit(instance)) {
        const maybePromise = instance.init();

        if (maybePromise instanceof Promise) {
          promises.push(
            maybePromise
              .then(() => result.instances.push(instance))
              .catch((error) => result.errors.push({ error, initializer: instance })),
          );
          continue;
        }
      }
      result.instances.push(instance);
    } catch (e) {
      result.errors.push({ error: e, initializer });
    }
  }

  if (promises.length > 0) {
    await Promise.allSettled(promises);
  }
  return result;
}
