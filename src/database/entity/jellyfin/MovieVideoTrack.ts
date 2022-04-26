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
import { Movie } from '../Movie';
import { JellyfinVideoTrack } from '../../interface/JellyfinVideoTrack';

@Entity('movie_video_track')
export class MovieVideoTrack implements JellyfinVideoTrack {
  @PrimaryGeneratedColumn('uuid', { name: 'movt_id' })
  @Index({ unique: true })
  id!: string;

  @Column('uuid', { name: 'movi_id' })
  movieId!: string;

  @ManyToOne(() => Movie, movie => movie.jellyfinVideoTracks)
  @JoinColumn({ name: 'movi_id' })
  movie!: Movie;

  @CreateDateColumn({ name: 'movt_created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'movt_updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'movt_deleted_at' })
  deletedAt!: Date;

  @Column('text', { name: 'movt_title' })
  title!: string;

  @Column('text', { name: 'movt_aspect_ration' })
  aspectRatio!: string;

  @Column('text', { name: 'movt_codec' })
  codec!: string;

  @Column('text', { name: 'movt_color_space' })
  colorSpace!: string;

  @Column('boolean', { name: 'movt_interlaced' })
  interlaced!: boolean;

  @Column('text', { name: 'movt_height' })
  videoHeight!: number;

  @Column('text', { name: 'movt_width' })
  videoWidth!: number;

  @Column('text', { name: 'movt_range' })
  videoRange!: string;
}
