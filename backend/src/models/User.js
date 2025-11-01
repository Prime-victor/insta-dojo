import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    index: true
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  followerCount: {
    type: Number,
    default: 0,
    min: 0
  },
  followingCount: {
    type: Number,
    default: 0,
    min: 0
  },
  reputation: {
    type: Number,
    default: 0,
    min: 0
  },
  postCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userSchema.index({ username: 'text', bio: 'text' });

userSchema.methods.toPublicJSON = function() {
  return {
    walletAddress: this.walletAddress,
    username: this.username,
    avatar: this.avatar,
    bio: this.bio,
    followerCount: this.followerCount,
    followingCount: this.followingCount,
    reputation: this.reputation,
    postCount: this.postCount,
    isVerified: this.isVerified,
    createdAt: this.createdAt
  };
};

export default mongoose.model('User', userSchema);
