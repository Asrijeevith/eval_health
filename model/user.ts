import { Model, Relation } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';
import Post from './post';

// Custom interface for User associations
interface Associations {
  [key: string]: { type: 'has_many'; foreignKey: string };
}

export default class User extends Model {
  static table = 'users';
  static associations: Associations = {
    posts: { type: 'has_many', foreignKey: 'user_id' },
  };

  @field('username') username!: string;
  @field('avatar_uri') avatarUri!: string;
  @relation('posts', 'user_id') posts!: Relation<Post>;
}