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
    createPostRevalidate: (
      state,
      action: PayloadAction<{ createdPost: Post | undefined; createdAt: string | undefined }>
    ) => {
      const { createdPost, createdAt } = action.payload;
      const tempPostIndex = state.feedPosts.findIndex(
        (post) => post.id.startsWith("tmp-") && post.createdAt === createdAt
      );
      if (tempPostIndex !== -1) {
        if (createdPost) {
          state.feedPosts.splice(tempPostIndex, 1, createdPost);
        } else {
          state.feedPosts.splice(tempPostIndex, 1);
        }
      }
    },
    deletePost: (state, action: PayloadAction<{ postId: string }>) => {
      const targetPostIndex = state.feedPosts.findIndex(
        (post) => post.id === action.payload.postId
      );
      state.feedPosts.splice(targetPostIndex, 1);
    },
    incrementCommentCount: (state, action: PayloadAction<{ postId: string }>) => {
      const targetPost = state.feedPosts.find((post) => post.id === action.payload.postId);
      if (targetPost) {
        targetPost.commentCount += 1;
      }
    },
    incrementCommentRevalidate: (
      state,
      action: PayloadAction<{ postId: string; commentCount: number }>
    ) => {
      const { postId, commentCount } = action.payload;
      const targetPost = state.feedPosts.find((post) => post.id === postId);
      if (targetPost) {
        targetPost.commentCount = commentCount;
      }
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
    likeUnlikePostRevalidate: (
      state,
      action: PayloadAction<{ postId: string; likes: string[] }>
    ) => {
      const { postId, likes } = action.payload;
      const targetPost = state.feedPosts.find((post) => post.id === postId);
      if (targetPost) {
        targetPost.likes = likes;
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
  createPostRevalidate,
  deletePost,
  incrementCommentCount,
  incrementCommentRevalidate,
  likeUnlikePost,
  likeUnlikePostRevalidate,
  addFeedPosts,
  initialiseFeed,
} = postSlice.actions;

export { postSlice, type PostSliceState };

export default postSlice.reducer;
