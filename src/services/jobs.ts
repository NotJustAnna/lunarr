import { AbstractJob } from '@/app/jobs';
import { singleton } from 'tsyringe';

@singleton()
export class JobService {
  private readonly jobs = new Map<string, AbstractJob>;

  constructor() {}

  public add(...jobs: AbstractJob[]): void {
    for (const job of jobs) {
      this.jobs.set(job.id, job);
    }
  }

  public get(id: string): AbstractJob | undefined {
    return this.jobs.get(id);
  }

  public all(): AbstractJob[] {
    return [...this.jobs.values()];
  }

  public remove(...jobs: AbstractJob[]): void {
    for (const job of jobs) {
      this.jobs.delete(job.id);
    }
  }

  public clear(): void {
    this.jobs.clear();
  }

  public has(job: AbstractJob): boolean {
    return this.jobs.has(job.id);
  }
}
