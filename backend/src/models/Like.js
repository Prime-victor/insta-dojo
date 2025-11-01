import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
  userAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  targetId: {
    type: String,
    required: true,
    index: true
  },
  targetType: {
    type: String,
    enum: ['post', 'comment'],
    required: true
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

likeSchema.index({ userAddress: 1, targetId: 1, targetType: 1 }, { unique: true });
likeSchema.index({ targetId: 1, targetType: 1, createdAt: -1 });

export default mongoose.model('Like', likeSchema);
