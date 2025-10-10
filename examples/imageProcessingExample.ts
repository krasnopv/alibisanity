/**
 * Example: How to use image processing for video thumbnails
 * This file demonstrates how to implement the image processing features
 * in your frontend application.
 */

import { getOptimizedImageUrl, getResponsiveImageUrls, processImageForUseCase } from '../plugins/imageProcessingUtils'

// Example 1: Basic thumbnail processing
export function getVideoThumbnail(project: any) {
  if (!project.videoTrailer?.thumbnail?.asset?._ref) {
    return null
  }

  const assetRef = project.videoTrailer.thumbnail.asset._ref
  
  // Get optimized thumbnail (800x450px, WebP format)
  return getOptimizedImageUrl(assetRef, {
    maxWidth: 800,
    maxHeight: 450,
    quality: 85,
    format: 'webp',
    fit: 'cover'
  })
}

// Example 2: Responsive images for different screen sizes
export function getResponsiveThumbnails(project: any) {
  if (!project.videoTrailer?.thumbnail?.asset?._ref) {
    return null
  }

  const assetRef = project.videoTrailer.thumbnail.asset._ref
  return getResponsiveImageUrls(assetRef)
}

// Example 3: Using presets for different use cases
export function getThumbnailForUseCase(project: any, useCase: 'thumbnail' | 'hero' | 'gallery') {
  if (!project.videoTrailer?.thumbnail?.asset?._ref) {
    return null
  }

  const assetRef = project.videoTrailer.thumbnail.asset._ref
  return processImageForUseCase(assetRef, useCase)
}

// Example 4: React component for displaying optimized thumbnails
export function VideoThumbnailComponent({ project }: { project: any }) {
  const thumbnailUrl = getVideoThumbnail(project)
  const responsiveUrls = getResponsiveThumbnails(project)
  
  if (!thumbnailUrl) {
    return <div>No thumbnail available</div>
  }

  return (
    <picture>
      {/* WebP format for modern browsers */}
      <source 
        srcSet={responsiveUrls?.medium} 
        type="image/webp" 
      />
      
      {/* JPEG fallback */}
      <source 
        srcSet={thumbnailUrl} 
        type="image/jpeg" 
      />
      
      {/* Fallback img element */}
      <img 
        src={thumbnailUrl}
        alt={project.videoTrailer?.thumbnail?.alt || 'Video thumbnail'}
        loading="lazy"
        style={{
          width: '100%',
          height: 'auto',
          aspectRatio: '16/9'
        }}
      />
    </picture>
  )
}

// Example 5: Next.js Image component with optimization
export function OptimizedVideoThumbnail({ project }: { project: any }) {
  const thumbnailUrl = getVideoThumbnail(project)
  
  if (!thumbnailUrl) {
    return <div>No thumbnail available</div>
  }

  // For Next.js, you can use the Image component with Sanity's optimized URLs
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
      <img
        src={thumbnailUrl}
        alt={project.videoTrailer?.thumbnail?.alt || 'Video thumbnail'}
        loading="lazy"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </div>
  )
}

// Example 6: Fetching projects with optimized images
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

// Example 7: Image validation and error handling
export function validateThumbnail(project: any) {
  if (!project.videoTrailer?.thumbnail?.asset?._ref) {
    return { isValid: false, error: 'No thumbnail uploaded' }
  }

  const assetRef = project.videoTrailer.thumbnail.asset._ref
  
  // Basic validation
  if (!assetRef.startsWith('image-')) {
    return { isValid: false, error: 'Invalid image asset reference' }
  }

  return { isValid: true }
}

// Example 8: Batch processing multiple projects
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
