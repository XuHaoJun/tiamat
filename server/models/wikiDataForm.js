import mongoose from "mongoose";

const Schema = mongoose.Schema;

const wikiDataFormSchema = new Schema({
  name: { type: String, required: true },
  jsonSchema: { type: Schema.Types.Mixed, required: true },
  jsonUISchema: { type: Schema.Types.Mixed },
  publisher: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rootWiki: { type: Schema.Types.ObjectId, ref: "RootWiki", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

wikiDataFormSchema.index({ name: 1, rootWiki: 1 }, { unique: true });

export default mongoose.model("WikiDataForm", wikiDataFormSchema);
