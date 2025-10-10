/**
 * React Components for Image Processing
 * These components demonstrate how to use the image processing utilities
 * in React applications.
 */

import React from 'react'
import { 
  getOptimizedThumbnailUrl, 
  getResponsiveThumbnailUrls,
  getOptimizedFeaturedImageUrl,
  getResponsiveFeaturedImageUrls
} from '../plugins/simpleImageProcessing'

// Component for displaying optimized video thumbnails
export function VideoThumbnailComponent({ project }: { project: any }) {
  const thumbnailUrl = getOptimizedThumbnailUrl(project.videoTrailer?.thumbnail?.asset?._ref)
  const responsiveUrls = getResponsiveThumbnailUrls(project.videoTrailer?.thumbnail?.asset?._ref)
  
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

// Component for displaying optimized featured images
export function FeaturedImageComponent({ project }: { project: any }) {
  const featuredImageUrl = getOptimizedFeaturedImageUrl(project.image?.asset?._ref)
  const responsiveUrls = getResponsiveFeaturedImageUrls(project.image?.asset?._ref)
  
  if (!featuredImageUrl) {
    return <div>No featured image available</div>
  }

  return (
    <picture>
      {/* WebP format for modern browsers */}
      <source 
        srcSet={responsiveUrls?.large} 
        type="image/webp" 
      />
      
      {/* JPEG fallback */}
      <source 
        srcSet={featuredImageUrl} 
        type="image/jpeg" 
      />
      
      {/* Fallback img element */}
      <img 
        src={featuredImageUrl}
        alt={project.image?.alt || 'Featured image'}
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

// Component for Next.js Image optimization
export function OptimizedVideoThumbnail({ project }: { project: any }) {
  const thumbnailUrl = getOptimizedThumbnailUrl(project.videoTrailer?.thumbnail?.asset?._ref)
  
  if (!thumbnailUrl) {
    return <div>No thumbnail available</div>
  }

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

// Component for Next.js Featured Image optimization
export function OptimizedFeaturedImage({ project }: { project: any }) {
  const featuredImageUrl = getOptimizedFeaturedImageUrl(project.image?.asset?._ref)
  
  if (!featuredImageUrl) {
    return <div>No featured image available</div>
  }

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
      <img
        src={featuredImageUrl}
        alt={project.image?.alt || 'Featured image'}
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
