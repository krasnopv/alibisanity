/**
 * Image Processing Utilities for Sanity
 * Provides functions for automatic image resizing and optimization
 */

export interface ImageProcessingOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpg' | 'png' | 'webp'
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
}

export const DEFAULT_THUMBNAIL_OPTIONS: ImageProcessingOptions = {
  maxWidth: 800,
  maxHeight: 450,
  quality: 85,
  format: 'webp',
  fit: 'cover'
}

/**
 * Generate optimized image URL with Sanity's image processing
 * @param assetRef - Sanity asset reference
 * @param options - Image processing options
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  assetRef: string, 
  options: ImageProcessingOptions = DEFAULT_THUMBNAIL_OPTIONS
): string {
  if (!assetRef) return ''
  
  // Extract asset ID from reference
  const assetId = assetRef.replace('image-', '').replace(/-jpg$/, '.jpg').replace(/-png$/, '.png')
  
  // Build Sanity CDN URL with processing parameters
  const baseUrl = 'https://cdn.sanity.io/images/srer6l4b/production'
  const params = new URLSearchParams()
  
  if (options.maxWidth) params.append('w', options.maxWidth.toString())
  if (options.maxHeight) params.append('h', options.maxHeight.toString())
  if (options.quality) params.append('q', options.quality.toString())
  if (options.format) params.append('fm', options.format)
  if (options.fit) params.append('fit', options.fit)
  
  // Add auto-format for modern browsers
  params.append('auto', 'format')
  
  const queryString = params.toString()
  return `${baseUrl}/${assetId}${queryString ? `?${queryString}` : ''}`
}

/**
 * Get multiple image sizes for responsive images
 * @param assetRef - Sanity asset reference
 * @returns Object with different image sizes
 */
export function getResponsiveImageUrls(assetRef: string) {
  return {
    thumbnail: getOptimizedImageUrl(assetRef, { maxWidth: 400, maxHeight: 225 }),
    medium: getOptimizedImageUrl(assetRef, { maxWidth: 800, maxHeight: 450 }),
    large: getOptimizedImageUrl(assetRef, { maxWidth: 1200, maxHeight: 675 }),
    original: getOptimizedImageUrl(assetRef)
  }
}

/**
 * Validate image dimensions
 * @param width - Image width
 * @param height - Image height
 * @param options - Validation options
 * @returns Validation result
 */
export function validateImageDimensions(
  width: number, 
  height: number, 
  options: { minWidth?: number; minHeight?: number; maxWidth?: number; maxHeight?: number; aspectRatio?: number }
): { isValid: boolean; message?: string } {
  const { minWidth, minHeight, maxWidth, maxHeight, aspectRatio } = options
  
  if (minWidth && width < minWidth) {
    return { isValid: false, message: `Image width must be at least ${minWidth}px` }
  }
  
  if (minHeight && height < minHeight) {
    return { isValid: false, message: `Image height must be at least ${minHeight}px` }
  }
  
  if (maxWidth && width > maxWidth) {
    return { isValid: false, message: `Image width must be no more than ${maxWidth}px` }
  }
  
  if (maxHeight && height > maxHeight) {
    return { isValid: false, message: `Image height must be no more than ${maxHeight}px` }
  }
  
  if (aspectRatio) {
    const currentRatio = width / height
    const tolerance = 0.1 // 10% tolerance
    if (Math.abs(currentRatio - aspectRatio) > tolerance) {
      return { 
        isValid: false, 
        message: `Image aspect ratio should be approximately ${aspectRatio}:1 (currently ${currentRatio.toFixed(2)}:1)` 
      }
    }
  }
  
  return { isValid: true }
}

/**
 * Get image processing recommendations based on use case
 */
export const IMAGE_PROCESSING_PRESETS = {
  thumbnail: {
    maxWidth: 400,
    maxHeight: 225,
    quality: 80,
    format: 'webp' as const,
    fit: 'cover' as const
  },
  hero: {
    maxWidth: 1200,
    maxHeight: 675,
    quality: 90,
    format: 'webp' as const,
    fit: 'cover' as const
  },
  gallery: {
    maxWidth: 800,
    maxHeight: 600,
    quality: 85,
    format: 'webp' as const,
    fit: 'cover' as const
  },
  avatar: {
    maxWidth: 200,
    maxHeight: 200,
    quality: 85,
    format: 'webp' as const,
    fit: 'cover' as const
  }
} as const

/**
 * Process image for specific use case
 * @param assetRef - Sanity asset reference
 * @param preset - Processing preset name
 * @returns Optimized image URL
 */
export function processImageForUseCase(assetRef: string, preset: keyof typeof IMAGE_PROCESSING_PRESETS): string {
  const options = IMAGE_PROCESSING_PRESETS[preset]
  return getOptimizedImageUrl(assetRef, options)
}
