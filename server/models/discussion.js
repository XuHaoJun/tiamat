import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';

const Schema = mongoose.Schema;

const discussionSchema = new Schema({
  title: { type: String, default: '' },
  author: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true},
  content: { type: Schema.Types.Mixed, required: true },
  isRoot: { type: Boolean, default: false, index: true },
  parentDiscussion: {type: Schema.Types.ObjectId, ref: 'Discussion', index: true},
  descendantCount: { type: Number, default: 0 },
  popularityCounter: { type: Number, default: 0 },
  forumBoardGroup: { type: String, default: '' },
  tags: {type: [{ type: String, default: '' }]},
  forumBoard: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'ForumBoard' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

discussionSchema.index({isRoot: 1, forumBoard: 1});

discussionSchema.index({isRoot: 1, forumBoard: 1, forumBoardGroup: 1});

discussionSchema.index({isRoot: 1, forumBoard: 1, tags: 1});

discussionSchema.plugin(mongoosePaginate);

export default mongoose.model('Discussion', discussionSchema);
