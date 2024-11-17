import { Post } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: Post[] = [];

const feedSlice = createSlice({
  name: "feed",
  initialState,
  reducers: {
    setFeeds: (state, action: PayloadAction<Post[]>) => action.payload,
    addFeeds: (state, action: PayloadAction<Post[]>) => {
      state.push(...action.payload);
    },
    likeUnlikePost: (state, action: PayloadAction<{ id: string; profileId: string }>) => {
      const postIndex = state.findIndex((post) => post.id === action.payload.id);
      if (postIndex !== -1) {
        if (state[postIndex].likes.includes(action.payload.profileId)) {
          state[postIndex].likes = state[postIndex].likes.filter(
            (id) => id !== action.payload.profileId
          );
        } else {
          state[postIndex].likes.push(action.payload.profileId);
        }
      }
    },
    commentOnPost: (state, action: PayloadAction<{ id: string }>) => {
      const postIndex = state.findIndex((post) => post.id === action.payload.id);
      if (postIndex !== -1) {
        state[postIndex]._count.comments += 1;
      }
    },
    createPost: (state, action: PayloadAction<Post>) => {
      state.unshift(action.payload);
    },
    deletePost: (state, action: PayloadAction<string>) => {
      const index = state.findIndex((post) => post.id === action.payload);
      if (index !== -1) {
        state.splice(index, 1);
      }
    },
  },
});

export const { setFeeds, likeUnlikePost, commentOnPost, createPost, deletePost, addFeeds } =
  feedSlice.actions;

export { feedSlice };

export default feedSlice.reducer;
