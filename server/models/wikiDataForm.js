import mongoose from "mongoose";

const Schema = mongoose.Schema;

const wikiDataFormSchema = new Schema({
  name: { type: String, required: true },
  rootWiki: { type: Schema.Types.ObjectId, ref: "RootWiki", required: true },
  jsonSchema: { type: Schema.Types.Mixed, required: true },
  uiSchema: { type: Schema.Types.Mixed },
  publisher: { type: Schema.Types.ObjectId, ref: "User", required: true },
  publisherBasicInfo: { type: Object },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

wikiDataFormSchema.index({ name: 1, rootWiki: 1 }, { unique: true });

export default mongoose.model("WikiDataForm", wikiDataFormSchema);
