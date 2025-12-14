/**
 * Vercel Blob utility for accessing and managing media files
 *
 * Media files are stored in Vercel Blob storage.
 * Update the URLs below with the actual blob URLs from your Vercel dashboard.
 *
 * @example
 * ```astro
 * ---
 * import { BLOB_URLS } from '@/utils/blob';
 * ---
 * <video src={BLOB_URLS.videos.darkMode} controls />
 * <img src={BLOB_URLS.images.stats} alt="Stats" />
 * ```
 */

/**
 * Predefined blob URLs for quick access
 * These URLs point to media files hosted on Vercel Blob storage
 */
export const BLOB_URLS = {
  videos: {
    /** Dark mode UI demonstration video (3.19 MB, H.264 MP4) */
    darkMode: 'https://i6ob6ensqrtpgseh.public.blob.vercel-storage.com/dark-mode.mp4',
    /** Light mode UI demonstration video (2.78 MB, H.264 MP4) */
    lightMode: 'https://i6ob6ensqrtpgseh.public.blob.vercel-storage.com/light-mode.mp4',
  },
  images: {
    /** Navigation interface screenshot (633 kB) */
    rawNavBar: 'https://i6ob6ensqrtpgseh.public.blob.vercel-storage.com/raw-nav-bar.png',
    /** Analytics dashboard screenshot (228 kB) */
    stats: 'https://i6ob6ensqrtpgseh.public.blob.vercel-storage.com/stats.png',
  },
} as const;

/**
 * Type for video blob URLs
 */
export type VideoBlobUrl = typeof BLOB_URLS.videos[keyof typeof BLOB_URLS.videos];

/**
 * Type for image blob URLs
 */
export type ImageBlobUrl = typeof BLOB_URLS.images[keyof typeof BLOB_URLS.images];
