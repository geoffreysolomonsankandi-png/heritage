const mongoose = require('mongoose');

const siteImageSchema = new mongoose.Schema({
  // A unique key to identify the image's purpose, e.g., 'heroBackground', 'logo'
  key: { 
    type: String, 
    required: true, 
    unique: true 
  },
  // The path to the image file, e.g., '/uploads/hero-1678886400000.jpg'
  imageUrl: { 
    type: String, 
    required: true 
  },
  description: {
    type: String // e.g., "The main background for the home page"
  }
});

module.exports = mongoose.model('SiteImage', siteImageSchema);