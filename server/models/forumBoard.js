import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';

const Schema = mongoose.Schema;

const forumBoardSchema = new Schema({
  name: { type: String, required: true, index: {unique: true} },
  popularityCounter: { type: Number, default: 0 },
  rootWiki: { type: Schema.Types.ObjectId, ref: 'RootWiki', default: null, index: true},
  groups: { type: [String], default: ["綜合討論"], index: true },
  category: { type: String, default: 'game'},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

forumBoardSchema.index({rootWiki: 1, name: 1}, {unique: true});

forumBoardSchema.index({groups: 1, name: 1});

forumBoardSchema.index({groups: 1, _id: 1});

forumBoardSchema.plugin(mongoosePaginate);

export default mongoose.model('ForumBoard', forumBoardSchema);
