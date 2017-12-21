import mongoose from "mongoose";

const Schema = mongoose.Schema;

const templateSchema = new Schema({
  rootWiki: { type: Schema.Types.ObjectId, ref: "RootWiki", isRequired: true },
  targetKind: { type: String },
  name: { type: String, isRequired: true },
  content: { type: Object },
  code: { type: String, isRequired: true },
  // babel transformed
  es5Code: { type: String },
  cache: { type: String },
  children: { type: Object },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

templateSchema.index({ rootWiki: 1, name: 1 }, { unique: true });

export default mongoose.model("Template", templateSchema);
