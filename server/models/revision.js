import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const revisionSchema = new mongoose.Schema({
  kind: {
    type: String,
    enum: ['Discussion', 'Wiki', 'RootWiki', 'Revision'],
    required: true,
    index: true,
  },
  deleted: { type: Number, default: 0 },
  parent: { type: Schema.Types.ObjectId, ref: 'Revision' },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  comment: { type: String, required: true },
  data: { type: Schema.Types.Mixed, required: true },
  dataSource: { type: Schema.Types.ObjectId, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

wikiSchema.index({ kind: 1, dataSource: 1 });

export default mongoose.model('Revision', revisionSchema);
