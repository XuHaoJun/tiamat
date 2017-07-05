import mongoose from "mongoose";
import moment from "moment";
import jwt from "jsonwebtoken";
import serverConfig from "../configs/oauth2/app";

const jwtSecret = serverConfig.jwtSecret;

const Schema = mongoose.Schema;

export const defaultExpiresIn = () => moment().add(7, "days").toDate();
export const defaultRefreshExpiresIn = () => moment().add(14, "days").toDate();

const oauth2AccessTokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  client: { type: Schema.Types.ObjectId, ref: "Oauth2Client", required: true },
  token: { type: String, required: true },
  refreshToken: { type: String, required: true },
  scope: { type: String, default: "all" },
  redirectURI: { type: String, default: "" },
  expiresIn: { type: Date, default: defaultExpiresIn },
  refreshExpiresIn: { type: Date, default: defaultRefreshExpiresIn },
  createdAt: { type: Date, default: Date.now }
});

export function genBearerToken(user, options = {}) {
  let data = {};
  if (options.data) {
    data = options.data;
  }
  return jwt.sign(data, jwtSecret, {
    issuer: user._id.toString(),
    expiresIn: options.expiresIn || moment().add(7, "days").valueOf()
  });
}

oauth2AccessTokenSchema.statics.create = function(user, client, props = {}) {
  const now = moment();
  const expiresIn = moment(now).add(7, "days");
  const refreshExpiresIn = moment(now).add(14, "days");
  const tokenString = genBearerToken(user, { expiresIn: expiresIn.valueOf() });
  const refreshTokenString = genBearerToken(user, {
    expiresIn: refreshExpiresIn.valueOf()
  });
  const scope = props.scope || client.name === "App" ? "all" : "public_profile";
  const overideProps = {
    user: user._id,
    client: client._id,
    token: tokenString,
    refreshToken: refreshTokenString,
    expiresIn: expiresIn.toDate(),
    refreshExpiresIn: refreshExpiresIn.toDate(),
    scope
  };
  const finalProps = Object.assign({}, props, overideProps);
  return new this(finalProps);
};

export default mongoose.model("Oauth2AccessToken", oauth2AccessTokenSchema);
