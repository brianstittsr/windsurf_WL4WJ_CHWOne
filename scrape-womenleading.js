const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function scrapeWebsite() {
  try {
    // Create the womenleading directory if it doesn't exist
    const womenLeadingDir = path.join(__dirname, 'womenleading');
    if (!fs.existsSync(womenLeadingDir)) {
      fs.mkdirSync(womenLeadingDir);
    }

    // Fetch the homepage content
    const response = await axios.get('https://www.womenleading.org');
    const $ = cheerio.load(response.data);

    // Save the homepage HTML
    const pagesDir = path.join(womenLeadingDir, 'pages');
    if (!fs.existsSync(pagesDir)) {
      fs.mkdirSync(pagesDir);
    }
    fs.writeFileSync(path.join(pagesDir, 'index.html'), response.data);

    console.log('Homepage content saved successfully!');
  } catch (error) {
    console.error('Error scraping the website:', error);
  }
}

scrapeWebsite();