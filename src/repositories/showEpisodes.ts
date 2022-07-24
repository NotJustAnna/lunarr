import { Service } from 'typedi';
import { PrismaClient, Show, SonarrEpisodeDataState } from '@/prisma-client';
import { ShowSeasonsRepository } from '@/repositories/showSeasons';
import { SonarrEpisode } from '@/types/sonarr/api/SonarrEpisode';

@Service()
export class ShowEpisodesRepository {
  constructor(
    private readonly client: PrismaClient,
    private readonly showSeasons: ShowSeasonsRepository,
  ) {
  }

  async batchUpdateEpisodes(showId: Show['id'], externalEpisodes: SonarrEpisode[]) {
    for (const externalEpisode of externalEpisodes) {
      const season = await this.showSeasons.getOrCreateStub(showId, externalEpisode.seasonNumber);

      const episode = await this.client.showEpisode.findUnique({
        where: {
          seasonId_number: {
            seasonId: season.id,
            number: externalEpisode.episodeNumber,
          },
        },
      });

      const data = {
        seasonId: season.id,
        number: externalEpisode.episodeNumber,
        title: externalEpisode.title,
        sonarrId: String(externalEpisode.id),
        sonarrState: externalEpisode.monitored ?
          (externalEpisode.hasFile ? SonarrEpisodeDataState.AVAILABLE : SonarrEpisodeDataState.MONITORED)
          : SonarrEpisodeDataState.UNMONITORED,
      };

      if (episode) {
        await this.client.showEpisode.update({ data, where: { id: episode.id } });
      } else {
        await this.client.showEpisode.create({ data });
      }
    }

    await this.client.showEpisode.updateMany({
      data: {
        sonarrId: null,
        sonarrState: SonarrEpisodeDataState.NONE,
      },
      where: {
        sonarrId: {
          not: null,
          notIn: externalEpisodes.map(e => String(e.id)),
        },
        sonarrState: {
          not: SonarrEpisodeDataState.NONE,
        },
      },
    });
  }
}
