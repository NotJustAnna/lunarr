import express from 'express';
import { Express, Request, Response } from 'express-serve-static-core';
import { createLogger } from '../../common/logger';
import { Subsystem } from '../../common/worker';

export class FlixHttp implements Subsystem {
  private static readonly logger = createLogger('FlixHttp');

  constructor() {
    const app: Express = express();
    const port = Number(process.env.HTTP_PORT);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.text({
      type: ['application/xml', 'text/plain', 'text/html'],
    }));

    app.post('/jellyfin', this.handleJellyfin.bind(this));
    app.listen(port);
    FlixHttp.logger.info(`HTTP Application started! Listening on port ${port}`);
  }

  handleJellyfin(req: Request, res: Response) {
    throw new Error('Method not implemented.');
  }

  onMessage(message: any) {
    console.log(message);
  }
}
