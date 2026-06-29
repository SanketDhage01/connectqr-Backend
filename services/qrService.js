import QRCode from 'qrcode';

/**
 * Generates a high-quality QR code as a base64 Data URL.
 * @param {string} text The target URL to encode in the QR code.
 * @returns {Promise<string>} Base64 image data URL.
 */
export const generateQR = async (text) => {
  try {
    const options = {
      errorCorrectionLevel: 'H', // High error correction level (approx 30% recovery)
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 512, // Standard high resolution for preview and rendering
      color: {
        dark: '#1e293b',  // Slate 800
        light: '#ffffff'  // Pure White
      }
    };
    
    return await QRCode.toDataURL(text, options);
  } catch (err) {
    console.error('Error generating QR Code:', err);
    throw new Error('Failed to generate QR Code');
  }
};
