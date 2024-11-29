import { CronJob } from "cron";
import https from "https";

const ping = new CronJob("*/14 * * * * *", () => {
  if (!process.env.APP_URL) {
    console.error("APP_URL is not defined");
    return;
  }
  https
    .get(process.env.APP_URL, (res) => {
      if (res.statusCode === 200) {
        console.log("GET request sent successfully");
      } else {
        console.log("GET request failed", res.statusCode);
      }
    })
    .on("error", (e) => {
      console.error("Error while sending request", e);
    });
});

const startCron = () => {
  if (process.env.NODE_ENV === "production") {
    ping.start();
  }
};

export { startCron };
