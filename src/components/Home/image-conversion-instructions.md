# Converting Pexels Images to WebP Format

Follow these steps to convert the Pexels images to optimized WebP format for faster loading:

## Option 1: Using the Provided Script (Recommended)

1. Install Sharp (if not already installed):
   ```bash
   npm install sharp
   ```

2. Run the conversion script:
   ```bash
   node convert-images.js
   ```

3. The script will:
   - Download the original images from Pexels
   - Convert them to WebP format with optimal compression
   - Resize them to 1920x1080 for better performance
   - Save them to the correct location in your project

## Option 2: Manual Conversion

If you prefer to convert the images manually:

1. Download the images from the Pexels URLs in `pexels-image-urls.txt`
2. Use an online converter like [Convertio](https://convertio.co/jpg-webp/) or [Ezgif](https://ezgif.com/jpg-to-webp)
3. Set the quality to around 80% for a good balance of quality and file size
4. Save the converted WebP images to:
   ```
   public/images/carousel/community-health-workers.webp
   public/images/carousel/project-management.webp
   public/images/carousel/grant-management.webp
   public/images/carousel/data-analytics.webp
   public/images/carousel/resource-sharing.webp
   ```

## Performance Benefits of WebP

- **Smaller file sizes**: WebP images are typically 25-35% smaller than JPEG images at equivalent visual quality
- **Faster loading times**: Smaller file sizes mean faster page loads and better user experience
- **Better SEO**: Page speed is a ranking factor for search engines
- **Lower bandwidth usage**: Especially important for mobile users

## Additional Optimizations

The carousel component has been updated with these performance optimizations:

1. **Priority loading** for the first image (`priority={index === 0}`)
2. **Responsive sizing** with the `sizes` attribute
3. **Proper image dimensions** to avoid layout shifts
4. **Smooth animations** that don't interfere with loading performance

These optimizations should significantly improve the loading speed of the carousel.
