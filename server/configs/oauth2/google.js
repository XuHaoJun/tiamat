import { callbackURLPrefix } from "../server";

const callbackURL =
  process.env.NODE_ENV === "production"
    ? `${callbackURLPrefix}/api/oauth2/google/callback`
    : "http://localhost:8000/api/oauth2/google/callback";

const googleApp = {
  clientID: "",
  clientSecret: "",
  callbackURL
};

export default googleApp;
