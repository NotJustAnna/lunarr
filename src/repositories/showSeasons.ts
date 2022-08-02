import { Service } from 'typedi';
import { Prisma, PrismaClient, Show, ShowSeason } from '@prisma/client';
import { ChangeSetService } from '@/services/events/changeSet';
import ShowSeasonWhereInput = Prisma.ShowSeasonWhereInput;

@Service()
export class ShowSeasonsRepository {
  constructor(
    private readonly client: PrismaClient,
    private readonly events: ChangeSetService,
  ) {
  }

  async sync(showId: string, number: number, changes: Omit<Partial<ShowSeason>, 'showId' | 'number'>) {
    const season = await this.client.showSeason.findUnique({
      where: { showId_number: { showId, number } },
    });
    if (season) {
      const updatedSeason = await this.client.showSeason.update({ data: changes, where: { id: season.id } });
      await this.events.fromShowSeasonChanges(season, { showId, number, ...changes });
      return updatedSeason;
    } else {
      const newSeason = await this.client.showSeason.create({ data: { showId, number, ...changes } });
      await this.events.fromNewShowSeason(newSeason);
      return newSeason;
    }
  }

  async foreignUntrack<State extends keyof ShowSeason>(
    showId: Show['id'], numbers: ShowSeason['number'][],
    stateKey: State, allowedState: ShowSeasonWhereInput[State],
  ) {
    const seasons = await this.client.showSeason.findMany({
      where: {
        showId,
        number: { in: numbers },
        [stateKey]: { not: allowedState },
      },
    });

    if (seasons.length > 0) {
      await this.client.showSeason.updateMany({
        data: { [stateKey]: allowedState },
        where: { id: { in: seasons.map(s => s.id) } },
      });
      await Promise.all(
        seasons.map(
          s => this.events.fromShowSeasonChanges(s, { [stateKey]: allowedState }),
        ),
      );
    }
  }

  async inheritUntrack<ParentState extends keyof Show, State extends keyof ShowSeason>(
    parentStateKey: ParentState, parentStateValue: Show[ParentState],
    stateKey: State, acceptedStateValue: ShowSeasonWhereInput[State],
  ) {
    const seasons = await this.client.showSeason.findMany({
      where: {
        show: {
          [parentStateKey]: parentStateValue,
        },
        [stateKey]: { not: acceptedStateValue },
      },
    });

    if (seasons.length > 0) {
      await this.client.showSeason.updateMany({
        data: { [stateKey]: acceptedStateValue },
        where: { id: { in: seasons.map(s => s.id) } },
      });
      await Promise.all(
        seasons.map(
          s => this.events.fromShowSeasonChanges(s, { [stateKey]: acceptedStateValue }),
        ),
      );
    }
  }
}
