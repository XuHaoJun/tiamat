import googleAnalytics from "./googleAnalytics";
import server from "./server";
import oauth2 from "./oauth2";
import mongoDB from "./mongoDB";
import passport from "./passport";
import elasticsearch from "./elasticsearch";

export default {
  googleAnalytics,
  server,
  oauth2,
  mongoDB,
  passport,
  elasticsearch,
  react: {
    domOutput: "string"
  }
};
