export interface PostType {
  id: string;
  contentUri: string;
  userId: string;
  user: {
    id: string;
    username: string;
    avatarUri: string;
  };
  likes: number;
  caption: string;
  liked: boolean;
  saved: boolean;
  comments: number;
  shares: number;
  contentType: 'image' | 'video' | 'pdf';
}