import { Client, Intents } from 'discord.js';
import * as process from 'process';
import * as console from 'console';
import { Service } from '../../utils/init/worker';
import { createLogger } from '../../utils/logger';
import { MessageTransport } from '../../messaging/transport';
import { DiscordPostOffice } from './postOffice';
import { ExitCode } from '../../utils/init/exitCode';

export class FlixDiscord implements Service {
  private static readonly logger = createLogger('FlixDiscord');
  private client: Client<true>;
  private postOffice: DiscordPostOffice;

  constructor(transport: MessageTransport) {
    this.postOffice = new DiscordPostOffice(transport);

    const discordToken = process.env.DISCORD_TOKEN;
    if (!discordToken) {
      FlixDiscord.logger.error('DISCORD_TOKEN environment variable is not set');
      process.exit(ExitCode.CONFIGURATION_ERROR);
      throw new Error('Assertion Error');
    }

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
          if (subcommand === 'auth') {
            const link = await this.postOffice.initFlatAssocFlow(interaction.user.id);

            await interaction.reply({
              content: `Please visit ${link} to associate your account with a OMBI account.`,
              ephemeral: true,
            });

            return;
          }

          await interaction.reply({
            content: `Hello ${subcommand}!`,
            ephemeral: true,
          });

        }
        return;
      }
    });

    this.client.login(discordToken).catch(console.error);
  }
}
