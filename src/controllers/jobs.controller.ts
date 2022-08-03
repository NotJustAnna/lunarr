import { Controller, Get } from '@/app/controllers';
import { JobService } from '@/services/jobs';
import { Request, Response } from 'express';

@Controller({ path: '/api/jobs' })
export class JobsController {
  constructor(private readonly jobs: JobService) {
  }

  @Get('/')
  all(req: Request, res: Response) {
    const jobs = this.jobs.all();
    res.json(jobs.map((job) => job.toJSON()));
  }

  @Get('/:id')
  byId(req: Request, res: Response) {
    const job = this.jobs.get(req.params.id);
    if (job) {
      res.json(job.toJSON());
    } else {
      res.status(404).json({ error: 'Job not found' });
    }
  }

  @Get('/:id/execute')
  execute(req: Request, res: Response) {
    const job = this.jobs.get(req.params.id);
    if (job) {
      if (job.executing) {
        res.status(400).json({ error: 'Job is already executing' });
        return;
      }
      job.executeNow();
      res.json(job.toJSON());
    } else {
      res.status(404).json({ error: 'Job not found' });
    }
  }
}
