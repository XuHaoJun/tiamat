import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';

const Schema = mongoose.Schema;

const wikiSchema = new Schema({
  name: { type: String, required: true, index: true },
  // languages: { zhtw: {name: ?, content: ?}, en: {}, jp: }
  content: { type: Schema.Types.Mixed, required: true },
  // creator: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  // author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  // parent: { type: Schema.Types.ObjectId },
  // rootParent: { type: Schema.Types.ObjectId, default: null },
  // forumBoard: { type: Schema.Types.ObjectId, ref: 'ForumBoard', required: true}
  isNickName: { type: Boolean, default: false },
  rootWiki: { type: Schema.Types.ObjectId, ref: 'RootWiki', required: true, index: true },
  rootWikiGroupTree: { type: Schema.Types.Mixed, default: null },
  tags: { type: [String], default: [], index: true},
  popularityCounter: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

wikiSchema.index({name: 1, rootWiki: 1}, {unique: true});

// TODO
// dynamic create index of rootWikiGroupTree
// ensureIndex(rootWikiGroupTree: {物品: {武器: 1})
// ensureIndex(rootWikiGroupTree: {技能: 1})
// [
//   {name: 物品, children: [{name: 武器, children: [{name: 長劍, '斧'}]}]}
// ]
// {
//  物品: {
//    武器: [
//      '長劍', '斧'
//    ],
//  },
//  技能: ['戰士', '法師']
// }
// wikiSchema.index({rootWikiGroupTree: 1, rootWiki: 1});

wikiSchema.index({tags: 1, rootWiki: 1});

wikiSchema.plugin(mongoosePaginate);

export default mongoose.model('Wiki', wikiSchema);
