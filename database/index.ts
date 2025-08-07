import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import Post from '../model/post';
import User from '../model/user';
import { postSchema, userSchema } from '../model/postSchema';

const adapter = new SQLiteAdapter({
  schema: {
    version: 4,
    tables: {
      posts: postSchema,
      users: userSchema,
    },
  },
});

const database = new Database({
  adapter,
  modelClasses: [Post, User],
});

export default database;