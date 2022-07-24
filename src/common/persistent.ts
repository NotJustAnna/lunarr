import type { ClassConstructor } from 'class-transformer';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import * as fs from 'fs-extra';
import { validate } from 'class-validator';

export class Persistent<T extends object> {
  private ref: T | undefined;

  constructor(
    private type: ClassConstructor<T>,
    private path: string,
    private defaultValue?: () => T,
  ) {
  }

  get value(): T {
    if (!this.ref) {
      throw new Error('Persistent object not loaded');
    }
    return this.ref;
  }

  async load(): Promise<T> {
    const data = await fs.readJson(this.path).catch(() => {
      if (this.defaultValue) {
        return this.defaultValue();
      }
      throw new Error('Persistent Object not found');
    });
    const instance = plainToInstance(this.type, data);
    const errors = await validate(instance);
    if (errors && errors.length) {
      throw new AggregateError(errors, 'Errors when validating persistent object contents.');
    }
    this.ref = instance;
    return instance;
  }

  async save(): Promise<void> {
    if (!this.ref) {
      throw new Error('persistent object not loaded');
    }
    await fs.writeJson(this.path, instanceToPlain(this.ref));
  }
}
