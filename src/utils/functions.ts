import { Awaitable } from '@/utils/types';

export function bubbleWrap<T extends any[]>(
  block: (...args: T) => Awaitable,
  onError?: (error: any) => void,
): (...args: T) => void {
  return (...args: T) => {
    try {
      const result = block(...args);
      if (result instanceof Promise) {
        result.catch(onError || (() => {}));
      }
    } catch (e) {
      if (onError) {
        onError(e);
      }
    }
  };
}
