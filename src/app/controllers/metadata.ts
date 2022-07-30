import express, { Express, Router } from 'express';

const _metadata = Symbol('_metadata');

export class ControllerMetadata {
  routerSetup: ((instance: any, router: Router) => void)[] = [];
  basePath?: string;

  setup(app: Express, instance: any) {
    const router = express.Router();
    this.routerSetup.forEach(setup => setup(instance, router));
    if (this.basePath) {
      app.use(this.basePath, router);
    } else {
      app.use(router);
    }
  }

  static getOrCreate(constructor: any): ControllerMetadata {
    if (constructor) {
      let metadata = constructor[_metadata] as ControllerMetadata;
      if (!metadata) {
        metadata = new ControllerMetadata();
        constructor[_metadata] = metadata;
      }
      return metadata;
    }
    throw new Error('constructor is null');
  }

  static get(constructor: any): ControllerMetadata | null {
    if (constructor) {
      return constructor[_metadata] as ControllerMetadata ?? null;
    }
    return null;
  }
}
