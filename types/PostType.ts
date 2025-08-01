export interface PostType {
  id: string;
  contentUri: string;
  avatarUri: string;
  username: string;
  likes: number;
  caption: string;
  liked: boolean;
  saved: boolean;
  comments?: number;
  shares?: number;
  contentType: 'image' | 'video' | 'pdf'; // ✅ Restrict to only valid values
}
