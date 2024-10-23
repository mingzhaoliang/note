import { findPost } from "@/services/neon/post.service.js";

const createPostDto = (post: Awaited<ReturnType<typeof findPost>>) => {
  if (!post) {
    return null;
  }
  const postDto = {
    ...post,
    profile: {
      ...post.profile,
      avatar: post.profile.avatar ? post.profile.avatar : null,
    },
    tags: post.tags.map(({ tag: { name } }) => name),
    images: post.images.map(({ publicId }) => publicId),
    likes: post.likes.map(({ profileId }: any) => profileId),
    commentCount: post._count.comments,
  };

  return postDto;
};

export { createPostDto };
