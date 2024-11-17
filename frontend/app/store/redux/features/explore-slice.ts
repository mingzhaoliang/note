import { BaseProfile, Post } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InitialState = {
  posts: Post[];
  profiles: BaseProfile[];
};

const initialState: InitialState = {
  posts: [],
  profiles: [],
};

const exploreSlice = createSlice({
  name: "explore",
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
    },
    addPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts.push(...action.payload);
    },
    likeUnlikePost: (state, action: PayloadAction<{ id: string; profileId: string }>) => {
      const postIndex = state.posts.findIndex((post) => post.id === action.payload.id);
      if (postIndex !== -1) {
        if (state.posts[postIndex].likes.includes(action.payload.profileId)) {
          state.posts[postIndex].likes = state.posts[postIndex].likes.filter(
            (id) => id !== action.payload.profileId
          );
        } else {
          state.posts[postIndex].likes.push(action.payload.profileId);
        }
      }
    },
    commentOnPost: (state, action: PayloadAction<{ id: string }>) => {
      const postIndex = state.posts.findIndex((post) => post.id === action.payload.id);
      if (postIndex !== -1) {
        state.posts[postIndex]._count.comments += 1;
      }
    },
    deletePost: (state, action: PayloadAction<string>) => {
      const targetPostIndex = state.posts.findIndex((post) => post.id === action.payload);
      state.posts.splice(targetPostIndex, 1);
    },
    setProfiles: (state, action: PayloadAction<BaseProfile[]>) => {
      state.profiles = action.payload;
    },
    addProfiles: (state, action: PayloadAction<BaseProfile[]>) => {
      state.profiles.push(...action.payload);
    },
  },
});

export const {
  setPosts,
  addPosts,
  likeUnlikePost,
  commentOnPost,
  deletePost,
  setProfiles,
  addProfiles,
} = exploreSlice.actions;

export { exploreSlice };

export default exploreSlice.reducer;
