import { Model, Relation } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';
import User from '../model/user';

// Custom interface for Post associations
interface Associations {
  [key: string]: { type: 'belongs_to'; key: string };
}

export default class Post extends Model {
  static table = 'posts';
  static associations: Associations = {
    users: { type: 'belongs_to', key: 'user_id' },
  };

  @field('content_uri') contentUri!: string;
  @field('likes') likes!: number;
  @field('caption') caption!: string;
  @field('liked') liked!: boolean;
  @field('saved') saved!: boolean;
  @field('comments') comments!: number;
  @field('shares') shares!: number;
  @field('content_type') contentType!: 'image' | 'video' | 'pdf';
  @field('user_id') userId!: string;
  @relation('users', 'user_id') user!: Relation<User>;
}