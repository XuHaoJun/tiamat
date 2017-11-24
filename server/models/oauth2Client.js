import uuid from "uuid";
import mongoose from "mongoose";
import oauth2AppConfig from "../configs/oauth2/app";

const Schema = mongoose.Schema;

const oauth2ClientSchema = new Schema({
  name: { type: String, required: true },
  secret: { type: String, default: uuid.v4 },
  isOffical: { type: Boolean },
  domains: { type: [String] },
  redirectURI: { type: String, default: "" }
});

oauth2ClientSchema.index({name: 1, secret: 1});

let defaultOauth2AppClient = null;

// FIXME
// not use name for find oauth2client.
oauth2ClientSchema.statics.getAppClient = function() {
  if (defaultOauth2AppClient) {
    return Promise.resolve(defaultOauth2AppClient);
  }
  const { name } = oauth2AppConfig;
  return this.findOne({ name, isOffical: true }).then(oath2Client => {
    defaultOauth2AppClient = oath2Client;
    return oath2Client;
  });
};

export default mongoose.model("Oauth2Client", oauth2ClientSchema);
