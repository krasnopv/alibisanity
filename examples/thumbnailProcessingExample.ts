/**
 * Example: How to use thumbnail image processing in your frontend
 * This file shows how to implement optimized video thumbnails
 * using the simple image processing utilities.
 */

import { 
  getOptimizedThumbnailUrl, 
  getResponsiveThumbnailUrls,
  getOptimizedFeaturedImageUrl,
  getResponsiveFeaturedImageUrls,
  processImageForUseCase
} from '../plugins/simpleImageProcessing'

// Example 1: Basic thumbnail processing
export function getVideoThumbnail(project: any) {
  if (!project.videoTrailer?.thumbnail?.asset?._ref) {
    return null
  }

  const assetRef = project.videoTrailer.thumbnail.asset._ref
  
  // Get optimized thumbnail (800x450px, WebP format, 85% quality)
  return getOptimizedThumbnailUrl(assetRef, {
    width: 800,
    height: 450,
    quality: 85,
    format: 'webp',
    fit: 'cover'
  })
}

// Example 2: Responsive thumbnails for different screen sizes
export function getResponsiveThumbnails(project: any) {
  if (!project.videoTrailer?.thumbnail?.asset?._ref) {
    return null
  }

  const assetRef = project.videoTrailer.thumbnail.asset._ref
  return getResponsiveThumbnailUrls(assetRef)
}

// Example 3: Get optimized thumbnail URL
export function getVideoThumbnailUrl(project: any) {
  if (!project.videoTrailer?.thumbnail?.asset?._ref) {
    return null
  }

  return getOptimizedThumbnailUrl(project.videoTrailer.thumbnail.asset._ref)
}

// Example 4: Get responsive thumbnail URLs
export function getVideoThumbnailResponsiveUrls(project: any) {
  if (!project.videoTrailer?.thumbnail?.asset?._ref) {
    return null
  }

  return getResponsiveThumbnailUrls(project.videoTrailer.thumbnail.asset._ref)
}

// Example 5: Fetching projects with optimized images
export async function fetchProjectsWithThumbnails(client: any) {
  const projects = await client.fetch(`
    *[_type == "project"] {
      _id,
      title,
      subtitle,
      videoTrailer {
        type,
        url,
        thumbnail {
          asset,
          alt,
          caption
        }
      }
    }
  `)

  // Process each project to add optimized image URLs
  return projects.map((project: any) => ({
    ...project,
    optimizedThumbnail: getVideoThumbnail(project),
    responsiveThumbnails: getResponsiveThumbnails(project)
  }))
}

// Example 6: Batch processing multiple projects
export function processProjectThumbnails(projects: any[]) {
  return projects.map(project => ({
    ...project,
    thumbnail: {
      ...project.videoTrailer?.thumbnail,
      optimizedUrl: getVideoThumbnail(project),
      responsiveUrls: getResponsiveThumbnails(project)
    }
  }))
}

// Example 7: Featured image processing
export function getFeaturedImage(project: any) {
  if (!project.image?.asset?._ref) {
    return null
  }

  const assetRef = project.image.asset._ref
  
  // Get optimized featured image (1200x675px, WebP format, 90% quality)
  return getOptimizedFeaturedImageUrl(assetRef, {
    width: 1200,
    height: 675,
    quality: 90,
    format: 'webp',
    fit: 'cover'
  })
}

// Example 8: Responsive featured images
export function getResponsiveFeaturedImages(project: any) {
  if (!project.image?.asset?._ref) {
    return null
  }

  const assetRef = project.image.asset._ref
  return getResponsiveFeaturedImageUrls(assetRef)
}

// Example 9: Get featured image URL
export function getFeaturedImageUrl(project: any) {
  if (!project.image?.asset?._ref) {
    return null
  }

  return getOptimizedFeaturedImageUrl(project.image.asset._ref)
}

// Example 10: Different image sizes for different use cases
export function getImageForUseCase(project: any, useCase: 'thumbnail' | 'featured' | 'hero' | 'gallery') {
  if (!project.image?.asset?._ref) {
    return null
  }

  const assetRef = project.image.asset._ref
  return processImageForUseCase(assetRef, useCase)
}

// Example 11: Different thumbnail sizes for different use cases
export function getThumbnailForUseCase(project: any, useCase: 'card' | 'hero' | 'gallery') {
  if (!project.videoTrailer?.thumbnail?.asset?._ref) {
    return null
  }

  const assetRef = project.videoTrailer.thumbnail.asset._ref
  
  switch (useCase) {
    case 'card':
      return getOptimizedThumbnailUrl(assetRef, { width: 400, height: 225 })
    case 'hero':
      return getOptimizedThumbnailUrl(assetRef, { width: 1200, height: 675 })
    case 'gallery':
      return getOptimizedThumbnailUrl(assetRef, { width: 800, height: 450 })
    default:
      return getOptimizedThumbnailUrl(assetRef)
  }
}
