export class BatchingUtil<T> {
  private bucket: T[] = [];
  private steal?: () => void;

  constructor(
    public maxTimeBatching: number,
    public maxBatchSize: number,
  ) {
    if (maxTimeBatching < 0) {
      throw new Error('maxTimeBatching must be a non-negative number.');
    }
    if (maxBatchSize < 0) {
      throw new Error('maxBatchSize must be a non-negative number.');
    }
    if (maxTimeBatching === 0 && maxBatchSize === 0) {
      throw new Error('Either maxTimeBatching or maxBatchSize must be non-zero.');
    }
  }

  /**
   * This method lets you aggregate a influx of events into a batch.
   * @param item
   */
  async aggregate(item: T): Promise<T[] | undefined> {
    this.bucket.push(item);
    if (this.bucket.length >= this.maxBatchSize) {
      const batch = this.bucket;
      this.bucket = [];
      return batch;
    }
    if (this.steal) {
      // steal timer
      this.steal();
      let alreadyStolen = false;
      this.steal = () => {
        alreadyStolen = true;
      };
      return new Promise(resolve => {
        if (alreadyStolen) {
          resolve(undefined);
        }
        const timer = setTimeout(() => {
          const batch = this.bucket;
          this.bucket = [];
          resolve(batch);
        });
        this.steal = () => {
          resolve(undefined);
          clearTimeout(timer);
        };
      });
    }
  }
}
