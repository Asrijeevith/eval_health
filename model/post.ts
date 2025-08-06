// model/Post.ts
import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Post extends Model {
  static table = 'posts';
  @field('content_uri') contentUri!: string;
  @field('avatar_uri') avatarUri!: string;
  @field('username') username!: string;
  @field('likes') likes!: number;
  @field('caption') caption!: string;
  @field('liked') liked!: boolean;
  @field('saved') saved!: boolean;
  @field('comments') comments!: number;
  @field('shares') shares!: number;
  @field('content_type') contentType!: 'image' | 'video' | 'pdf';
}

