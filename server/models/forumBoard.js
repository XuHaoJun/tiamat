import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongoosastic from "mongoosastic";
import elasticsearchConfig from "../configs/elasticsearch";

const Schema = mongoose.Schema;

const forumBoardSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      index: { unique: true },
      es_indexed: true,
      es_type: "text"
    },
    popularityCounter: { type: Number, default: 0 },
    rootWiki: { type: Schema.Types.ObjectId, ref: "RootWiki", index: true },
    groups: { type: [String], default: [], index: true },
    category: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { toJSON: { virtuals: true } }
);

forumBoardSchema.virtual("discussions", {
  ref: "Discussion",
  localField: "_id",
  foreignField: "forumBoard",
  justOne: false
});

forumBoardSchema.index({ rootWiki: 1, name: 1 }, { unique: true });

forumBoardSchema.index({ groups: 1, name: 1 });

forumBoardSchema.index({ groups: 1, _id: 1 });

forumBoardSchema.plugin(mongoosePaginate);

forumBoardSchema.plugin(mongoosastic, elasticsearchConfig);

export default mongoose.model("ForumBoard", forumBoardSchema);
