export interface TvRequest {
  tvDbId: number;
  externalProviderId: number;
  imdbId: string;
  qualityOverride: number;
  rootFolder: number;
  languageProfile: number;
  overview: string;
  title: string;
  posterPath: null | string;
  background: null | string;
  releaseDate: string;
  status: string;
  totalSeasons: number;
  childRequests: ChildRequest[];
  id: number;
}

export interface ChildRequest {
  parentRequestId: number;
  issueId: null;
  seriesType: number;
  subscribed: boolean;
  showSubscribe: boolean;
  releaseYear: string;
  issues: null;
  seasonRequests: SeasonRequest[];
  requestStatus: string;
  title: string;
  approved: boolean;
  markedAsApproved: string;
  requestedDate: string;
  available: boolean;
  markedAsAvailable: null | string;
  requestedUserId: string;
  denied: boolean | null;
  markedAsDenied: string;
  deniedReason: null;
  requestType: number;
  requestedByAlias: null;
  requestedUser: RequestedUser;
  source: number;
  canApprove: boolean;
  id: number;
}

export interface RequestedUser {
  alias: null;
  userType: number;
  providerUserId: null | string;
  lastLoggedIn: string;
  language: null;
  streamingCountry: string;
  movieRequestLimit: number | null;
  episodeRequestLimit: number | null;
  musicRequestLimit: number | null;
  movieRequestLimitType: number | null;
  episodeRequestLimitType: number | null;
  musicRequestLimitType: number | null;
  userAccessToken: string;
  mediaServerToken: null;
  notificationUserIds: null;
  userNotificationPreferences: null;
  isEmbyConnect: boolean;
  userAlias: string;
  emailLogin: boolean;
  isSystemUser: boolean;
  id: string;
  userName: string;
  normalizedUserName: string;
  email: null;
  normalizedEmail: null;
  emailConfirmed: boolean;
  phoneNumber: null;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnd: null;
  lockoutEnabled: boolean;
  accessFailedCount: number;
}

export interface SeasonRequest {
  seasonNumber: number;
  overview: null;
  episodes: Episode[];
  childRequestId: number;
  seasonAvailable: boolean;
  id: number;
}

export interface Episode {
  episodeNumber: number;
  title: string;
  airDate: string;
  url: null;
  available: boolean;
  approved: boolean;
  requested: boolean;
  denied: null;
  deniedReason: null;
  seasonId: number;
  airDateDisplay: string;
  requestStatus: string;
  id: number;
}
