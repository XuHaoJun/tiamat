import uuidv4 from "uuid/v4";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const oauth2AuthorizationCodeSchema = new Schema({
  code: { type: String, default: uuidv4, unique: true, required: true },
  client: { type: Schema.Types.ObjectId, ref: "Oauth2Client", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  redirectURI: { type: String, default: "" },
  responseType: { type: String, enum: ["code", "token"], default: "code" },
  scope: { type: String, default: "public_profile" }
});

export default mongoose.model(
  "Oauth2AuthorizationCode",
  oauth2AuthorizationCodeSchema
);
