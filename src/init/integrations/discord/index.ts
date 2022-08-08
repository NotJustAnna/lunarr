import { createLogger } from '@/app/logger';
import * as process from 'process';
import { REST } from '@discordjs/rest';
import { GatewayIntentBits, Routes } from 'discord-api-types/v9';
import { Client, Interaction, SlashCommandBuilder } from 'discord.js';
import { DiscordConfig } from '@/app/config/discord';
import { singleton } from 'tsyringe';

@singleton()
export class DiscordIntegration {
  private static readonly logger = createLogger('DiscordIntegration');

  readonly client: Client;
  readonly readyClient: Promise<Client<true>>;

  constructor(private readonly discordConfig: DiscordConfig) {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds],
    });
    this.readyClient = new Promise((resolve, reject) => {
      this.client.once('ready', resolve);
      this.client.login(discordConfig.token).catch(reject);
    });

    this.client.once('ready', this.onReady.bind(this));
    this.client.on('interactionCreate', this.onInteraction.bind(this));

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

  }

  private async onReady(client: Client<true>) {
    DiscordIntegration.logger.info(`Successfully logged in as ${client.user.tag}!`);
  }

  private async onInteraction(interaction: Interaction) {
    if (!interaction.isChatInputCommand() || interaction.commandName != 'lunarr') return;

    interaction.options.getSubcommand(true);
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
