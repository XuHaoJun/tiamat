import mongoose from "mongoose";
const Schema = mongoose.Schema;

const rootWikiSchema = new Schema({
  name: { type: String, required: true, index: { unique: true } },
  // languages: { zhtw: {name: ?, content: ?}, en: {}, jp: }
  content: { type: Schema.Types.Mixed, required: true },
  // creator: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  // author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  // parent: { type: Schema.Types.ObjectId },
  // rootParent: { type: Schema.Types.ObjectId, default: null },
  groupTree: { type: Schema.Types.Mixed, default: {} },
  forumBoard: {
    type: Schema.Types.ObjectId,
    ref: "ForumBoard",
    required: true,
    index: { unique: true }
  },
  popularityCounter: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 物品: {
//   武器: [
//     '長劍', '斧'
//   ],
//   防具: ['重甲', '皮革']
// },
// 技能: [
//   '戰士', '法師'
// ],

export default mongoose.model("RootWiki", rootWikiSchema);
