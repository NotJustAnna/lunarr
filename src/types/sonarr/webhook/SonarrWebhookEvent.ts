export interface SonarrWebhookEvent {
  series: SonarrSeries;
  episodes: SonarrEpisode[];
  episodeFile?: SonarrEpisodeFile;
  deleteReason?: SonarrDeleteReason;
  eventType: SonarrEventType;
  isUpgrade?: boolean;
  downloadClient?: string;
  downloadClientType?: string;
  downloadId?: string;
  release?: SonarrRelease;
}

export interface SonarrEpisodeFile {
  seriesId?: number;
  seasonNumber?: number;
  relativePath: string;
  path: string;
  size: number;
  dateAdded?: Date;
  quality: PurpleQuality | string;
  mediaInfo?: MediaInfo;
  episodes?: Episodes;
  series?: EpisodeFileSeries;
  language?: CutoffClass;
  id: number;
  qualityVersion?: number;
  releaseGroup?: string;
}

export interface Episodes {
  value: ValueElement[];
  isLoaded: boolean;
}

export interface ValueElement {
  seriesId: number;
  tvdbId: number;
  episodeFileId: number;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  airDate: Date;
  airDateUtc: Date;
  overview?: string;
  monitored: boolean;
  absoluteEpisodeNumber: number;
  sceneAbsoluteEpisodeNumber: number;
  sceneSeasonNumber: number;
  sceneEpisodeNumber: number;
  unverifiedSceneNumbering: boolean;
  ratings: Ratings;
  images: Image[];
  episodeFile: ValueEpisodeFile;
  hasFile: boolean;
  id: number;
}

export interface ValueEpisodeFile {
  isLoaded: boolean;
}

export interface Image {
  coverType: CoverType;
  url: string;
}

export interface Ratings {
  votes: number;
  value: number;
}

export interface CutoffClass {
  id: number;
  name: string;
}

export interface MediaInfo {
  containerFormat: string;
  videoFormat: string;
  videoCodecID: string;
  videoProfile: string;
  videoCodecLibrary: string;
  videoBitrate: number;
  videoBitDepth: number;
  videoMultiViewCount: number;
  videoColourPrimaries: string;
  videoTransferCharacteristics: string;
  videoHdrFormat: string;
  videoHdrFormatCompatibility: string;
  width: number;
  height: number;
  audioFormat: string;
  audioCodecID: string;
  audioCodecLibrary: string;
  audioAdditionalFeatures: string;
  audioBitrate: number;
  runTime: string;
  audioStreamCount: number;
  audioChannelsContainer: number;
  audioChannelsStream: number;
  audioChannelPositions: string;
  audioChannelPositionsTextContainer: string;
  audioChannelPositionsTextStream: string;
  audioProfile: string;
  videoFps: number;
  audioLanguages: string;
  subtitles: string;
  scanType: string;
  schemaRevision: number;
}

export interface PurpleQuality {
  quality: ItemQuality;
  revision: Revision;
}

export interface ItemQuality {
  id: number;
  name: string;
  source: Source;
  resolution: number;
}

export interface Revision {
  version: number;
  real: number;
  isRepack: boolean;
}

export interface EpisodeFileSeries {
  value: SeriesValue;
  isLoaded: boolean;
}

export interface SeriesValue {
  tvdbId: number;
  tvRageId: number;
  tvMazeId: number;
  imdbId: string;
  title: string;
  cleanTitle: string;
  sortTitle: string;
  status: Status;
  overview: string;
  airTime: string;
  monitored: boolean;
  qualityProfileId: number;
  languageProfileId: number;
  seasonFolder: boolean;
  lastInfoSync: Date;
  runtime: number;
  images: Image[];
  seriesType: Type;
  network: string;
  useSceneNumbering: boolean;
  titleSlug: string;
  path: string;
  year: number;
  ratings: Ratings;
  genres: string[];
  actors: Actor[];
  certification: string;
  added: Date;
  firstAired: Date;
  qualityProfile: QualityProfile;
  languageProfile: LanguageProfile;
  seasons: Season[];
  tags: any[];
  id: number;
}

export interface Actor {
  name: string;
  character: string;
  images: any[];
}

export interface LanguageProfile {
  value: LanguageProfileValue;
  isLoaded: boolean;
}

export interface LanguageProfileValue {
  name: string;
  languages: LanguageElement[];
  upgradeAllowed: boolean;
  cutoff: CutoffClass;
  id: number;
}

export interface LanguageElement {
  language: CutoffClass;
  allowed: boolean;
}

export interface QualityProfile {
  value: QualityProfileValue;
  isLoaded: boolean;
}

export interface QualityProfileValue {
  name: ValueName;
  upgradeAllowed: boolean;
  cutoff: number;
  items: ValueItem[];
  id: number;
}

export interface ValueItem {
  quality?: ItemQuality;
  items: ItemItem[];
  allowed: boolean;
  id?: number;
  name?: ItemName;
}

export interface ItemItem {
  quality: ItemQuality;
  items: any[];
  allowed: boolean;
}

export interface Season {
  seasonNumber: number;
  monitored: boolean;
  images: any[];
}

export interface SonarrEpisode {
  id: number;
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  airDate?: Date;
  airDateUtc?: Date;
}

export interface SonarrRelease {
  quality: string;
  qualityVersion: number;
  releaseGroup: string;
  releaseTitle: string;
  indexer: string;
  size: number;
}

export interface SonarrSeries {
  id: number;
  title: string;
  path: string;
  tvdbId: number;
  tvMazeId: number;
  imdbId?: string;
  type: string;
}

export enum SonarrDeleteReason {
  MissingFromDisk = 'missingFromDisk',
}

export enum CoverType {
  Banner = 'banner',
  Fanart = 'fanart',
  Poster = 'poster',
  Screenshot = 'screenshot',
}

export enum Source {
  Bluray = 'bluray',
  BlurayRaw = 'blurayRaw',
  Dvd = 'dvd',
  Television = 'television',
  TelevisionRaw = 'televisionRaw',
  Unknown = 'unknown',
  Web = 'web',
  WebRip = 'webRip',
}

export enum ItemName {
  WEB1080P = 'WEB 1080p',
  WEB2160P = 'WEB 2160p',
  WEB480P = 'WEB 480p',
  WEB720P = 'WEB 720p',
}

export enum ValueName {
  HD1080P = 'HD-1080p',
}

export enum Type {
  Anime = 'anime',
  Standard = 'standard',
}

export enum Status {
  Ended = 'ended',
}

export enum SonarrEventType {
  Download = 'Download',
  EpisodeFileDelete = 'EpisodeFileDelete',
  Grab = 'Grab',
  Test = 'Test',
}
