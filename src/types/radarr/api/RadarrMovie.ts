export interface RadarrMovie {
  title: string;
  originalTitle: string;
  originalLanguage: Language;
  alternateTitles: AlternateTitle[];
  secondaryYearSourceId: number;
  sortTitle: string;
  sizeOnDisk: number;
  status: string;
  overview: string;
  inCinemas: string;
  digitalRelease?: string;
  images: Image[];
  website: string;
  year: number;
  hasFile: boolean;
  youTubeTrailerId: string;
  studio: string;
  path: string;
  qualityProfileId: number;
  monitored: boolean;
  minimumAvailability: string;
  isAvailable: boolean;
  folderName: string;
  runtime: number;
  cleanTitle: string;
  imdbId: string;
  tmdbId: number;
  titleSlug: string;
  genres: string[];
  tags: any[];
  added: string;
  ratings: Ratings;
  movieFile?: MovieFile;
  id: number;
  physicalRelease?: string;
  certification?: string;
  collection?: Collection;
}

export interface AlternateTitle {
  sourceType: string;
  movieId: number;
  title: string;
  sourceId: number;
  votes: number;
  voteCount: number;
  language: Language;
  id: number;
}

export interface Language {
  id: number;
  name: string;
}

export interface Collection {
  name: string;
  tmdbId: number;
  images: any[];
}

export interface Image {
  coverType: string;
  url: string;
  remoteUrl: string;
}

export interface MovieFile {
  movieId: number;
  relativePath: string;
  path: string;
  size: number;
  dateAdded: string;
  sceneName: string;
  indexerFlags: number;
  quality: MovieFileQuality;
  mediaInfo: MediaInfo;
  originalFilePath: string;
  qualityCutoffNotMet: boolean;
  languages: Language[];
  releaseGroup: string;
  edition: string;
  id: number;
}

export interface MediaInfo {
  audioBitrate: number;
  audioChannels: number;
  audioCodec: string;
  audioLanguages: string;
  audioStreamCount: number;
  videoBitDepth: number;
  videoBitrate: number;
  videoCodec: string;
  videoDynamicRangeType: string;
  videoFps: number;
  resolution: string;
  runTime: string;
  scanType: string;
  subtitles: string;
}

export interface MovieFileQuality {
  quality: QualityQuality;
  revision: Revision;
}

export interface QualityQuality {
  id: number;
  name: string;
  source: string;
  resolution: number;
  modifier: string;
}

export interface Revision {
  version: number;
  real: number;
  isRepack: boolean;
}

export interface Ratings {
  imdb?: Mdb;
  tmdb: Mdb;
  rottenTomatoes?: Metacritic;
  metacritic?: Metacritic;
}

export interface Mdb {
  votes: number;
  value: number;
  type: string;
}

export interface Metacritic {
  votes: number;
  value: number;
  type: string;
}
