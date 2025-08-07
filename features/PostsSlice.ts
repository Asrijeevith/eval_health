import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PostType } from './postType';

interface PostState {
  posts: PostType[];
  isStoryModalVisible: boolean;
  currentStory: PostType | null;
}

const initialState: PostState = {
  posts: [],
  isStoryModalVisible: false,
  currentStory: null,
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    toggleLike: (state, action: PayloadAction<string>) => {
      const post = state.posts.find((p: PostType) => p.id === action.payload);
      if (post) {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
      }
    },
    toggleSave: (state, action: PayloadAction<string>) => {
      const post = state.posts.find((p: PostType) => p.id === action.payload);
      if (post) {
        post.saved = !post.saved;
      }
    },
    toggleComment: (state, action: PayloadAction<string>) => {
      const post = state.posts.find((p: PostType) => p.id === action.payload);
      if (post) {
        post.comments = (post.comments || 0) + 1;
      }
    },
    toggleShare: (state, action: PayloadAction<string>) => {
      const post = state.posts.find((p: PostType) => p.id === action.payload);
      if (post) {
        post.shares = (post.shares || 0) + 1;
      }
    },
    addPost: (state, action: PayloadAction<PostType>) => {
      state.posts.unshift(action.payload);
    },
    setPosts: (state, action: PayloadAction<PostType[]>) => {
      state.posts = action.payload;
    },
    openStoryModal: (state, action: PayloadAction<PostType>) => {
      state.isStoryModalVisible = true;
      state.currentStory = action.payload;
    },
    closeStoryModal: (state) => {
      state.isStoryModalVisible = false;
      state.currentStory = null;
    },
  },
});

export const {
  toggleLike,
  toggleSave,
  toggleComment,
  toggleShare,
  addPost,
  setPosts,
  openStoryModal,
  closeStoryModal,
} = postSlice.actions;

export default postSlice.reducer;