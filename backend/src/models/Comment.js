import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  commentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  postId: {
    type: String,
    required: true,
    index: true
  },
  authorAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  contentHash: {
    type: String,
    required: true
  },
  parentId: {
    type: String,
    default: null,
    index: true
  },
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  likeCount: {
    type: Number,
    default: 0,
    min: 0
  },
  replyCount: {
    type: Number,
    default: 0,
    min: 0
  },
  onChainTx: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

commentSchema.index({ postId: 1, timestamp: -1 });
commentSchema.index({ parentId: 1, timestamp: 1 });

export default mongoose.model('Comment', commentSchema);
