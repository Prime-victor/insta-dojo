import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  ipfsHash: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  thumbnailHash: String,
  thumbnailUrl: String
}, { _id: false });

const postSchema = new mongoose.Schema({
  postId: {
    type: String,
    required: true,
    unique: true,
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
    maxlength: 2000,
    default: ''
  },
  contentHash: {
    type: String,
    required: true
  },
  media: [mediaSchema],
  postType: {
    type: String,
    enum: ['text', 'image', 'video', 'repost'],
    default: 'text'
  },
  likeCount: {
    type: Number,
    default: 0,
    min: 0
  },
  commentCount: {
    type: Number,
    default: 0,
    min: 0
  },
  repostCount: {
    type: Number,
    default: 0,
    min: 0
  },
  onChainTx: {
    type: String,
    default: ''
  },
  repostOf: {
    type: String,
    default: null
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

postSchema.index({ authorAddress: 1, timestamp: -1 });
postSchema.index({ timestamp: -1 });
postSchema.index({ contentHash: 1 });

postSchema.methods.calculateEngagementScore = function() {
  const ageInHours = (Date.now() - this.timestamp.getTime()) / (1000 * 60 * 60);
  const timeDecay = Math.pow(ageInHours + 2, 1.8);
  return (this.likeCount * 2 + this.commentCount * 3) / timeDecay;
};

export default mongoose.model('Post', postSchema);
