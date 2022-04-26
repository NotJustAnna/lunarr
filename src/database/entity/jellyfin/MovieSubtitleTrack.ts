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
import { JellyfinSubtitleTrack } from '../../interface/JellyfinSubtitleTrack';

@Entity('movie_subtitle_track')
export class MovieSubtitleTrack implements JellyfinSubtitleTrack {
  @PrimaryGeneratedColumn('uuid', { name: 'most_id' })
  @Index({ unique: true })
  id!: string;

  @Column('uuid', { name: 'movi_id' })
  movieId!: string;

  @ManyToOne(() => Movie, movie => movie.jellyfinSubtitleTracks)
  @JoinColumn({ name: 'movi_id' })
  movie!: Movie;

  @CreateDateColumn({ name: 'most_created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'most_updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'most_deleted_at' })
  deletedAt!: Date;

  @Column('text', { name: 'most_title' })
  title!: string;

  @Column('text', { name: 'most_codec' })
  codec!: string;

  @Column('text', { name: 'most_language' })
  language!: string;

  @Column('boolean', { name: 'most_external' })
  external!: boolean;

  @Column('boolean', { name: 'most_forced' })
  forced!: boolean;
}
