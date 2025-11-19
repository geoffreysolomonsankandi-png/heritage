const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema({
  imageUrl: { 
    type: String, 
    required: true 
  },
  caption: { 
    type: String 
  },
  location: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Location', 
    required: true 
  },
  submittedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('GalleryItem', galleryItemSchema);