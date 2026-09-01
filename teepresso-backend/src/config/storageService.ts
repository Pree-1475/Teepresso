import { Storage } from '@google-cloud/storage';
import sharp from 'sharp';

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'teepresso';

// Initialize Google Cloud Storage client with Application Default Credentials (ADC)
const storage = new Storage();
const bucket = storage.bucket(BUCKET_NAME);

/**
 * Optimizes an image buffer using Sharp:
 * - Resizes images larger than maxDimension (default 1600px) while maintaining aspect ratio
 * - Converts raster images (PNG, JPEG, WEBP) to WebP format with 80% quality compression
 * - Reduces storage footprint by up to 95%
 */
export const optimizeImage = async (
  buffer: Buffer,
  mimeType: string = 'image/png'
): Promise<{ optimizedBuffer: Buffer; finalMimeType: string; extension: string }> => {
  // If it's not a raster image (e.g. PDF, SVG), bypass Sharp optimization
  if (mimeType.includes('pdf') || mimeType.includes('svg+xml')) {
    const ext = mimeType.includes('pdf') ? 'pdf' : 'svg';
    return { optimizedBuffer: buffer, finalMimeType: mimeType, extension: ext };
  }

  try {
    const optimizedBuffer = await sharp(buffer)
      .resize(1600, 1600, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toBuffer();

    return {
      optimizedBuffer,
      finalMimeType: 'image/webp',
      extension: 'webp'
    };
  } catch (err) {
    console.warn('⚠️ Image optimization skipped (fallback to original buffer):', err);
    return {
      optimizedBuffer: buffer,
      finalMimeType: mimeType,
      extension: mimeType.split('/')[1] || 'png'
    };
  }
};

/**
 * Upload a Buffer or Base64 file directly to Google Cloud Storage bucket (gs://teepresso)
 * Automatically optimizes and compresses images before storing!
 * @param fileBuffer Buffer containing file data
 * @param destinationFileName Target filename in bucket (e.g., mockups/order-1234)
 * @param mimeType MIME type (e.g., image/png, image/jpeg, application/pdf)
 * @returns Public URL of uploaded asset
 */
export const uploadToGCS = async (
  fileBuffer: Buffer,
  destinationFileName: string,
  mimeType: string = 'image/png'
): Promise<string> => {
  try {
    // Run Sharp image compression & WebP conversion
    const { optimizedBuffer, finalMimeType, extension } = await optimizeImage(fileBuffer, mimeType);

    // Adjust file extension if destinationFileName doesn't match optimized extension
    let targetFileName = destinationFileName;
    if (finalMimeType === 'image/webp' && !targetFileName.endsWith('.webp')) {
      targetFileName = targetFileName.replace(/\.[^/.]+$/, "") + '.webp';
    }

    const file = bucket.file(targetFileName);

    await file.save(optimizedBuffer, {
      metadata: {
        contentType: finalMimeType,
        cacheControl: 'public, max-age=31536000', // 1 Year HTTP Cache
      },
      resumable: false,
    });

    const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${targetFileName}`;
    console.log(`✅ File compressed & uploaded to GCS: ${publicUrl}`);
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
  if (!base64Data) return '';

  // If already a public GCS URL, return as is
  if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
    return base64Data;
  }

  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    const buffer = Buffer.from(base64Data, 'base64');
    return uploadToGCS(buffer, destinationPath, 'image/png');
  }

  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  return uploadToGCS(buffer, destinationPath, mimeType);
};
