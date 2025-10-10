/**
 * Simple Image Processing Plugin for Sanity
 * Provides image optimization utilities without React hooks
 */

import {definePlugin} from 'sanity'

export const simpleImageProcessing = definePlugin({
  name: 'simple-image-processing',
  // This plugin provides utilities but doesn't hook into React components
  // to avoid the useHook error
})

/**
 * Generate optimized image URL with Sanity's built-in image processing
 * This is the main function to use for image optimization
 */
export function getOptimizedThumbnailUrl(assetRef: string, options: {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpg' | 'png'
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
} = {}) {
  if (!assetRef) return ''
  
  // Default options for video thumbnails
  const {
    width = 800,
    height = 450,
    quality = 85,
    format = 'webp',
    fit = 'cover'
  } = options
  
  // Extract asset ID from reference
  const assetId = assetRef.replace('image-', '').replace(/-jpg$/, '.jpg').replace(/-png$/, '.png')
  
  // Build Sanity CDN URL with processing parameters
  const baseUrl = 'https://cdn.sanity.io/images/srer6l4b/production'
  const params = new URLSearchParams()
  
  params.append('w', width.toString())
  params.append('h', height.toString())
  params.append('q', quality.toString())
  params.append('fm', format)
  params.append('fit', fit)
  params.append('auto', 'format') // Auto-format for modern browsers
  
  return `${baseUrl}/${assetId}?${params.toString()}`
}

/**
 * Get responsive image URLs for different screen sizes
 */
export function getResponsiveThumbnailUrls(assetRef: string) {
  return {
    small: getOptimizedThumbnailUrl(assetRef, { width: 400, height: 225 }),
    medium: getOptimizedThumbnailUrl(assetRef, { width: 800, height: 450 }),
    large: getOptimizedThumbnailUrl(assetRef, { width: 1200, height: 675 }),
    original: getOptimizedThumbnailUrl(assetRef, { width: 1600, height: 900 })
  }
}

/**
 * Generate optimized featured image URL for projects
 * Optimized for hero/featured display (larger than thumbnails)
 */
export function getOptimizedFeaturedImageUrl(assetRef: string, options: {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpg' | 'png'
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
} = {}) {
  if (!assetRef) return ''
  
  // Default options for featured images (larger than thumbnails)
  const {
    width = 1200,
    height = 675,
    quality = 90,
    format = 'webp',
    fit = 'cover'
  } = options
  
  // Extract asset ID from reference
  const assetId = assetRef.replace('image-', '').replace(/-jpg$/, '.jpg').replace(/-png$/, '.png')
  
  // Build Sanity CDN URL with processing parameters
  const baseUrl = 'https://cdn.sanity.io/images/srer6l4b/production'
  const params = new URLSearchParams()
  
  params.append('w', width.toString())
  params.append('h', height.toString())
  params.append('q', quality.toString())
  params.append('fm', format)
  params.append('fit', fit)
  params.append('auto', 'format') // Auto-format for modern browsers
  
  return `${baseUrl}/${assetId}?${params.toString()}`
}

/**
 * Get responsive featured image URLs for different screen sizes
 */
export function getResponsiveFeaturedImageUrls(assetRef: string) {
  return {
    small: getOptimizedFeaturedImageUrl(assetRef, { width: 600, height: 338 }),
    medium: getOptimizedFeaturedImageUrl(assetRef, { width: 900, height: 506 }),
    large: getOptimizedFeaturedImageUrl(assetRef, { width: 1200, height: 675 }),
    hero: getOptimizedFeaturedImageUrl(assetRef, { width: 1600, height: 900 }),
    original: getOptimizedFeaturedImageUrl(assetRef, { width: 1920, height: 1080 })
  }
}

/**
 * Validate image dimensions for thumbnails
 */
export function validateThumbnailDimensions(width: number, height: number) {
  const aspectRatio = width / height
  const targetRatio = 16 / 9 // 1.777...
  const tolerance = 0.1 // 10% tolerance
  
  if (Math.abs(aspectRatio - targetRatio) > tolerance) {
    return {
      isValid: false,
      message: `Image aspect ratio should be 16:9 (currently ${aspectRatio.toFixed(2)}:1)`
    }
  }
  
  if (width < 400 || height < 225) {
    return {
      isValid: false,
      message: 'Image should be at least 400x225 pixels'
    }
  }
  
  return { isValid: true }
}

/**
 * Validate image dimensions for featured images
 */
export function validateFeaturedImageDimensions(width: number, height: number) {
  const aspectRatio = width / height
  const targetRatio = 16 / 9 // 1.777...
  const tolerance = 0.1 // 10% tolerance
  
  if (Math.abs(aspectRatio - targetRatio) > tolerance) {
    return {
      isValid: false,
      message: `Image aspect ratio should be 16:9 (currently ${aspectRatio.toFixed(2)}:1)`
    }
  }
  
  if (width < 600 || height < 338) {
    return {
      isValid: false,
      message: 'Featured image should be at least 600x338 pixels'
    }
  }
  
  return { isValid: true }
}

/**
 * Get image processing recommendations based on use case
 */
export const IMAGE_PROCESSING_PRESETS = {
  thumbnail: {
    width: 400,
    height: 225,
    quality: 80,
    format: 'webp' as const,
    fit: 'cover' as const
  },
  featured: {
    width: 1200,
    height: 675,
    quality: 90,
    format: 'webp' as const,
    fit: 'cover' as const
  },
  hero: {
    width: 1600,
    height: 900,
    quality: 95,
    format: 'webp' as const,
    fit: 'cover' as const
  },
  gallery: {
    width: 800,
    height: 600,
    quality: 85,
    format: 'webp' as const,
    fit: 'cover' as const
  }
} as const

/**
 * Process image for specific use case
 */
export function processImageForUseCase(assetRef: string, preset: keyof typeof IMAGE_PROCESSING_PRESETS): string {
  const options = IMAGE_PROCESSING_PRESETS[preset]
  
  if (preset === 'featured' || preset === 'hero') {
    return getOptimizedFeaturedImageUrl(assetRef, options)
  } else {
    return getOptimizedThumbnailUrl(assetRef, options)
  }
}
