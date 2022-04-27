import { Message } from './index';
import { SonarrSeries } from '../../types/sonarr/api/SonarrSeries';
import { SonarrEpisode } from '../../types/sonarr/api/SonarrEpisode';

export class SonarrSyncMessage extends Message {
  series!: SonarrSeries;
  episodes!: SonarrEpisode[];

  constructor(props?: Omit<SonarrSyncMessage, 'id'>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
  }
}
