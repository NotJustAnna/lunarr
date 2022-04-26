export interface RadarrWebhookEvent {
  movie: Movie;
  remoteMovie: RemoteMovie;
  release: Release;
  eventType: string;
}

export interface Movie {
  id: number;
  title: string;
  year: number;
  releaseDate: Date;
  folderPath: string;
  tmdbId: number;
}

export interface Release {
  quality: string;
  qualityVersion: number;
  releaseGroup: string;
  releaseTitle: string;
  indexer: string;
  size: number;
}

export interface RemoteMovie {
  tmdbId: number;
  imdbId: string;
  title: string;
  year: number;
}
