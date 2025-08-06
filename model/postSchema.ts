// model/postSchema.ts
import { tableSchema } from '@nozbe/watermelondb';

export const postSchema = tableSchema({
  name: 'posts',
  columns: [
    { name: 'content_uri', type: 'string' },
    { name: 'avatar_uri', type: 'string' },
    { name: 'username', type: 'string' },
    { name: 'likes', type: 'number' },
    { name: 'caption', type: 'string' },
    { name: 'liked', type: 'boolean' },
    { name: 'saved', type: 'boolean' },
    { name: 'comments', type: 'number' },
    { name: 'shares', type: 'number' },
    { name: 'content_type', type: 'string' },
  ],
});
