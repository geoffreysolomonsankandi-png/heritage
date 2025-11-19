const mongoose = require('mongoose');

const textContentSchema = new mongoose.Schema({
  // Unique key for the text, e.g., 'homeHeroTitle'
  key: { 
    type: String, 
    required: true, 
    unique: true 
  },
  // The actual text content
  content: { 
    type: String, 
    required: true 
  },
  // For organizing in the admin dashboard
  page: { 
    type: String,
    default: 'general'
  },
  description: {
    type: String
  }
});

module.exports = mongoose.model('TextContent', textContentSchema);