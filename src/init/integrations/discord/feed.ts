import { Service } from 'typedi';
import { DiscordIntegration } from '@/init/integrations/discord/index';
import { ListenerService } from '@/services/events/listener';
import {
  ShowCreatedEvent,
  ShowDeletedEvent,
  ShowEpisodeCreatedEvent,
  ShowEpisodeDeletedEvent,
  ShowEpisodeUpdatedEvent,
  ShowSeasonCreatedEvent,
  ShowSeasonDeletedEvent,
  ShowSeasonUpdatedEvent,
  ShowUpdatedEvent,
} from '@/services/events/interfaces';
import { DiscordConfig } from '@/app/config/discord';
import { createLogger } from '@/app/logger';
import { ChannelType, TextChannel } from 'discord.js';
import { ShowsRepository } from '@/repositories/shows';
import { ShowSeasonsRepository } from '@/repositories/showSeasons';
import { ShowEpisodesRepository } from '@/repositories/showEpisodes';
import { Show } from '@prisma/client';

function titleOf(show: Show) {
  if (show.jellyfinTitle) return show.jellyfinTitle;
  if (show.sonarrTitle) return show.sonarrTitle;
  if (show.ombiTitle) return show.ombiTitle;
  if (show.tvdbId) return `Unnamed Show (TVDB ${show.tvdbId})`;
  if (show.imdbId) return `Unnamed Show (IMDB ${show.imdbId})`;
  return `Unnamed Show (Internal ID: ${show.id})`;
}

@Service()
export class DiscordFeedService {
  private readonly logger = createLogger(DiscordFeedService.name);

  constructor(
    private readonly discordConfig: DiscordConfig,
    private readonly discordIntegration: DiscordIntegration,
    private readonly listenerService: ListenerService,
    private readonly shows: ShowsRepository,
    private readonly showSeasons: ShowSeasonsRepository,
    private readonly showEpisodes: ShowEpisodesRepository,
  ) {
    this.listenerService.registerListeners(this);
  }

  private async feedChannel(): Promise<TextChannel> {
    const client = await this.discordIntegration.readyClient;
    const channel = await client.channels.cache.get(this.discordConfig.feedChannelId!);
    if (!channel) {
      this.logger.error('Could not find feed channel');
      throw new Error('Could not find feed channel');
    }
    if (channel.type !== ChannelType.GuildText) {
      this.logger.error('Channel is not a guild text channel');
      throw new Error('Channel is not a guild text channel');
    }
    return channel;
  }

  @ListenerService.RegisterBuiltin('showCreated')
  private async showCreated({ show }: ShowCreatedEvent) {
    const channel = await this.feedChannel();
    await channel.send(`${titleOf(show)} has been created`);
  }

  @ListenerService.RegisterBuiltin('showUpdated')
  private async showUpdated({ show, oldValues, newValues }: ShowUpdatedEvent) {
    const channel = await this.feedChannel();

    const debug = '```json\n' + JSON.stringify({ oldValues, newValues }, null, 4) + '\n```';
    await channel.send(`${titleOf(show)} has been updated\n${debug}`);
  }

  @ListenerService.RegisterBuiltin('showDeleted')
  private async showDeleted({ show }: ShowDeletedEvent) {
    const channel = await this.feedChannel();
    await channel.send(`${titleOf(show)} has been deleted`);
  }

  @ListenerService.RegisterBuiltin('showSeasonCreated')
  private async showSeasonCreated({ showSeason }: ShowSeasonCreatedEvent) {
    const channel = await this.feedChannel();
    const show = await this.shows.getById(showSeason.showId);
    await channel.send(`${titleOf(show!)} - Season ${showSeason.number} has been updated`);
  }

  @ListenerService.RegisterBuiltin('showSeasonUpdated')
  private async showSeasonUpdated({ showSeason, oldValues, newValues }: ShowSeasonUpdatedEvent) {
    const channel = await this.feedChannel();
    const show = await this.shows.getById(showSeason.showId);
    const debug = '```json\n' + JSON.stringify({ oldValues, newValues }, null, 4) + '\n```';
    await channel.send(`${titleOf(show!)} - Season ${showSeason.number} has been updated\n${debug}`);
  }

  @ListenerService.RegisterBuiltin('showSeasonDeleted')
  private async showSeasonDeleted(data: ShowSeasonDeletedEvent) {
    const channel = await this.feedChannel();
    const show = await this.shows.getById(data.showSeason.showId);
    await channel.send(`${titleOf(show!)} - Season ${data.showSeason.number} has been deleted`);
  }

  @ListenerService.RegisterBuiltin('showEpisodeCreated')
  private async showEpisodeCreated(data: ShowEpisodeCreatedEvent) {
    const channel = await this.feedChannel();
    const showSeason = await this.showSeasons.getById(data.showEpisode.seasonId);
    const show = showSeason?.showId ? await this.shows.getById(showSeason.showId) : null;
    await channel.send(`${titleOf(show!)} - Season ${showSeason?.number} - Episode ${data.showEpisode.number} has been created`);
  }

  @ListenerService.RegisterBuiltin('showEpisodeUpdated')
  private async showEpisodeUpdated({ showEpisode, oldValues, newValues }: ShowEpisodeUpdatedEvent) {
    const channel = await this.feedChannel();
    const showSeason = await this.showSeasons.getById(showEpisode.seasonId);
    const show = showSeason?.showId ? await this.shows.getById(showSeason.showId) : null;
    const debug = '```json\n' + JSON.stringify({ oldValues, newValues }, null, 4) + '\n```';
    await channel.send(`${titleOf(show!)} - Season ${showSeason?.number} - Episode ${showEpisode.number} has been updated\n${debug}`);
  }

  @ListenerService.RegisterBuiltin('showEpisodeDeleted')
  private async showEpisodeDeleted(data: ShowEpisodeDeletedEvent) {
    const channel = await this.feedChannel();
    const showSeason = await this.showSeasons.getById(data.showEpisode.seasonId);
    const show = showSeason?.showId ? await this.shows.getById(showSeason.showId) : null;
    await channel.send(`${titleOf(show!)} - Season ${showSeason?.number} - Episode ${data.showEpisode.number} has been deleted`);
  }
}
