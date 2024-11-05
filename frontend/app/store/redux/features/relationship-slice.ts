import { Relationship } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type RelationshipSliceState = {
  followers: Relationship[];
  following: Relationship[];
  followerRequests: Relationship[];
  remainingFollowers: number;
  remainingFollowing: number;
  remainingFollowerRequests: number;
};

const initialState: RelationshipSliceState = {
  followers: [],
  following: [],
  followerRequests: [],
  remainingFollowers: 0,
  remainingFollowing: 0,
  remainingFollowerRequests: 0,
};

export const relationshipSlice = createSlice({
  name: "relationship",
  initialState,
  reducers: {
    setFollowers: (state, action: PayloadAction<Relationship[]>) => {
      action.payload.forEach((relationship) => {
        if (!state.followers.find((f) => f.profile.id === relationship.profile.id)) {
          state.followers.push(relationship);
        }
      });
    },
    setRemainingFollowers: (state, action: PayloadAction<number>) => {
      state.remainingFollowers = action.payload;
    },
    setFollowing: (state, action: PayloadAction<Relationship[]>) => {
      action.payload.forEach((relationship) => {
        if (!state.following.find((f) => f.profile.id === relationship.profile.id)) {
          state.following.push(relationship);
        }
      });
    },
    setRemainingFollowing: (state, action: PayloadAction<number>) => {
      state.remainingFollowing = action.payload;
    },
    setFollowerRequests: (state, action: PayloadAction<Relationship[]>) => {
      action.payload.forEach((relationship) => {
        if (!state.followerRequests.find((f) => f.profile.id === relationship.profile.id)) {
          state.followerRequests.push(relationship);
        }
      });
    },
    setRemainingFollowerRequests: (state, action: PayloadAction<number>) => {
      state.remainingFollowerRequests = action.payload;
    },
    removeFollowerRequest: (state, action: PayloadAction<string>) => {
      state.followerRequests = state.followerRequests.filter(
        (f) => f.profile.id !== action.payload
      );
    },
    resetRelationships: () => initialState,
  },
});

export const {
  setFollowers,
  setFollowing,
  setRemainingFollowers,
  setRemainingFollowing,
  setFollowerRequests,
  setRemainingFollowerRequests,
  removeFollowerRequest,
  resetRelationships,
} = relationshipSlice.actions;

export default relationshipSlice.reducer;
