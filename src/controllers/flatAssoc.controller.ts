import { Controller, Get, Post } from '@/app/controllers';
import { Request, Response } from 'express';

@Controller({ path: '/api/flatAssoc' })
export class FlatAssocController {
  @Get('/info')
  async info(req: Request, res: Response) {

  }

  @Post('/auth')
  async start(req: Request, res: Response) {

  }
}
