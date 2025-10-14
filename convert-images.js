const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Create directories if they don't exist
const downloadDir = path.join(__dirname, 'downloaded-images');
const targetDir = path.join(__dirname, 'public', 'images', 'carousel');

if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// List of Pexels images to download and convert
const images = [
  {
    url: 'https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&cs=tinysrgb&w=1600',
    filename: 'community-health-workers'
  },
  {
    url: 'https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg?auto=compress&cs=tinysrgb&w=1600',
    filename: 'project-management'
  },
  {
    url: 'https://images.pexels.com/photos/3860809/pexels-photo-3860809.jpeg?auto=compress&cs=tinysrgb&w=1600',
    filename: 'grant-management'
  },
  {
    url: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=1600',
    filename: 'data-analytics'
  },
  {
    url: 'https://images.pexels.com/photos/1560932/pexels-photo-1560932.jpeg?auto=compress&cs=tinysrgb&w=1600',
    filename: 'resource-sharing'
  }
];

// Function to download an image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded: ${filepath}`);
        resolve(filepath);
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete the file if there's an error
        reject(err);
      });
    }).on('error', reject);
  });
}

// Function to convert image to WebP
function convertToWebP(inputPath, outputPath) {
  return sharp(inputPath)
    .webp({ quality: 80 }) // 80% quality - good balance between quality and file size
    .resize(1920, 1080, { fit: 'cover' }) // Resize to standard size for carousel
    .toFile(outputPath);
}

// Process each image
async function processImages() {
  for (const image of images) {
    const downloadPath = path.join(downloadDir, `${image.filename}.jpg`);
    const webpPath = path.join(targetDir, `${image.filename}.webp`);

    try {
      // Download the image
      await downloadImage(image.url, downloadPath);
      
      // Convert to WebP
      await convertToWebP(downloadPath, webpPath);
      console.log(`Converted to WebP: ${webpPath}`);
    } catch (error) {
      console.error(`Error processing ${image.filename}:`, error);
    }
  }
}

// Run the script
console.log('Starting image download and conversion...');
processImages()
  .then(() => console.log('All images processed successfully!'))
  .catch(err => console.error('Error processing images:', err));
