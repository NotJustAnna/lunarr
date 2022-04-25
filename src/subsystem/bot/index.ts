import { Client, Intents } from 'discord.js';
import * as process from 'process';
import * as console from 'console';
import { createLogger } from '../../common/logger';
import { Subsystem } from '../../common/worker';

export class FlixBot implements Subsystem {
  private static readonly logger = createLogger('FlixBot');
  private client: Client<true>;

  constructor() {
    this.client = new Client({
      intents: [Intents.FLAGS.GUILDS],
    });

    this.client.on('ready', () => {
      FlixBot.logger.info(`Successfully logged in as ${this.client.user.tag}!`);
    });

    this.client.login(process.env.DISCORD_TOKEN).catch(console.error);
  }

  onMessage(message: any) {
    console.log(message);
  }
}
