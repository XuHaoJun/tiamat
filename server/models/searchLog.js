import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const searchLogSchema = new Schema({
  query: { type: 'String', required: true, index: true, unique: true },
  count: { type: 'Number', required: true, default: 1 },
});

export default mongoose.model('SearchLog', searchLogSchema);
