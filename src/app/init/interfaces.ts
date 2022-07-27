export interface AsyncInit {
  init(): void | Promise<void>;
}

export function hasInit(service: any): service is AsyncInit {
  return typeof (service as AsyncInit)?.init === 'function';
}
