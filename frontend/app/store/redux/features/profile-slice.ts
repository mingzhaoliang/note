import { Post, PostOverview, Profile, ProfileComment } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InitialState = {
  profileInfo: Profile;
  posts: PostOverview[];
  comments: ProfileComment[];
  totalComments: number;
  following: boolean;
  follower: boolean;
};

const initialState: InitialState = {
  profileInfo: {} as Profile,
  posts: [],
  comments: [],
  totalComments: 0,
  following: false,
  follower: false,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<Profile>) => {
      state.profileInfo = action.payload;
    },
    setPosts: (state, action: PayloadAction<PostOverview[]>) => {
      state.posts = action.payload;
    },
    addPosts: (state, action: PayloadAction<PostOverview[]>) => {
      state.posts.push(...action.payload);
    },
    updatePost: (state, action: PayloadAction<Post>) => {
      const postIndex = state.posts.findIndex((post) => post.id === action.payload.id);
      if (postIndex !== -1) {
        state.posts[postIndex] = action.payload;
      }
    },
    setComments: (state, action: PayloadAction<ProfileComment[]>) => {
      state.comments = action.payload;
    },
    addComments: (state, action: PayloadAction<ProfileComment[]>) => {
      state.comments.push(...action.payload);
    },
    updateComment: (state, action: PayloadAction<ProfileComment>) => {
      const commentIndex = state.comments.findIndex((comment) => comment.id === action.payload.id);
      if (commentIndex !== -1) {
        state.comments[commentIndex] = action.payload;
      }
    },
    updateCommentParent: (state, action: PayloadAction<ProfileComment>) => {
      const commentIndex = state.comments.findIndex(
        (comment) => comment.parentId === action.payload.id
      );
      if (commentIndex !== -1) {
        state.comments[commentIndex].parent = action.payload as any;
      }
    },
    setTotalComments: (state, action: PayloadAction<number>) => {
      state.totalComments = action.payload;
    },
    setFollowing: (state, action: PayloadAction<boolean>) => {
      state.following = action.payload;
    },
    setFollower: (state, action: PayloadAction<boolean>) => {
      state.follower = action.payload;
    },
  },
});

export const {
  setProfile,
  setPosts,
  addPosts,
  updatePost,
  setComments,
  addComments,
  updateComment,
  updateCommentParent,
  setTotalComments,
  setFollowing,
  setFollower,
} = profileSlice.actions;

export default profileSlice.reducer;
