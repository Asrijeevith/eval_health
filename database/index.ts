import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import Post from '../model/post';
import { postSchema } from '../model/postSchema';

const adapter = new SQLiteAdapter({
  schema: {
    version: 1,
    tables: { posts: postSchema }, 
  },
});

const database = new Database({
  adapter,
  modelClasses: [Post],
});

export default database;