import { Post } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type PostSliceState = {
  feedPosts: Post[];
  feedInitialised: boolean;
};

const initialState: PostSliceState = {
  feedPosts: [],
  feedInitialised: false,
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    createPost: (state, action: PayloadAction<Post>) => {
      state.feedPosts.unshift(action.payload);
    },
    deletePost: (state, action: PayloadAction<{ postId: string }>) => {
      const targetPostIndex = state.feedPosts.findIndex(
        (post) => post.id === action.payload.postId
      );
      state.feedPosts.splice(targetPostIndex, 1);
    },
    likeUnlikePost: (state, action: PayloadAction<{ postId: string; userId: string }>) => {
      const { postId, userId } = action.payload;
      const targetPost = state.feedPosts.find((post) => post.id === postId);
      if (targetPost) {
        targetPost.likes.includes(action.payload.userId)
          ? targetPost.likes.splice(targetPost.likes.indexOf(userId), 1)
          : targetPost.likes.push(userId);
      }
    },
    RevalidatePost: (
      state,
      action: PayloadAction<{ updatedPost: Post | undefined; postId: string; _action: string }>
    ) => {
      const { updatedPost, postId, _action } = action.payload;
      const postIndex = state.feedPosts.findIndex((post) => post.id === postId);
      if (postIndex !== -1) {
        if (updatedPost && _action === "create") {
          state.feedPosts.splice(postIndex, 1, updatedPost);
        } else {
          state.feedPosts.splice(postIndex, 1);
        }
      }
    },
    RevalidatePostStats: (state, action: PayloadAction<{ updatedPost: Post; postId: string }>) => {
      const { updatedPost, postId } = action.payload;
      const targetPost = state.feedPosts.find((post) => post.id === postId);
      if (targetPost) {
        targetPost.likes = updatedPost.likes;
        targetPost.commentCount = updatedPost.commentCount;
      }
    },
    addFeedPosts: (state, action: PayloadAction<Post[]>) => {
      state.feedPosts.push(...action.payload);
    },
    initialiseFeed: (state, action: PayloadAction<Post[]>) => {
      if (state.feedInitialised) return;
      state.feedPosts.push(...action.payload);
      state.feedInitialised = true;
    },
  },
});

export const {
  createPost,
  RevalidatePost,
  deletePost,
  likeUnlikePost,
  RevalidatePostStats,
  addFeedPosts,
  initialiseFeed,
} = postSlice.actions;

export { postSlice, type PostSliceState };

export default postSlice.reducer;
