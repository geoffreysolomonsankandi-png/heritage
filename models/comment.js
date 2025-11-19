const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: { 
    type: String, 
    required: [true, 'Comment text is required.'] 
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  location: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Location', 
    required: true 
  },
  isFactVerified: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create an index on location and verification status for faster comment lookups
commentSchema.index({ location: 1, isFactVerified: 1 });

module.exports = mongoose.model('Comment', commentSchema);