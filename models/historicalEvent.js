// In: models/historicalEvent.js

const mongoose = require('mongoose');

const historicalEventSchema = new mongoose.Schema({
  month: { type: Number, required: true, min: 1, max: 12 },
  day: { type: Number, required: true, min: 1, max: 31 },
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  link: { type: String },
  
  // NEW FIELD
  isFeatured: {
    type: Boolean,
    default: false
  },

  createdAt: { type: Date, default: Date.now }
});

// Add index for faster lookups on the new field
historicalEventSchema.index({ isFeatured: 1 });
historicalEventSchema.index({ month: 1, day: 1 });

module.exports = mongoose.model('HistoricalEvent', historicalEventSchema);