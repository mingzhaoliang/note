import { prisma } from "./client.js";

const notificationTypeSeed = [
  {
    id: 1,
    name: "like-post",
    template: "{{username}} liked your post.",
  },
  {
    id: 2,
    name: "like-comment",
    template: "{{username}} liked your comment.",
  },
  {
    id: 3,
    name: "comment-on-post",
    template: "{{username}} commented on your post.",
  },
  {
    id: 4,
    name: "comment-on-comment",
    template: "{{username}} replied to your comment.",
  },
  {
    id: 5,
    name: "follow-request",
    template: "{{username}} sent you a follow request.",
  },
];

async function main() {
  notificationTypeSeed.forEach(async (notificationType) => {
    await prisma.notificationType.upsert({
      where: { name: notificationType.name },
      update: {},
      create: notificationType,
    });
  });
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
