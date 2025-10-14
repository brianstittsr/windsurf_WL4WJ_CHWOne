# Image Optimization Guide for Carousel

## Converting Pexels Images to WebP Format

WebP images offer superior compression compared to JPEG and PNG while maintaining good quality. This results in faster loading times and better performance.

### Option 1: Online Conversion Tools

1. Download the original images from Pexels using the links in `pexels-image-urls.txt`
2. Use an online converter like [Convertio](https://convertio.co/jpg-webp/) or [Ezgif](https://ezgif.com/jpg-to-webp)
3. Upload each image and convert it to WebP format
4. Download the converted WebP images
5. Save them to the following paths:

```
public/images/carousel/community-health-workers.webp
public/images/carousel/project-management.webp
public/images/carousel/grant-management.webp
public/images/carousel/data-analytics.webp
public/images/carousel/resource-sharing.webp
```

### Option 2: Using Sharp (Node.js)

For bulk conversion, you can use the Sharp library:

1. Install Sharp: `npm install sharp`
2. Create a script in the project root called `convert-images.js`:

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'downloaded-images');
const targetDir = path.join(__dirname, 'public', 'images', 'carousel');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// List of images to convert
const images = [
  { 
    source: 'community-health-workers.jpg', 
    target: 'community-health-workers.webp' 
  },
  { 
    source: 'project-management.jpg', 
    target: 'project-management.webp' 
  },
  { 
    source: 'grant-management.jpg', 
    target: 'grant-management.webp' 
  },
  { 
    source: 'data-analytics.jpg', 
    target: 'data-analytics.webp' 
  },
  { 
    source: 'resource-sharing.jpg', 
    target: 'resource-sharing.webp' 
  }
];

// Convert each image
images.forEach(image => {
  const sourcePath = path.join(sourceDir, image.source);
  const targetPath = path.join(targetDir, image.target);
  
  sharp(sourcePath)
    .webp({ quality: 80 }) // Adjust quality as needed (80 is a good balance)
    .resize(1920, 1080, { fit: 'cover' }) // Resize to standard size
    .toFile(targetPath)
    .then(() => console.log(`Converted ${image.source} to ${image.target}`))
    .catch(err => console.error(`Error converting ${image.source}:`, err));
});
```

3. Create a `downloaded-images` folder in your project root
4. Download the original images from Pexels and place them in this folder
5. Run the script: `node convert-images.js`

### Option 3: Using ImageMagick

If you have ImageMagick installed:

```bash
magick convert community-health-workers.jpg -quality 80 -resize 1920x1080 community-health-workers.webp
magick convert project-management.jpg -quality 80 -resize 1920x1080 project-management.webp
magick convert grant-management.jpg -quality 80 -resize 1920x1080 grant-management.webp
magick convert data-analytics.jpg -quality 80 -resize 1920x1080 data-analytics.webp
magick convert resource-sharing.jpg -quality 80 -resize 1920x1080 resource-sharing.webp
```

## Optimization Tips

1. **Resize images** to the appropriate dimensions (1920x1080 is good for full-width carousel)
2. **Compress images** with a quality setting of 75-85% for a good balance of quality and file size
3. **Use progressive loading** (already implemented with the `priority` attribute for the first image)
4. **Specify image dimensions** with the `sizes` attribute to help the browser allocate space
5. **Lazy load non-critical images** (Next.js Image component does this automatically)

## Additional Performance Improvements

1. **Preload critical images** by adding this to your `_document.js` or `layout.tsx`:
   ```html
   <link rel="preload" as="image" href="/images/carousel/community-health-workers.webp" />
   ```

2. **Add responsive sizes** to load smaller images on mobile devices:
   ```jsx
   <Image
     src={item.imageUrl}
     alt={item.imageAlt}
     fill
     sizes="(max-width: 768px) 100vw, 1920px"
     priority={index === 0}
     // ...
   />
   ```

3. **Consider using blur placeholders** for a better loading experience:
   ```jsx
   <Image
     src={item.imageUrl}
     alt={item.imageAlt}
     fill
     placeholder="blur"
     blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDhMDgAAAAAAAAAAABBTT0YgAAAAAAAAAAAcVVBYKAAAAAAAAAAAAHNwTlQAAAABAAAAEHN0Q28AAAABAAAAKGJ0YXQAAAABAAAAKGNoYWQAAAABAAAAKG1ldGEAAAABAAAAKHJsY28AAAABAAAAKHBkZmEAAAABAAAAKGFsbmYAAAAoAAAAKGlsbG8AAAAoAAAAKAD/AQBkX3YBAGRfaAEAZF9xAQBkX3QBAGRfdwEAZF9jAQBkX2YBAGRfYQEAZF9uAQBkX2kBAGRfbAEAZF9vAQBkX3MBAGRfegEAZF9lAQBkX2QBAGRfcgEAZF9wAQBkX20BAGRfYgEAZF9nAQBkX3kBAGRfawEAZF9qAQBkX3gBAGRfdQEAZF9sAQBkX2gBAGRfZQEAZF9yAQBkX2UBAGRfLgEAZF9jAQBkX28BAGRfbQEAZF8="
     // ...
   />
   ```
