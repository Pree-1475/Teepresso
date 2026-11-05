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
 * - Bypasses PDFs, SVGs, and Audio files safely!
 */
export const optimizeImage = async (
  buffer: Buffer,
  mimeType: string = 'image/png'
): Promise<{ optimizedBuffer: Buffer; finalMimeType: string; extension: string }> => {
  // If it's not a raster image (e.g. PDF, SVG, Audio), bypass Sharp optimization
  if (mimeType.includes('pdf') || mimeType.includes('svg+xml') || mimeType.startsWith('audio/')) {
    let ext = 'bin';
    if (mimeType.includes('pdf')) ext = 'pdf';
    else if (mimeType.includes('svg')) ext = 'svg';
    else if (mimeType.includes('webm')) ext = 'webm';
    else if (mimeType.includes('mp4') || mimeType.includes('m4a')) ext = 'mp4';
    else if (mimeType.includes('ogg')) ext = 'ogg';
    else if (mimeType.includes('wav')) ext = 'wav';
    else if (mimeType.includes('mpeg') || mimeType.includes('mp3')) ext = 'mp3';
    else if (mimeType.startsWith('audio/')) ext = mimeType.split('/')[1]?.split(';')[0] || 'audio';

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
 * @param destinationFileName Target filename in bucket (e.g., mockups/order-1234, voicenotes/voice-123.webm)
 * @param mimeType MIME type (e.g., image/png, audio/webm, audio/mp4, application/pdf)
 * @returns Public URL of uploaded asset
 */
export const uploadToGCS = async (
  fileBuffer: Buffer,
  destinationFileName: string,
  mimeType: string = 'image/png'
): Promise<string> => {
  try {
    // Run Sharp image compression & WebP conversion (or bypass if audio/pdf)
    const { optimizedBuffer, finalMimeType, extension } = await optimizeImage(fileBuffer, mimeType);

    // Adjust file extension if destinationFileName doesn't match optimized extension
    let targetFileName = destinationFileName;
    if (finalMimeType === 'image/webp' && !targetFileName.endsWith('.webp')) {
      targetFileName = targetFileName.replace(/\.[^/.]+$/, "") + '.webp';
    } else if (finalMimeType.startsWith('audio/') && !targetFileName.endsWith(`.${extension}`)) {
      targetFileName = targetFileName.replace(/\.[^/.]+$/, "") + `.${extension}`;
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
    console.log(`✅ File stored & uploaded to GCS: ${publicUrl}`);
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

  const matches = base64Data.match(/^data:([A-Za-z0-9_\-\.\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    const buffer = Buffer.from(base64Data, 'base64');
    return uploadToGCS(buffer, destinationPath, 'image/png');
  }

  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  return uploadToGCS(buffer, destinationPath, mimeType);
};

/**
 * Validate, process, and securely upload an audio voice note
 */
export const processVoiceNoteUpload = async (
  voiceNoteData: string | undefined,
  orderIdPrefix: string = 'order'
): Promise<string> => {
  if (!voiceNoteData) return '';
  if (voiceNoteData.startsWith('http://') || voiceNoteData.startsWith('https://')) return voiceNoteData;

  // 1. Validate Base64 Audio MIME type & format
  const matches = voiceNoteData.match(/^data:([a-zA-Z0-9_\-\.\/;=]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    console.warn('⚠️ Invalid voice note data URI format, returning as-is');
    return voiceNoteData;
  }

  const mimeType = matches[1].toLowerCase();
  const allowedAudioTypes = [
    'audio/webm',
    'audio/mp4',
    'audio/ogg',
    'audio/wav',
    'audio/x-wav',
    'audio/mpeg',
    'audio/mp3',
    'audio/aac',
    'audio/x-m4a'
  ];

  const isAudio = allowedAudioTypes.some(t => mimeType.startsWith(t)) || mimeType.startsWith('audio/');
  if (!isAudio) {
    throw new Error(`Unsupported audio format: ${mimeType}. Allowed formats: webm, mp4, ogg, wav, mp3.`);
  }

  // 2. Validate maximum file size (10 MB limit)
  const buffer = Buffer.from(matches[2], 'base64');
  const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // 10MB
  if (buffer.length > MAX_AUDIO_BYTES) {
    throw new Error('Voice note exceeds 10MB limit.');
  }

  // 3. Generate safe unique filename
  let ext = 'webm';
  if (mimeType.includes('mp4') || mimeType.includes('m4a')) ext = 'mp4';
  else if (mimeType.includes('ogg')) ext = 'ogg';
  else if (mimeType.includes('wav')) ext = 'wav';
  else if (mimeType.includes('mpeg') || mimeType.includes('mp3')) ext = 'mp3';
  else if (mimeType.includes('webm')) ext = 'webm';

  const safeFileName = `voicenotes/${orderIdPrefix}_voice_${Date.now()}_${Math.floor(Math.random() * 100000)}.${ext}`;

  try {
    return await uploadToGCS(buffer, safeFileName, mimeType);
  } catch (err) {
    console.warn('⚠️ GCS voice note upload fallback to base64 data URI:', err);
    return voiceNoteData;
  }
};
