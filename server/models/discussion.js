import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongoosastic from "mongoosastic";
import contentToText from "../util/contentToText";
import elasticsearchConfig from "../configs/elasticsearch";

const Schema = mongoose.Schema;

const discussionSchema = new Schema({
  title: {
    type: String,
    default: "",
    es_indexed: true,
    es_boost: 2.0,
    es_type: "text"
  },
  // TODO
  // add required: true for author
  author: { type: Schema.Types.ObjectId, ref: "User", index: true },
  authorBasicInfo: { type: Schema.Types.Mixed },
  // show last 2 or 5 (mobile or desktop) of comment by default, and click more load all comment.
  lastChildComments: { type: [Schema.Types.Mixed] },
  lastChildCommentCount: { type: Number, default: 0 },
  // TODO
  // limit content size on 10MB
  content: {
    type: Schema.Types.Mixed,
    required: true,
    es_indexed: true,
    es_type: "text",
    es_cast: function(content) {
      return contentToText(content);
    }
  },
  isRoot: { type: Boolean, default: false, index: true, es_indexed: true },
  parentDiscussion: {
    type: Schema.Types.ObjectId,
    ref: "Discussion",
    index: true,
    es_indexed: true
  },
  votes: { type: Number, default: 0, es_index: true },
  totalVotes: { type: Number, default: 0, es_index: true },
  childDiscussionCount: { type: Number, default: 0, es_indexed: true },
  childCommentCount: { type: Number, default: 0, es_indexed: true },
  forumBoardGroup: { type: String },
  tags: { type: [{ type: String, default: "" }] },
  forumBoard: {
    type: Schema.Types.ObjectId,
    // required: true,
    index: true,
    ref: "ForumBoard",
    es_indexed: true,
    es_type: "text"
  },
  titleUpdatedAt: {
    type: Date,
    default: Date.now,
    es_indexed: true,
    es_type: "date"
  },
  repliedAt: {
    type: Date,
    default: Date.now,
    es_indexed: true,
    es_type: "date"
  },
  contentUpdatedAt: {
    type: Date,
    default: Date.now,
    es_indexed: true,
    es_type: "date"
  },
  createdAt: {
    type: Date,
    default: Date.now,
    es_indexed: true,
    es_type: "date"
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    es_indexed: true,
    es_type: "date"
  }
});

discussionSchema.index({ isRoot: 1, forumBoard: 1 });

discussionSchema.index({ isRoot: 1, forumBoard: 1, forumBoardGroup: 1 });

discussionSchema.index({ isRoot: 1, forumBoard: 1, tags: 1 });

discussionSchema.plugin(mongoosePaginate);

discussionSchema.plugin(mongoosastic, elasticsearchConfig);

export default mongoose.model("Discussion", discussionSchema);
