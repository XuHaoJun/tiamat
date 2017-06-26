import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
import mongoosastic from 'mongoosastic';
import contentToText from '../util/contentToText';
import elasticsearchConfig from '../configs/elasticsearch';

const Schema = mongoose.Schema;

const discussionSchema = new Schema({
  title: { type: String, default: '', es_indexed: true, es_boost: 2.0, es_type: 'text'},
  // TODO
  // imple user feature and add required: true
  author: { type: Schema.Types.ObjectId, ref: 'User', index: true},
  content : {
    type: Schema.Types.Mixed,
    required: true,
    es_indexed: true,
    es_type: 'text',
    es_cast: function(content) {
      return contentToText(content);
    }
  },
  // TOOD
  // remove isRoot and use parentDiscussion exists check is root discussion
  isRoot: { type: Boolean, default: false, index: true, es_indexed: true },
  parentDiscussion: {type: Schema.Types.ObjectId, ref: 'Discussion', index: true, es_indexed: true},
  votes: { type: Number, default: 0, es_index: true},
  totalVotes: { type: Number, default: 0, es_index: true},
  discussionChildrenCount: { type: Number, default: 0, es_indexed: true },
  commentChildrenCount: { type: Number, default: 0, es_indexed: true },
  forumBoardGroup: { type: String, default: '' },
  tags: {type: [{ type: String, default: '' }]},
  forumBoard: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'ForumBoard', es_indexed: true, es_type: 'text' },
  contentEditedAt: { type: Date, default: Date.now, es_indexed: true, es_type: 'date' },
  titleEditedAt: { type: Date, default: Date.now, es_indexed: true, es_type: 'date' },
  repliedAt: { type: Date, default: Date.now, es_indexed: true, es_type: 'date' },
  createdAt: { type: Date, default: Date.now, es_indexed: true, es_type: 'date' },
  updatedAt: { type: Date, default: Date.now, es_indexed: true, es_type: 'date' }
});

discussionSchema.index({isRoot: 1, forumBoard: 1});

discussionSchema.index({isRoot: 1, forumBoard: 1, forumBoardGroup: 1});

discussionSchema.index({isRoot: 1, forumBoard: 1, tags: 1});

discussionSchema.plugin(mongoosePaginate);

discussionSchema.plugin(mongoosastic, elasticsearchConfig);

export default mongoose.model('Discussion', discussionSchema);
