import express from 'express';
import { Express, Request, Response } from 'express-serve-static-core';
import { createLogger } from '@/common/logger';
import { Service } from '@/common/init/worker';
import * as process from 'process';
import { ExitCode } from '@/common/utils/exitCode';

export class FlixHttp implements Service {
  private static readonly logger = createLogger('FlixHttp');

  constructor() {
    const app: Express = express();
    if (!process.env.HTTP_PORT) {
      FlixHttp.logger.error('HTTP_PORT environment variable is not set');
      process.exit(ExitCode.CONFIGURATION_ERROR);
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
