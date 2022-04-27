export interface ServiceConfig {
  name: string;
  file?: string;
  workerData?: any;
}

export type ServiceStart = string | ServiceConfig

export function isServiceConfig(arg: any): arg is ServiceConfig {
  return typeof arg === 'object'
    && typeof arg.name === 'string'
    && (arg.file === undefined || typeof arg.file === 'string')
    && (arg.dir === undefined || typeof arg.dir === 'string')
}

export function isServiceStart(arg: any): arg is ServiceStart {
  return typeof arg === 'string' || isServiceConfig(arg);
}
