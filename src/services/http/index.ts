import express from 'express';
import { Express, Request, Response } from 'express-serve-static-core';
import { createLogger } from '../../utils/logger';
import { Service } from '../../utils/init/worker';
import * as process from 'process';

export class FlixHttp implements Service {
  private static readonly logger = createLogger('FlixHttp');

  constructor() {
    const app: Express = express();
    const port = Number(process.env.HTTP_PORT);
    app.use(express.static('public'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.text({
      type: ['application/xml', 'text/plain', 'text/html'],
    }));
    app.get('/*', (req, res) => {
      res.sendFile(`${process.cwd()}/public/index.html`);
    });
    app.get('/api/flatAssoc/info', this.handleFlatAssocInfo.bind(this));
    app.post('/api/flatAssoc/login', this.handleFlatAssocLogin.bind(this));
    app.post('/api/webhooks/jellyfin', this.handleJellyfin.bind(this));
    app.listen(port);
    FlixHttp.logger.info(`HTTP Application started! Listening on port ${port}`);
  }

  handleFlatAssocInfo(req: Request, res: Response) {
    throw new Error('Method not implemented.');
  }

  handleFlatAssocLogin(req: Request, res: Response) {
    throw new Error('Method not implemented.');
  }

  handleJellyfin(req: Request, res: Response) {
    throw new Error('Method not implemented.');
  }
}
