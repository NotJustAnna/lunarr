export class BatchingUtil<T> {
  private bucket: T[] = [];
  private steal?: () => void;

  constructor(
    public maxTimeWaiting: number,
    public maxBatchSize: number,
  ) {
    if (maxTimeWaiting < 0) {
      throw new Error('maxTimeWaiting must be a non-negative number.');
    }
    if (maxBatchSize < 0) {
      throw new Error('maxBatchSize must be a non-negative number.');
    }
    if (maxTimeWaiting === 0 && maxBatchSize === 0) {
      throw new Error('Either maxTimeWaiting or maxBatchSize must be non-zero.');
    }
  }

  /**
   * This method lets you aggregate a influx of events into a batch.
   * @param item
   */
  async aggregate(item: T): Promise<T[] | undefined> {
    this.bucket.push(item);
    if (this.maxBatchSize !== 0 && this.bucket.length >= this.maxBatchSize) {
      const batch = this.bucket;
      this.bucket = [];
      return batch;
    }
    if (this.maxTimeWaiting !== 0) {
      if (this.steal) {
        // steal timer
        this.steal();
        delete this.steal;
      }
      let alreadyStolen = false;
      this.steal = () => {
        alreadyStolen = true;
      };
      return new Promise(resolve => {
        if (alreadyStolen) {
          resolve(undefined);
        }
        const timer = setTimeout(() => {
          delete this.steal;
          const batch = this.bucket;
          this.bucket = [];
          resolve(batch);
        }, this.maxTimeWaiting);
        this.steal = () => {
          resolve(undefined);
          clearTimeout(timer);
        };
      });
    }
  }

  /**
   * This method lets you steal the current batch of events being aggregated.
   */
  stealImmediately(): T[] {
    if (this.steal) {
      this.steal();
      delete this.steal;
    }
    const batch = this.bucket;
    this.bucket = [];
    return batch;
  }
}
