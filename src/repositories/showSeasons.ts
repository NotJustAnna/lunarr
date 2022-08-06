import { Service } from 'typedi';
import { Prisma, PrismaClient, Show, ShowSeason } from '@prisma/client';
import { ChangeSetService } from '@/services/events/changeSet';
import { createLogger } from '@/app/logger';
import _ from 'lodash';
import { ShowEpisodesRepository } from '@/repositories/showEpisodes';
import ShowSeasonWhereInput = Prisma.ShowSeasonWhereInput;
import TransactionClient = Prisma.TransactionClient;

@Service()
export class ShowSeasonsRepository {
  private readonly logger = createLogger(ShowSeasonsRepository.name);

  constructor(
    private readonly client: PrismaClient,
    private readonly events: ChangeSetService,
    private readonly episodes: ShowEpisodesRepository,
  ) {
  }

  async sync(showId: string, number: number, changes: Omit<Partial<ShowSeason>, 'showId' | 'number'>) {
    return this.client.$transaction(async (client) => {
      const season = await client.showSeason.findUnique({
        where: { showId_number: { showId, number } },
      });
      if (season) {
        const updatedSeason = await client.showSeason.update({ data: changes, where: { id: season.id } });
        this.events.fromShowSeasonChanges(season, { showId, number, ...changes });
        return updatedSeason;
      } else {
        const newSeason = await client.showSeason.create({ data: { showId, number, ...changes } });
        this.events.fromNewShowSeason(newSeason);
        return newSeason;
      }
    }, { maxWait: 5000 });
  }

  async foreignUntrack<State extends keyof ShowSeason>(
    showId: Show['id'], numbers: ShowSeason['number'][],
    stateKey: State, allowedState: ShowSeasonWhereInput[State],
  ) {
    return this.client.$transaction(async (client) => {
      const seasons = await client.showSeason.findMany({
        where: {
          showId,
          number: { in: numbers },
          [stateKey]: { not: allowedState },
        },
      });

      if (seasons.length > 0) {
        await client.showSeason.updateMany({
          data: { [stateKey]: allowedState },
          where: { id: { in: seasons.map(s => s.id) } },
        });
        for (const s of seasons) {
          this.events.fromShowSeasonChanges(s, { [stateKey]: allowedState });
        }
      }
    }, { maxWait: 5000 });
  }

  async inheritUntrack<ParentState extends keyof Show, State extends keyof ShowSeason>(
    parentStateKey: ParentState, parentStateValue: Show[ParentState],
    stateKey: State, acceptedStateValue: ShowSeasonWhereInput[State],
  ) {
    return this.client.$transaction(async (client) => {
      const seasons = await client.showSeason.findMany({
        where: {
          show: {
            [parentStateKey]: parentStateValue,
          },
          [stateKey]: { not: acceptedStateValue },
        },
      });

      if (seasons.length > 0) {
        await client.showSeason.updateMany({
          data: { [stateKey]: acceptedStateValue },
          where: { id: { in: seasons.map(s => s.id) } },
        });
        for (const s of seasons) {
          this.events.fromShowSeasonChanges(s, { [stateKey]: acceptedStateValue });
        }
      }
    }, { maxWait: 5000 });
  }

  async deleteUntracked() {
    return this.client.showSeason.deleteMany({
      where: {
        sonarrState: null,
        jellyfinState: null,
      },
    });
  }

  async getById(id: string) {
    return this.client.showSeason.findUnique({ where: { id } });
  }

  async internal_showMerging(client: TransactionClient, showId: string, mergedShowIds: string[]) {
    const seasonsFound = await client.showSeason.findMany({
      where: { showId: { in: [showId, ...mergedShowIds] } },
      orderBy: { createdAt: 'asc' },
    });

    await Promise.allSettled(Object.values(_.groupBy(seasonsFound, 'number')).map(async seasons => {
      if (seasons.length === 1) {
        if (seasons[0].showId !== showId) {
          await client.showSeason.update({
            where: { id: seasons[0].id },
            data: { showId },
          });
        }
        return;
      }
      const merged = seasons.reduce((season, duplicate) => {
        season.jellyfinId = duplicate.jellyfinId || season.jellyfinId;
        season.jellyfinState = duplicate.jellyfinState || season.jellyfinState;
        season.sonarrState = duplicate.sonarrState || season.sonarrState;
        return season;
      });
      const { id, ...mergedChanges } = merged;
      const mergedSeasons = seasons.slice(1).map(s => s.id);
      await this.episodes.internal_seasonMerging(client, id, mergedSeasons);
      await client.showSeason.deleteMany({ where: { id: { in: mergedSeasons } } });
      await client.showSeason.update({
        where: { id },
        data: { ...mergedChanges, showId },
      });
    }));
  }
}
