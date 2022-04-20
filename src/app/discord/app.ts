
import { Client, Intents } from 'discord.js';
import * as process from 'process';
import * as console from 'console';

export class DiscordApp {
  private client: Client;

  constructor() {
    this.client = new Client({
      intents: [Intents.FLAGS.GUILDS]
    });

    this.client.login(process.env.DISCORD_TOKEN).catch(console.error);
  }

  receiveMessage(message: any) {
    console.log(message);
  }
}
