import * as process from 'process';
import express from 'express';
import { Express, Request, Response } from 'express-serve-static-core';
import { createLogger } from '@/common/logger';
import { Service } from 'typedi';

@Service()
export class HttpController {
  private static readonly logger = createLogger('HttpController');

  constructor() {
    const app: Express = express();
    if (!process.env.HTTP_PORT) {
      HttpController.logger.error('HTTP_PORT environment variable is not set');
      throw new Error('Assertion Error');
    }

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
    HttpController.logger.info(`HTTP Application started! Listening on port ${port}`);
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
