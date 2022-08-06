export class ProgressUtil {
  public done = 0;
  private shouldReport = this.minTimeElapsed !== 0;

  constructor(
    public readonly total: number,
    public readonly minTimeElapsed: number,
    private readonly onProgress: (done: number, total: number) => void,
  ) {}

  public next() {
    this.done++;
    if (this.shouldReport && this.done !== this.total) {
      this.onProgress(this.done, this.total);
      if (this.minTimeElapsed !== 0) {
        this.shouldReport = false;
        setTimeout(() => this.shouldReport = true, this.minTimeElapsed);
      }
    }
  }
}
