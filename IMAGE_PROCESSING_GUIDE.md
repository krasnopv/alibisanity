# Image Processing Guide for Alibi Sanity Studio

This guide explains how image preprocessing and resizing works for both the featured image and video thumbnail fields in the project schema.

## Overview

Both the featured image and video thumbnail fields now include image processing capabilities that:

1. **Optimize images** for web display using Sanity's CDN
2. **Resize images** to optimal dimensions (featured: 1200x675px, thumbnails: 800x450px)
3. **Provide multiple formats** (WebP, JPEG, PNG)
4. **Generate responsive image URLs** for different screen sizes

## How It Works

### 1. Automatic Processing

When you upload an image to the `videoTrailer.thumbnail` field:

- The image is stored in Sanity's asset system
- Sanity's CDN automatically processes images when requested with parameters
- Original quality is preserved while creating web-optimized versions on-demand

### 2. Image URL Generation

Use the provided utility functions to generate optimized image URLs:

```typescript
import { 
  getOptimizedThumbnailUrl, 
  getResponsiveThumbnailUrls,
  getOptimizedFeaturedImageUrl,
  getResponsiveFeaturedImageUrls 
} from './plugins/simpleImageProcessing'

// Get optimized thumbnail (800x450px)
const thumbnailUrl = getOptimizedThumbnailUrl(assetRef, {
  width: 800,
  height: 450,
  quality: 85,
  format: 'webp'
})

// Get optimized featured image (1200x675px)
const featuredImageUrl = getOptimizedFeaturedImageUrl(assetRef, {
  width: 1200,
  height: 675,
  quality: 90,
  format: 'webp'
})

// Get responsive images for different screen sizes
const responsiveThumbnails = getResponsiveThumbnailUrls(assetRef)
const responsiveFeatured = getResponsiveFeaturedImageUrls(assetRef)
// Returns: { small, medium, large, original } for thumbnails
// Returns: { small, medium, large, hero, original } for featured images
```

### 3. Recommended Image Specifications

**For Video Thumbnails:**
- **Aspect Ratio**: 16:9 (800x450px)
- **Format**: WebP (with JPEG fallback)
- **Quality**: 85% for optimal file size/quality balance
- **File Size**: Under 200KB for fast loading

**For Featured Images:**
- **Aspect Ratio**: 16:9 (1200x675px)
- **Format**: WebP (with JPEG fallback)
- **Quality**: 90% for higher quality display
- **File Size**: Under 500KB for fast loading

## Usage Examples

### In Your Frontend Application

```typescript
// Fetch project with optimized thumbnail
const project = await client.fetch(`
  *[_type == "project" && _id == $id][0] {
    title,
    videoTrailer {
      type,
      url,
      thumbnail {
        asset,
        alt
      }
    }
  }
`, { id: projectId })

// Generate optimized image URL
const thumbnailUrl = getOptimizedThumbnailUrl(project.videoTrailer.thumbnail.asset._ref)
```

### In Sanity Studio

The thumbnail field now includes:

- **Automatic validation** for image dimensions
- **Helpful descriptions** for optimal sizing
- **Alt text and caption** fields for accessibility
- **Preview of optimized image** in the studio

## Image Processing Presets

The system includes several presets for different use cases:

```typescript
import { processImageForUseCase } from './plugins/imageProcessingUtils'

// Thumbnail (400x225px)
const thumbnail = processImageForUseCase(assetRef, 'thumbnail')

// Hero image (1200x675px)
const hero = processImageForUseCase(assetRef, 'hero')

// Gallery image (800x600px)
const gallery = processImageForUseCase(assetRef, 'gallery')
```

## Best Practices

### 1. Image Upload
- Upload high-quality source images (at least 1200px wide)
- Use 16:9 aspect ratio for video thumbnails
- Include descriptive alt text for accessibility

### 2. Performance Optimization
- Use WebP format when possible (automatic fallback to JPEG)
- Leverage responsive images for different screen sizes
- Consider lazy loading for gallery images

### 3. SEO and Accessibility
- Always provide alt text for images
- Use descriptive captions when appropriate
- Ensure images are optimized for fast loading

## Technical Implementation

The image processing is handled by:

1. **Sanity CDN**: Automatic image optimization and resizing
2. **Custom Utilities**: TypeScript functions for URL generation
3. **Schema Validation**: Built-in validation for image requirements
4. **Plugin System**: Extensible architecture for custom processing

## Troubleshooting

### Common Issues

1. **Images not resizing**: Check that the asset reference is correct
2. **Poor quality**: Increase the quality parameter (default: 85)
3. **Wrong aspect ratio**: Upload images with 16:9 aspect ratio
4. **Large file sizes**: Use WebP format and appropriate quality settings

### Debug Mode

Enable debug logging by setting `SANITY_DEBUG=true` in your environment variables.

## Future Enhancements

Planned improvements include:

- **Automatic aspect ratio detection**
- **Batch image processing**
- **Advanced compression algorithms**
- **Integration with external image services**

## Support

For issues or questions about image processing:

1. Check the Sanity documentation for image optimization
2. Review the utility functions in `plugins/imageProcessingUtils.ts`
3. Test with different image formats and sizes
4. Monitor performance with browser dev tools
