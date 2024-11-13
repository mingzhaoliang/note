import { removeDeletedUsers } from "@/features/auth/services/auth.service.js";
import { CronJob } from "cron";

const deleteUsers = new CronJob("0 0 */24 * * *", () => {
  removeDeletedUsers();
});

const startCron = () => {
  deleteUsers.start();
};

export { startCron };
