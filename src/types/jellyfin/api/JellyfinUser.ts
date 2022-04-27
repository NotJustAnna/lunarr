export interface JellyfinUser {
  Name: string;
  ServerId: string;
  Id: string;
  PrimaryImageTag?: string;
  HasPassword: boolean;
  HasConfiguredPassword: boolean;
  HasConfiguredEasyPassword: boolean;
  EnableAutoLogin: boolean;
  LastLoginDate?: string;
  LastActivityDate?: string;
  Configuration: Configuration;
  Policy: Policy;
}

export interface Configuration {
  PlayDefaultAudioTrack: boolean;
  SubtitleLanguagePreference: string;
  DisplayMissingEpisodes: boolean;
  GroupedFolders: any[];
  SubtitleMode: string;
  DisplayCollectionsView: boolean;
  EnableLocalPassword: boolean;
  OrderedViews: string[];
  LatestItemsExcludes: any[];
  MyMediaExcludes: any[];
  HidePlayedInLatest: boolean;
  RememberAudioSelections: boolean;
  RememberSubtitleSelections: boolean;
  EnableNextEpisodeAutoPlay: boolean;
}

export interface Policy {
  IsAdministrator: boolean;
  IsHidden: boolean;
  IsDisabled: boolean;
  BlockedTags: any[];
  EnableUserPreferenceAccess: boolean;
  AccessSchedules: any[];
  BlockUnratedItems: any[];
  EnableRemoteControlOfOtherUsers: boolean;
  EnableSharedDeviceControl: boolean;
  EnableRemoteAccess: boolean;
  EnableLiveTvManagement: boolean;
  EnableLiveTvAccess: boolean;
  EnableMediaPlayback: boolean;
  EnableAudioPlaybackTranscoding: boolean;
  EnableVideoPlaybackTranscoding: boolean;
  EnablePlaybackRemuxing: boolean;
  ForceRemoteSourceTranscoding: boolean;
  EnableContentDeletion: boolean;
  EnableContentDeletionFromFolders: any[];
  EnableContentDownloading: boolean;
  EnableSyncTranscoding: boolean;
  EnableMediaConversion: boolean;
  EnabledDevices: any[];
  EnableAllDevices: boolean;
  EnabledChannels: any[];
  EnableAllChannels: boolean;
  EnabledFolders: string[];
  EnableAllFolders: boolean;
  InvalidLoginAttemptCount: number;
  LoginAttemptsBeforeLockout: number;
  MaxActiveSessions: number;
  EnablePublicSharing: boolean;
  BlockedMediaFolders: any[];
  BlockedChannels: any[];
  RemoteClientBitrateLimit: number;
  AuthenticationProviderId: string;
  PasswordResetProviderId: string;
  SyncPlayAccess: string;
}
