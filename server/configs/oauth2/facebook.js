import { callbackURLPrefix } from "../server";

export const callbackURL =
  process.env.NODE_ENV === "production"
    ? `${callbackURLPrefix}/api/oauth2/facebook/callback`
    : "http://localhost:8000/api/oauth2/facebook/callback";

const facebokApp = {
  clientID: "",
  clientSecret: "",
  callbackURL,
  profileFields: ["id", "name", "displayName", "gender", "email"]
};

export default facebokApp;
