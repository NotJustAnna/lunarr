import { Constructable, Container } from 'typedi';
import { hasInit } from '@/app/init/interfaces';

type BarrelFileImport = { [key: string]: Constructable<any> };

export interface BatchInitializeResult {
  instances: any[];
  errors: { error: any; initializer: any }[];
}

export function fromBarrelFile(barrel: BarrelFileImport): Constructable<any>[] {
  return Object.values(barrel);
}

export async function batchInitialize(initializers: Constructable<any>[] | BarrelFileImport) {
  const result: BatchInitializeResult = { instances: [], errors: [] };
  const promises: Promise<any>[] = [];

  for (const initializer of (Array.isArray(initializers) ? initializers : Object.values(initializers))) {
    try {
      const instance = Container.get(initializer);
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
