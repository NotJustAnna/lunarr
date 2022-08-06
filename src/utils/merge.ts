export function merge<T extends object>(objects: T[], exclude: (keyof T)[] = []): T {
  return objects.reduce((prev, curr) => {
    for (let keys of (Object.keys(curr) as (keyof T)[]).filter(key => !exclude.includes(key))) {
      const val = curr[keys];
      if (val !== undefined && val !== null) {
        prev[keys] = val;
      }
    }
    return prev;
  });
}
