import { Client, Intents } from 'discord.js';
import * as process from 'process';
import * as console from 'console';
import { Service } from '../../utils/init/worker';
import { createLogger } from '../../utils/logger';

export class FlixDiscord implements Service {
  private static readonly logger = createLogger('FlixDiscord');
  private client: Client<true>;

  constructor() {
    this.client = new Client({
      intents: [Intents.FLAGS.GUILDS],
    });

    this.client.on('ready', () => {
      FlixDiscord.logger.info(`Successfully logged in as ${this.client.user.tag}!`);
    });

    this.client.login(process.env.DISCORD_TOKEN).catch(console.error);
  }

  onMessage(message: any) {
    console.log(message);
  }
}
