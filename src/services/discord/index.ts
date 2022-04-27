import { Client, Intents } from 'discord.js';
import * as process from 'process';
import * as console from 'console';
import { Service } from '../../utils/init/worker';
import { createLogger } from '../../utils/logger';
import { MessageTransport } from '../../messaging/transport';
import { PostOffice } from '../../messaging/postOffice';

export class FlixDiscord implements Service {
  private static readonly logger = createLogger('FlixDiscord');
  private client: Client<true>;
  private postOffice: PostOffice;

  constructor(transport: MessageTransport) {
    this.postOffice = new PostOffice(transport);

    this.postOffice.startServices([{
      name: 'discord/deploy-commands', file: 'discord/tasks/deploy-commands.js',
    }]);

    this.client = new Client({
      intents: [Intents.FLAGS.GUILDS],
    });

    this.client.on('ready', () => {
      FlixDiscord.logger.info(`Successfully logged in as ${this.client.user.tag}!`);
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (interaction.isCommand()) {
        if (interaction.commandName === 'flix') {
          FlixDiscord.logger.info(`Received command`, { interaction });

          const subcommand = interaction.options.getSubcommand();

          await interaction.reply({
            content: `Hello ${subcommand}!`,
            ephemeral: true,
          });
        }
        return;
      }
    });

    this.client.login(process.env.DISCORD_TOKEN).catch(console.error);
  }
}
