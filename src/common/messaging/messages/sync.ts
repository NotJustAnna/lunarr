import { Message } from './index';
import { SonarrSeries } from '@/types/sonarr/api/SonarrSeries';
import { SonarrEpisode } from '@/types/sonarr/api/SonarrEpisode';
import { RadarrMovie } from '@/types/radarr/api/RadarrMovie';
import { MovieRequest } from '@/types/ombi/api/GetMovieRequests';
import { TvRequest } from '@/types/ombi/api/GetTvRequests';

export class SonarrSeriesSyncMessage extends Message {
  constructor(props?: Omit<SonarrSeriesSyncMessage, 'id'>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
  }

  series!: SonarrSeries[];
}

export class SonarrEpisodesSyncMessage extends Message {
  constructor(props?: Omit<SonarrEpisodesSyncMessage, 'id'>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
  }

  series!: SonarrSeries;
  episodes!: SonarrEpisode[];
}

export class RadarrSyncMessage extends Message {
  movies!: RadarrMovie[];

  constructor(props?: Omit<RadarrSyncMessage, 'id'>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
  }
}

export class OmbiMovieSyncMessage extends Message {
  requests!: MovieRequest[];

  constructor(props?: Omit<OmbiMovieSyncMessage, 'id'>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
  }
}

export class OmbiTvSyncMessage extends Message {
  requests!: TvRequest[];

  constructor(props?: Omit<OmbiTvSyncMessage, 'id'>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
  }
}
