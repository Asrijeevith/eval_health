import database from './index';
import Post from '../model/post';
import User from '../model/user';
import uuid from 'react-native-uuid';

export const insertPosts = async () => {
  console.log('Starting insertPosts...');
  try {
    await database.write(async () => {
      console.log('Creating users...');
      const usersCollection = database.get<User>('users');
      const johnDoe = await usersCollection.create(user => {
        user._raw.id = uuid.v4().toString();
        user.username = 'john_doe';
        user.avatarUri = 'https://i.pravatar.cc/150?img=1';
      });
      const janeDoe = await usersCollection.create(user => {
        user._raw.id = uuid.v4().toString();
        user.username = 'jane_doe';
        user.avatarUri = 'https://i.pravatar.cc/150?img=2';
      });
      const bobSmith = await usersCollection.create(user => {
        user._raw.id = uuid.v4().toString();
        user.username = 'bob_smith';
        user.avatarUri = 'https://i.pravatar.cc/150?img=3';
      });
      console.log('Users created:', [johnDoe.id, janeDoe.id, bobSmith.id]);

      console.log('Creating posts...');
      const postsCollection = database.get<Post>('posts');
      await postsCollection.create(post => {
        post._raw.id = uuid.v4().toString();
        post.contentUri = 'https://picsum.photos/200/300';
        post.userId = johnDoe.id;
        post.likes = 120;
        post.caption = 'Sample post 1';
        post.liked = false;
        post.saved = false;
        post.comments = 10;
        post.shares = 5;
        post.contentType = 'image';
      });
      await postsCollection.create(post => {
        post._raw.id = uuid.v4().toString();
        post.contentUri = 'https://www.w3schools.com/html/mov_bbb.mp4';
        post.userId = janeDoe.id;
        post.likes = 150;
        post.caption = 'Sample video post';
        post.liked = false;
        post.saved = false;
        post.comments = 20;
        post.shares = 8;
        post.contentType = 'video';
      });
      await postsCollection.create(post => {
        post._raw.id = uuid.v4().toString();
        post.contentUri = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        post.userId = bobSmith.id;
        post.likes = 80;
        post.caption = 'Sample PDF post';
        post.liked = false;
        post.saved = false;
        post.comments = 5;
        post.shares = 2;
        post.contentType = 'pdf';
      });
      console.log('Posts created successfully');
    });
    console.log('insertPosts completed successfully');
  } catch (error) {
    console.error('insertPosts failed:', error);
    throw error;
  }
};