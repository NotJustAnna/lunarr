import { NextFunction, Request, Response } from 'express-serve-static-core';
import { getOrCreateControllerMetadata } from '@/app/controllers/metadata';

type RouterHandler = (req: Request, res: Response) => (any | Promise<any>);

type MiddlewareRouterHandler = (
  req: Request,
  res: Response,
  next?: NextFunction,
) => (any | Promise<any>);

export function Controller(basePath?: string): ClassDecorator {
  return (target: any) => {
    getOrCreateControllerMetadata(target).basePath = basePath ?? '/';
  };
}

export function Get(path?: string) {
  return (target: any, _: string | symbol, d: TypedPropertyDescriptor<RouterHandler | MiddlewareRouterHandler>) => {
    getOrCreateControllerMetadata(target.constructor).routerSetup.push((instance, router) => {
      router.get(path ?? '/', d.value!.bind(instance));
    });
    return d;
  };
}

export function Post(path?: string) {
  return (target: any, _: string | symbol, d: TypedPropertyDescriptor<RouterHandler | MiddlewareRouterHandler>) => {
    getOrCreateControllerMetadata(target.constructor).routerSetup.push((instance, router) => {
      router.post(path ?? '/', d.value!.bind(instance));
    });
    return d;
  };
}

export function Put(path?: string) {
  return (target: any, _: string | symbol, d: TypedPropertyDescriptor<RouterHandler | MiddlewareRouterHandler>) => {
    getOrCreateControllerMetadata(target.constructor).routerSetup.push((instance, router) => {
      router.put(path ?? '/', d.value!.bind(instance));
    });
    return d;
  };
}

export function Delete(path?: string) {
  return (target: any, _: string | symbol, d: TypedPropertyDescriptor<RouterHandler | MiddlewareRouterHandler>) => {
    getOrCreateControllerMetadata(target.constructor).routerSetup.push((instance, router) => {
      router.delete(path ?? '/', d.value!.bind(instance));
    });
    return d;
  };
}
