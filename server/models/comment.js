import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate";

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  // TODO
  // add required: true for author
  author: { type: Schema.Types.ObjectId, ref: "User", index: true },
  authorBasicInfo: { type: Schema.Types.Mixed },
  content: {
    type: String
  },
  parentDiscussion: {
    type: Schema.Types.ObjectId,
    ref: "Discussion",
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Comment", commentSchema);
