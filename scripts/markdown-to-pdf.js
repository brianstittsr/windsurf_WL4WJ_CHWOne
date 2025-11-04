const fs = require('fs');
const path = require('path');
const markdownpdf = require('markdown-pdf');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const mkdirAsync = promisify(fs.mkdir);

/**
 * Convert Markdown to PDF
 * @param {string} markdownContent - The markdown content to convert
 * @param {string} outputPath - The output path for the PDF file
 * @param {Object} options - Options for PDF generation
 * @returns {Promise<string>} - Path to the generated PDF
 */
async function convertMarkdownToPdf(markdownContent, outputPath, options = {}) {
  try {
    // Ensure the output directory exists
    const outputDir = path.dirname(outputPath);
    await mkdirAsync(outputDir, { recursive: true }).catch(() => {});
    
    // Create a temporary markdown file
    const tempMarkdownPath = path.join(outputDir, `temp-${Date.now()}.md`);
    await writeFileAsync(tempMarkdownPath, markdownContent, 'utf8');
    
    // Set default options
    const defaultOptions = {
      cssPath: options.cssPath || path.join(__dirname, 'pdf-styles.css'),
      paperFormat: options.paperFormat || 'Letter',
      paperOrientation: options.paperOrientation || 'portrait',
      paperBorder: options.paperBorder || '1cm',
      runningsPath: options.runningsPath,
      highlightCssPath: options.highlightCssPath,
      remarkable: options.remarkable
    };

    // Convert markdown to PDF
    return new Promise((resolve, reject) => {
      console.log(`Converting markdown to PDF: ${outputPath}`);
      const pdfStream = markdownpdf(defaultOptions)
        .from(tempMarkdownPath)
        .to(outputPath, () => {
          // Clean up temporary file
          fs.unlink(tempMarkdownPath, (err) => {
            if (err) console.error(`Error deleting temporary file: ${err.message}`);
            console.log(`PDF generated successfully: ${outputPath}`);
            resolve(outputPath);
          });
        });
      
      pdfStream.on('error', (err) => {
        fs.unlink(tempMarkdownPath, () => {
          reject(err);
        });
      });
    });
  } catch (err) {
    throw new Error(`Error converting markdown to PDF: ${err.message}`);
  }
}

/**
 * Main function to run from command line
 */
async function main() {
  try {
    // Check if input file is provided
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
      console.log('Usage: node markdown-to-pdf.js <markdown-file-or-content> [output-pdf-path]');
      console.log('If markdown content is provided directly, it must be the first argument and enclosed in quotes');
      return;
    }
    
    let markdownContent;
    let outputPath;
    
    // Check if first arg is a file path
    if (fs.existsSync(args[0])) {
      markdownContent = await readFileAsync(args[0], 'utf8');
      outputPath = args[1] || path.join(process.cwd(), `output-${Date.now()}.pdf`);
    } else {
      // Assume the first argument is the markdown content directly
      markdownContent = args[0];
      outputPath = args[1] || path.join(process.cwd(), `output-${Date.now()}.pdf`);
    }
    
    // Create default CSS if it doesn't exist
    const defaultCssPath = path.join(__dirname, 'pdf-styles.css');
    if (!fs.existsSync(defaultCssPath)) {
      const defaultCss = `
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          font-size: 12pt;
          color: #333;
          padding: 20px;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-weight: 600;
          margin-top: 24px;
          margin-bottom: 16px;
          color: #222;
        }
        
        h1 {
          font-size: 24pt;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        
        h2 {
          font-size: 20pt;
          border-bottom: 1px solid #eee;
          padding-bottom: 8px;
        }
        
        h3 {
          font-size: 18pt;
        }
        
        h4 {
          font-size: 16pt;
        }
        
        h5, h6 {
          font-size: 14pt;
        }
        
        p, ul, ol, table {
          margin-bottom: 16px;
        }
        
        ul, ol {
          padding-left: 2em;
        }
        
        a {
          color: #0366d6;
          text-decoration: none;
        }
        
        table {
          border-collapse: collapse;
          width: 100%;
          margin-top: 16px;
          margin-bottom: 16px;
        }
        
        table, th, td {
          border: 1px solid #ddd;
        }
        
        th, td {
          padding: 8px;
          text-align: left;
        }
        
        th {
          background-color: #f2f2f2;
          font-weight: 600;
        }
        
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        code {
          font-family: 'Courier New', monospace;
          padding: 0.2em 0.4em;
          background-color: #f6f8fa;
          border-radius: 3px;
        }
        
        pre {
          background-color: #f6f8fa;
          border-radius: 3px;
          padding: 16px;
          overflow: auto;
        }
        
        blockquote {
          margin-left: 0;
          padding: 0 1em;
          color: #6a737d;
          border-left: 0.25em solid #dfe2e5;
        }
        
        img {
          max-width: 100%;
        }
        
        hr {
          height: 0.25em;
          padding: 0;
          margin: 24px 0;
          background-color: #e1e4e8;
          border: 0;
        }
        
        /* Custom styles for the document */
        .executive-summary {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        
        .highlight {
          background-color: #fffbdd;
          padding: 2px;
        }
      `;
      await writeFileAsync(defaultCssPath, defaultCss, 'utf8');
      console.log(`Created default CSS at: ${defaultCssPath}`);
    }
    
    // Convert markdown to PDF
    await convertMarkdownToPdf(markdownContent, outputPath);
    
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// If this script is run directly
if (require.main === module) {
  main();
} else {
  // If this script is required as a module
  module.exports = { convertMarkdownToPdf };
}
