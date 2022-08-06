import { Service } from 'typedi';
import { Prisma, PrismaClient, ShowEpisode, ShowSeason } from '@prisma/client';
import { ChangeSetService } from '@/services/events/changeSet';
import _ from 'lodash';
import ShowEpisodeWhereInput = Prisma.ShowEpisodeWhereInput;
import TransactionClient = Prisma.TransactionClient;

@Service()
export class ShowEpisodesRepository {
  constructor(
    private readonly client: PrismaClient,
    private readonly events: ChangeSetService,
  ) {
  }

  async sync(seasonId: string, number: number, changes: Omit<Partial<ShowEpisode>, 'seasonId' | 'number'>) {
    return this.client.$transaction(async (client) => {
      const episode = await client.showEpisode.findUnique({
        where: { seasonId_number: { seasonId, number } },
      });
      if (episode) {
        const updatedEpisode = await client.showEpisode.update({ data: changes, where: { id: episode.id } });
        this.events.fromShowEpisodeChanges(episode, { seasonId, number, ...changes });
        return updatedEpisode;
      } else {
        const newEpisode = await client.showEpisode.create({ data: { seasonId, number, ...changes } });
        this.events.fromNewShowEpisode(newEpisode);
        return newEpisode;
      }
    }, { maxWait: 5000 });
  }

  async foreignUntrack<State extends keyof ShowEpisode>(
    seasonId: ShowSeason['id'], numbers: ShowEpisode['number'][],
    stateKey: State, allowedState: ShowEpisodeWhereInput[State],
  ) {
    return this.client.$transaction(async (client) => {
      const episodes = await client.showEpisode.findMany({
        where: {
          seasonId,
          number: { in: numbers },
          [stateKey]: { not: allowedState },
        },
      });

      if (episodes.length > 0) {
        await client.showEpisode.updateMany({
          data: { [stateKey]: allowedState },
          where: { id: { in: episodes.map(e => e.id) } },
        });
        for (const e of episodes) {
          this.events.fromShowEpisodeChanges(e, { [stateKey]: allowedState });
        }
      }
    }, { maxWait: 5000 });
  }

  async inheritUntrack<ParentState extends keyof ShowSeason, State extends keyof ShowEpisode>(
    parentStateKey: ParentState, parentStateValue: ShowSeason[ParentState],
    stateKey: State, acceptedStateValue: ShowEpisodeWhereInput[State],
  ) {
    return this.client.$transaction(async (client) => {
      const episodes = await client.showEpisode.findMany({
        where: {
          season: {
            [parentStateKey]: parentStateValue,
          },
          [stateKey]: { not: acceptedStateValue },
        },
      });

      if (episodes.length > 0) {
        await client.showEpisode.updateMany({
          data: { [stateKey]: acceptedStateValue },
          where: { id: { in: episodes.map(s => s.id) } },
        });
        for (const e of episodes) {
          this.events.fromShowEpisodeChanges(e, { [stateKey]: acceptedStateValue });
        }
      }
    }, { maxWait: 5000 });
  }

  async deleteUntracked() {
    return this.client.showEpisode.deleteMany({
      where: {
        sonarrState: null,
        jellyfinState: null,
      },
    });
  }

  async internal_seasonMerging(client: TransactionClient, seasonId: any, mergedSeasonIds: any[]) {
    const episodesFound = await client.showEpisode.findMany({
      where: { seasonId: { in: [seasonId, ...mergedSeasonIds] } },
      orderBy: { createdAt: 'asc' },
    });

    await Promise.allSettled(Object.values(_.groupBy(episodesFound, 'number')).map(async episodes => {
      if (episodes.length === 1) {
        if (episodes[0].seasonId !== seasonId) {
          await client.showEpisode.update({
            where: { id: episodes[0].id },
            data: { seasonId },
          });
        }
        return;
      }
      const merged = episodes.reduce((episode, duplicate) => {
        episode.sonarrTitle = duplicate.sonarrTitle || episode.sonarrTitle;
        episode.jellyfinTitle = duplicate.jellyfinTitle || episode.jellyfinTitle;
        episode.ombiRequestTitle = duplicate.ombiRequestTitle || episode.ombiRequestTitle;
        episode.jellyfinId = duplicate.jellyfinId || episode.jellyfinId;
        episode.sonarrId = duplicate.sonarrId || episode.sonarrId;
        episode.jellyfinState = duplicate.jellyfinState || episode.jellyfinState;
        episode.sonarrState = duplicate.sonarrState || episode.sonarrState;
        episode.ombiRequestState = duplicate.ombiRequestState || episode.ombiRequestState;
        return episode;
      });
      const { id, ...mergedChanges } = merged;
      const mergedEpisodes = episodes.slice(1).map(s => s.id);
      await client.showEpisode.deleteMany({ where: { id: { in: mergedEpisodes } } });
      await client.showEpisode.update({
        where: { id },
        data: { ...mergedChanges, seasonId },
      });
    }));
  }
}
