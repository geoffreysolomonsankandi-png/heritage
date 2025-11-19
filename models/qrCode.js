const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  location: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Location',
    required: true,
    unique: true
  },
  // Stores the Base64 data URL of the QR code image
  dataUrl: { 
    type: String, 
    required: true 
  },
  // For analytics
  scanCount: { 
    type: Number, 
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('QRCode', qrCodeSchema);