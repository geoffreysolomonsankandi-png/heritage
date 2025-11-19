const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  aiSummary: { type: String },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  imageUrl: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  qrCode: { type: mongoose.Schema.Types.ObjectId, ref: 'QRCode' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Location', locationSchema);