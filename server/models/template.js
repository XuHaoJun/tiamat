import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const templateSchema = new Schema({
  name: { type: String, isRequired: true },
  content: { type: Object },
  code: { type: String, isRequired: true },
  //
  targetKind: {
    type: String,
    enum: ['rootWiki', 'wiki', 'forumBoard', 'discussion'],
    default: 'rootWiki',
  },
  rootWiki: { type: Schema.Types.ObjectId, ref: 'RootWiki', required: true },
  forumBoard: { type: Schema.Types.ObjectId, ref: 'ForumBoard' },
  discussion: { type: Schema.Types.ObjectId, ref: 'Discussion' },
  wiki: { type: Schema.Types.ObjectId, ref: 'Wiki' },
  // end
  data: { type: Object },
  wikiDataForm: { type: Schema.Types.ObjectId, ref: 'WikiDataForm' },
  // babel transformed
  es5Code: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// templateSchema.index({ rootWiki: 1, name: 1 }, { unique: true });
// TODO
// dynamic index with targetKind.

export default mongoose.model('Template', templateSchema);
