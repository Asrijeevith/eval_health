import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import data from '../data/sample.json'; 

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: data,
  },
  reducers: {
    toggleLike: (state, action) => {
      const post = state.posts.find((p) => p.id === action.payload);
      if (post) {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
      }
    },
    toggleSave: (state, action) => {
      const post = state.posts.find((p) => p.id === action.payload);
      if (post) {
        post.saved = !post.saved;
      }
    },
    toggleComment: (state, action) => {
      const post = state.posts.find((p) => p.id === action.payload);
      if (post) {
        post.comments = (post.comments || 0) + 1;
      }
    },
    toggleShare: (state, action) => {
      const post = state.posts.find((p) => p.id === action.payload);
      if (post) {
        post.shares = (post.shares || 0) + 1;
      }
    },

    // ✅ ADD THIS
    addPost: (state, action: PayloadAction<any>) => {
      state.posts.unshift(action.payload); // add to top of feed
    },
  },
});

export const {
  toggleLike,
  toggleSave,
  toggleComment,
  toggleShare,
  addPost, // ✅ Export this too
} = postsSlice.actions;

export default postsSlice.reducer;
