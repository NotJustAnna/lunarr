interface JellyfinData {
  videos: VideoData[];
  audios: AudioData[];
  subtitles: SubtitleData[];
}

interface VideoData {
  codec: string;
  dimensions: {
    width: number;
    height: number;
  };
  aspectRatio: string;
  interlaced: boolean;
  videoRange: string;
  colorSpace: string;
}

interface AudioData {
  codec: string;
  channels: number;
  language: string;
  bitrate: number;
  sampleRate: number;
}

interface SubtitleData {
  language: string;
  codec: string;
  forced: boolean;
  external: boolean;
}
