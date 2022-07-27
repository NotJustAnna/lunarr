import { Service } from 'typedi';
import { Controller, Get } from '@/app/controllers';
import { Request, Response } from 'express';
import { ShowsRepository } from '@/repositories/shows';

@Service()
@Controller('/api/shows')
export class ShowsController {
  constructor(private readonly shows: ShowsRepository) {
  }

  @Get('/')
  async all(req: Request, res: Response) {
    const shows = await this.shows.all();
    res.json(shows);
  }
}
