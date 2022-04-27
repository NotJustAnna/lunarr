export async function attempt<T>(tries: number, func: () => T | Promise<T>) {
  for (let i = 0; i < tries; i++) {
    try {
      return await func();
    } catch (e) {
      if (i === tries - 1) {
        throw e;
      }
    }
  }
  throw new Error('Assertion error');
}
