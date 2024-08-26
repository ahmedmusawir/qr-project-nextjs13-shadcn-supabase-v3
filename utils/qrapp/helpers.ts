import QRCode from "qrcode";

/**
 * Generates a QR code image as a data URL.
 * @param {string} text - The text or URL to encode in the QR code.
 * @returns {Promise<string>} - A promise that resolves to a data URL of the QR code image.
 */
export const generateQRCode = async (text: string): Promise<string> => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(text);
    return qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
};
