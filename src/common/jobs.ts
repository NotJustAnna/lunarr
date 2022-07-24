export interface Job {
  run(): void | Promise<void>;
}
