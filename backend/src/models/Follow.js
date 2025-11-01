import mongoose from 'mongoose';

const followSchema = new mongoose.Schema({
  follower: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  following: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  onChainTx: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ following: 1, createdAt: -1 });

export default mongoose.model('Follow', followSchema);
