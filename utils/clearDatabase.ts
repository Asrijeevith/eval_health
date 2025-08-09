// utils/clearDatabase.ts
import database from '../database';
import Post from '../model/Post';
import User from '../model/User';

export const clearDatabase = async () => {
  try {
    console.log('Clearing database...');
    await database.write(async () => {
      const postsCollection = database.get<Post>('posts');
      const usersCollection = database.get<User>('users');

      // Fetch and delete all posts
      const allPosts = await postsCollection.query().fetch();
      console.log('Found posts to delete:', allPosts.length);
      await Promise.all(allPosts.map(post => post.destroyPermanently()));

      // Fetch and delete all users
      const allUsers = await usersCollection.query().fetch();
      console.log('Found users to delete:', allUsers.length);
      await Promise.all(allUsers.map(user => user.destroyPermanently()));

      console.log('Database cleared successfully');
    });
  } catch (error) {
    console.error('Failed to clear database:', error);
  }
};