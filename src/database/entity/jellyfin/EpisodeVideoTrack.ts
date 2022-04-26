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
import { JellyfinVideoTrack } from '../../interface/JellyfinVideoTrack';

@Entity('episode_video_track')
export class EpisodeVideoTrack implements JellyfinVideoTrack {
  @PrimaryGeneratedColumn('uuid', { name: 'epvt_id' })
  @Index({ unique: true })
  id!: string;

  @Column('uuid', { name: 'shep_id' })
  episodeId!: string;

  @ManyToOne(() => ShowEpisode, episode => episode.jellyfinVideoTracks)
  @JoinColumn({ name: 'shep_id' })
  episode!: ShowEpisode;

  @CreateDateColumn({ name: 'epvt_created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'epvt_updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'epvt_deleted_at' })
  deletedAt!: Date;

  @Column('text', { name: 'epvt_title' })
  title!: string;

  @Column('text', { name: 'epvt_aspect_ration' })
  aspectRatio!: string;

  @Column('text', { name: 'epvt_codec' })
  codec!: string;

  @Column('text', { name: 'epvt_color_space' })
  colorSpace!: string;

  @Column('boolean', { name: 'epvt_interlaced' })
  interlaced!: boolean;

  @Column('text', { name: 'epvt_height' })
  videoHeight!: number;

  @Column('text', { name: 'epvt_width' })
  videoWidth!: number;

  @Column('text', { name: 'epvt_range' })
  videoRange!: string;
}
