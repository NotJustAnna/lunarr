import { Controller, Post } from '@/app/controllers';
import { Request, Response } from 'express';
import { singleton } from 'tsyringe';

@singleton()
@Controller({ path: '/api/webhooks' })
export class WebhooksController {
  @Post('/jellyfin')
  async jellyfin(req: Request, res: Response) {

  }
}
