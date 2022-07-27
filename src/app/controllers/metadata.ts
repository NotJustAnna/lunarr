import express, { Express, Router } from 'express';

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
}

const controllerMetadata = Symbol('controllerMetadata');

export function getControllerMetadata(constructor: any): ControllerMetadata | null {
  if (constructor) {
    return constructor[controllerMetadata] as ControllerMetadata ?? null;
  }
  return null;
}

export function getOrCreateControllerMetadata(constructor: any): ControllerMetadata {
  if (constructor) {
    let metadata = constructor[controllerMetadata] as ControllerMetadata;
    if (!metadata) {
      metadata = new ControllerMetadata();
      constructor[controllerMetadata] = metadata;
    }
    return metadata;
  }
  throw new Error('constructor is null');
}
