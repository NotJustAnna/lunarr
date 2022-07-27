import { Service } from 'typedi';
import { Controller, Post } from '@/app/controllers';
import { Request, Response } from 'express';

@Service()
@Controller('/api/webhooks')
export class WebhooksController {
  @Post('/jellyfin')
  async jellyfin(req: Request, res: Response) {

  }
}
