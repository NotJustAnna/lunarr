import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ShowEpisode } from '../ShowEpisode';
import { JellyfinAudioTrack } from '../../interface/JellyfinAudioTrack';

@Entity('episode_audio_track')
export class EpisodeAudioTrack implements JellyfinAudioTrack {
  @PrimaryGeneratedColumn('uuid', { name: 'epat_id' })
  @Index({ unique: true })
  id!: string;

  @Column('uuid', { name: 'shep_id' })
  episodeId!: string;

  @ManyToOne(() => ShowEpisode, episode => episode.jellyfinAudioTracks)
  @JoinColumn({ name: 'shep_id' })
  episode!: ShowEpisode;

  @CreateDateColumn({ name: 'epat_created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'epat_updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'epat_deleted_at' })
  deletedAt!: Date;

  @Column('text', { name: 'epat_title' })
  title!: string;

  @Column('text', { name: 'epat_codec' })
  codec!: string;

  @Column('text', { name: 'epat_language' })
  language!: string;

  @Column('text', { name: 'epat_channels' })
  channels!: number;

  @Column('text', { name: 'epat_bitrate' })
  bitrate!: number;

  @Column('text', { name: 'epat_sample_rate' })
  sampleRate!: number;
}
