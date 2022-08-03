export async function withProgress<T>(
  array: Promise<T>[],
  minTimeElapsed: number,
  onProgress: (done: number, total: number, shouldReport: boolean) => void,
): Promise<T[]> {
  const total = array.length;
  let done = 0;
  let shouldReport = minTimeElapsed !== 0;

  return Promise.all(array.map(it => it.then((v) => {
    done++;
    onProgress(done, total, shouldReport || done === total);
    if (minTimeElapsed !== 0 && shouldReport && done !== total) {
      shouldReport = false;
      setTimeout(() => shouldReport = true, minTimeElapsed);
    }
    return v;
  })));
}
