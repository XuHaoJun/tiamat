import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const roomSchema = new Schema(
  {
    // nsp example:
    //  /forumBoards/:forumBoardId
    //  /users/:userId
    //  /discussions/:discussionId
    //  /rooms/:roomId
    namespace: { type: String, isRequired: true, index: { unique: true } },
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { toJSON: { virtuals: true } }
);

roomSchema.virtual('messages', {
  ref: 'Message',
  localField: 'namespace',
  foreignField: 'namespace',
  justOne: false,
});

export default mongoose.model('Room', roomSchema);
