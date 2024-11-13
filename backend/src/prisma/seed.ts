import { prisma } from "./client.js";

const notificationTypeSeed = [
  {
    id: 1,
    name: "like",
    template: "{{username}} liked your post.",
  },
  {
    id: 2,
    name: "comment",
    template: "{{username}} commented on your post.",
  },
  {
    id: 3,
    name: "followRequest",
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
