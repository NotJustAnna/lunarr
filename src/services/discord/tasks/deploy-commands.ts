import 'source-map-support/register';
import { createLogger } from '@/common/logger';
import { PostOffice } from '@/common/messaging/postOffice';
import { ParentPortTransport } from '@/common/messaging/transport/parentPort';
import process from 'process';
import { ExitCode } from '@/common/utils/exitCode';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { SlashCommandBuilder } from '@discordjs/builders';

const logger = createLogger('Task "Deploy Commands"');
const postOffice = new PostOffice(new ParentPortTransport(true));

const token = process.env.DISCORD_TOKEN!;
const clientId = process.env.DISCORD_CLIENT_ID!;
const guildId = process.env.DISCORD_GUILD_ID!;

// TODO Graduate commands to application-level

async function main() {
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

main().catch((e) => {
  postOffice.sendError(e);
  process.exit(ExitCode.SOFTWARE_ERROR);
});
