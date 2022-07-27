export async function withProgress<T>(
  array: Promise<T>[],
  minTimeElapsed: number,
  onProgress: (done: number, total: number) => void,
): Promise<T[]> {
  const total = array.length;
  let done = 0;
  let shouldReport = minTimeElapsed !== 0;

  return Promise.all(array.map(it => it.then((v) => {
    if (shouldReport) {
      onProgress(++done, total);
      if (minTimeElapsed !== 0) {
        shouldReport = false;
        setTimeout(() => shouldReport = true, minTimeElapsed);
      }
    }
    return v;
  })));
}
