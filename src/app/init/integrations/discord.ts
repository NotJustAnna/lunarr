import { Service } from 'typedi';
import { createLogger } from '@/app/logger';
import * as process from 'process';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ExitCode } from '@/utils/exitCode';
import * as console from 'console';
import { Client } from 'discord.js';
import { AuthService } from '@/services/auth';

@Service()
export class DiscordIntegration {

  private static readonly logger = createLogger('DiscordIntegration');
  private client: Client<true>;

  constructor(private readonly authenticationService: AuthService) {

    const discordToken = process.env.DISCORD_TOKEN;
    if (!discordToken) {
      DiscordIntegration.logger.error('DISCORD_TOKEN environment variable is not set');
      process.exit(ExitCode.CONFIGURATION_ERROR);
      throw new Error('Assertion Error');
    }

    this.client = new Client({
      intents: ['Guilds'],
    });

    this.client.on('ready', () => {
      DiscordIntegration.logger.info(`Successfully logged in as ${this.client.user.tag}!`);
    });

    // this.client.on('interactionCreate', async (interaction) => {
    //   if (interaction.isCommand()) {
    //     if (interaction.commandName === 'flix') {
    //       DiscordIntegration.logger.info(`Received command`, { interaction });
    //
    //       interaction.options.get('subcommand')?.run(interaction);
    //
    //       const subcommand = interaction.options.getSubCommand();
    //       if (subcommand === 'auth') {
    //         const link = this.authenticationService.initFlatAssocFlow(interaction.user.id);
    //
    //         await interaction.reply({
    //           content: `Please visit ${link} to associate your account with a OMBI account.`,
    //           ephemeral: true,
    //         });
    //
    //         return;
    //       }
    //
    //       await interaction.reply({
    //         content: `Hello ${subcommand}!`,
    //         ephemeral: true,
    //       });
    //
    //     }
    //     return;
    //   }
    // });

    this.client.login(discordToken).catch(console.error);
  }

  private async deployCommands() {

    const logger = createLogger('Task "Deploy Commands"');

    const token = process.env.DISCORD_TOKEN!;
    const clientId = process.env.DISCORD_CLIENT_ID!;
    const guildId = process.env.DISCORD_GUILD_ID!;

    // TODO Graduate commands to application-level

    const command = new SlashCommandBuilder()
      .setName('flix') // TODO Custom Command Name?
      .setDescription('Main command to interact with Flix.')

      .addSubcommand(sub =>
        sub.setName('auth')
          .setDescription('Authenticate with Flix. You\'ll be sent to a web page to finish authentication.'),
      );

    const rest = new REST({ version: '9' }).setToken(token);

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [command.toJSON()] });
  }
}
