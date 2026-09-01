import { Storage } from '@google-cloud/storage';
import path from 'path';

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'teepresso';

// Initialize Google Cloud Storage client with Application Default Credentials (ADC)
const storage = new Storage();
const bucket = storage.bucket(BUCKET_NAME);

/**
 * Upload a Buffer or Base64 file directly to Google Cloud Storage bucket (gs://teepresso)
 * @param fileBuffer Buffer containing file data
 * @param destinationFileName Target filename in bucket (e.g., mockups/order-1234.png)
 * @param mimeType MIME type (e.g., image/png, image/jpeg, application/pdf)
 * @returns Public URL of uploaded asset
 */
export const uploadToGCS = async (
  fileBuffer: Buffer,
  destinationFileName: string,
  mimeType: string = 'image/png'
): Promise<string> => {
  try {
    const file = bucket.file(destinationFileName);
    
    await file.save(fileBuffer, {
      metadata: {
        contentType: mimeType,
        cacheControl: 'public, max-age=31536000',
      },
      resumable: false,
    });

    // Generate public GCS URL
    const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${destinationFileName}`;
    console.log(`✅ File uploaded successfully to GCS: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('❌ GCS Upload Error:', error);
    throw error;
  }
};

/**
 * Upload a Base64 string directly to Google Cloud Storage
 */
export const uploadBase64ToGCS = async (
  base64Data: string,
  destinationPath: string
): Promise<string> => {
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    // If raw base64 string without data prefix
    const buffer = Buffer.from(base64Data, 'base64');
    return uploadToGCS(buffer, destinationPath, 'image/png');
  }

  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  return uploadToGCS(buffer, destinationPath, mimeType);
};
