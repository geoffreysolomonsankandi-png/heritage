const mongoose = require('mongoose');

const memorialSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  imageUrl: { 
    type: String, 
    required: true 
  },
  // This connects it to a map location if desired
  location: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Location' 
  },
  dateEstablished: { 
    type: Date 
  },
  isMemorialOfTheDay: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Memorial', memorialSchema);