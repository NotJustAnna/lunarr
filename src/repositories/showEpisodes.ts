import { Service } from 'typedi';
import { Prisma, PrismaClient, ShowEpisode, ShowSeason } from '@/prisma-client';
import { EventEmitterService } from '@/services/eventEmitter';
import ShowEpisodeWhereInput = Prisma.ShowEpisodeWhereInput;

@Service()
export class ShowEpisodesRepository {
  constructor(
    private readonly client: PrismaClient,
    private readonly events: EventEmitterService,
  ) {
  }

  async sync(seasonId: string, number: number, changes: Omit<Partial<ShowEpisode>, 'seasonId' | 'number'>) {
    const episode = await this.client.showEpisode.findUnique({
      where: { seasonId_number: { seasonId, number } },
    });
    if (episode) {
      const updatedEpisode = await this.client.showEpisode.update({ data: changes, where: { id: episode.id } });
      await this.events.fromShowEpisodeChanges(episode, { seasonId, number, ...changes });
      return updatedEpisode;
    } else {
      const newEpisode = await this.client.showEpisode.create({ data: { seasonId, number, ...changes } });
      await this.events.fromNewShowEpisode(newEpisode);
      return newEpisode;
    }
  }

  async foreignUntrack<State extends keyof ShowEpisode>(
    seasonId: ShowSeason['id'], numbers: ShowEpisode['number'][],
    stateKey: State, allowedState: ShowEpisodeWhereInput[State],
  ) {
    const episodes = await this.client.showEpisode.findMany({
      where: {
        seasonId,
        number: { in: numbers },
        [stateKey]: { not: allowedState },
      },
    });

    if (episodes.length > 0) {
      await this.client.showEpisode.updateMany({
        data: { [stateKey]: allowedState },
        where: { id: { in: episodes.map(e => e.id) } },
      });
      await Promise.all(
        episodes.map(
          e => this.events.fromShowEpisodeChanges(e, { [stateKey]: allowedState }),
        ),
      );
    }
  }

  async inheritUntrack<ParentState extends keyof ShowSeason, State extends keyof ShowEpisode>(
    parentStateKey: ParentState, parentStateValue: ShowSeason[ParentState],
    stateKey: State, acceptedStateValue: ShowEpisodeWhereInput[State],
  ) {
    const episodes = await this.client.showEpisode.findMany({
      where: {
        season: {
          [parentStateKey]: parentStateValue,
        },
        [stateKey]: { not: acceptedStateValue },
      },
    });

    if (episodes.length > 0) {
      await this.client.showEpisode.updateMany({
        data: { [stateKey]: acceptedStateValue },
        where: { id: { in: episodes.map(s => s.id) } },
      });
      await Promise.all(
        episodes.map(
          e => this.events.fromShowEpisodeChanges(e, { [stateKey]: acceptedStateValue }),
        ),
      );
    }
  }
}
