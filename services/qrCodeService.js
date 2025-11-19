const QRCode = require('qrcode');
const QRModel = require('../models/qrCode'); // Assuming qrCode model exists

const generate = async (locationId) => {
  const url = `http://localhost:3000/location/${locationId}`; // URL for the QR code to point to
  try {
    const qrDataUrl = await QRCode.toDataURL(url);
    const newQR = new QRModel({
      location: locationId,
      dataUrl: qrDataUrl
    });
    await newQR.save();
    return newQR;
  } catch (err) {
    console.error('QR Code Generation Failed:', err);
  }
};

module.exports = { generate };