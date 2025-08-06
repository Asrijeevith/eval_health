import database from './database/index';
import Post from './model/post';

export const insertPosts = async () => {
  const postsCollection = database.get<Post>('posts');
  await database.write(async () => {
    await postsCollection.create(post => {
      post.contentUri = 'https://example.com/media/sample.jpg';
      post.avatarUri = 'https://i.pravatar.cc/150?img=1';
      post.username = 'john_doe';
      post.likes = 120;
      post.caption = 'Sample post 1';
      post.liked = false;
      post.saved = false;
      post.comments = 10;
      post.shares = 5;
      post.contentType = 'image';
    });
    await postsCollection.create(post => {
      post.contentUri = 'https://example.com/media/sample2.mp4';
      post.avatarUri = 'https://i.pravatar.cc/150?img=2';
      post.username = 'jane_doe';
      post.likes = 150;
      post.caption = 'Sample video post';
      post.liked = false;
      post.saved = false;
      post.comments = 20;
      post.shares = 8;
      post.contentType = 'video';
    });
    await postsCollection.create(post => {
      post.contentUri = 'https://example.com/media/sample3.pdf';
      post.avatarUri = 'https://i.pravatar.cc/150?img=3';
      post.username = 'bob_smith';
      post.likes = 80;
      post.caption = 'Sample PDF post';
      post.liked = false;
      post.saved = false;
      post.comments = 5;
      post.shares = 2;
      post.contentType = 'pdf';
    });
  });
};