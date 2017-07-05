import mongoose from "mongoose";
const Schema = mongoose.Schema;

const oauth2ClientSchema = new Schema({
  name: { type: String, required: true, unique: true },
  secret: { type: String, required: true, unique: true },
  redirectURI: { type: String, default: "" }
});

export default mongoose.model("Oauth2Client", oauth2ClientSchema);
