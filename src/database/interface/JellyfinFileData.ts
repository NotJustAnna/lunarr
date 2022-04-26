import { JellyfinVideoTrack } from './JellyfinVideoTrack';
import { JellyfinAudioTrack } from './JellyfinAudioTrack';
import { JellyfinSubtitleTrack } from './JellyfinSubtitleTrack';

export interface JellyfinFileData {
  jellyfinVideoTracks: JellyfinVideoTrack[];
  jellyfinAudioTracks: JellyfinAudioTrack[];
  jellyfinSubtitleTracks: JellyfinSubtitleTrack[];
}

