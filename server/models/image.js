import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const imageSchema = new Schema({
  url: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, default: '' },
  title: { type: String, default: '' },
  sourceType: {
    type: String,
    enum: ['discussion', 'wiki', 'rootWiki'],
    defualt: 'discussion',
  },
  source: { type: Schema.Types.ObjectId },
  description: { type: String, default: '' },
  provider: { type: String, enum: ['imgur'], default: 'imgur', required: true },
  providerResponse: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Image', imageSchema);
