/*
  Warnings:

  - You are about to drop the `PostComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostCommentLike` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PostComment" DROP CONSTRAINT "PostComment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "PostComment" DROP CONSTRAINT "PostComment_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostComment" DROP CONSTRAINT "PostComment_profileId_fkey";

-- DropForeignKey
ALTER TABLE "PostCommentLike" DROP CONSTRAINT "PostCommentLike_commentId_fkey";

-- DropForeignKey
ALTER TABLE "PostCommentLike" DROP CONSTRAINT "PostCommentLike_profileId_fkey";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "commentOnId" TEXT;

-- DropTable
DROP TABLE "PostComment";

-- DropTable
DROP TABLE "PostCommentLike";

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_commentOnId_fkey" FOREIGN KEY ("commentOnId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
