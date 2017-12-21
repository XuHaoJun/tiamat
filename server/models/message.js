import mongoose from "mongoose";

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  // nsp example:
  //  /forumBoards/:forumBoardId
  //  /users/:userId
  //  /discussions/:discussionId
  namespace: { type: String, isRequired: true },
  author: { type: Schema.Types.ObjectId, ref: "User", isRequired: true },
  authorBasicInfo: { type: Object, isRequired: true },
  content: { type: String, isRequired: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

messageSchema.virtual("room", {
  ref: "Room",
  localField: "namespace",
  foreignField: "namespace",
  justOne: true
});

export default mongoose.model("Message", messageSchema);
