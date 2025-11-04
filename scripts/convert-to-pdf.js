#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const mkdirAsync = promisify(fs.mkdir);

/**
 * Create a user interface for input/output
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Ask a question and return the answer
 */
function question(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Main function
 */
async function main() {
  console.log('\n📄 Markdown to PDF Converter 📄\n');
  
  try {
    // Check if markdown-pdf is installed
    try {
      require('markdown-pdf');
    } catch (err) {
      console.log('The markdown-pdf package is not installed. Installing now...');
      execSync('npm install markdown-pdf --save', { stdio: 'inherit' });
      console.log('markdown-pdf installed successfully!');
    }

    let inputFile;
    let outputFile;
    
    const args = process.argv.slice(2);
    
    // If arguments are provided from command line
    if (args.length >= 1) {
      inputFile = args[0];
      outputFile = args[1];
    } else {
      // If no arguments, prompt user
      inputFile = await question('Enter the path to your markdown file: ');
      
      // Check if the file exists
      if (!fs.existsSync(inputFile)) {
        console.error(`Error: File not found at ${inputFile}`);
        rl.close();
        return;
      }
      
      // Default output file
      const inputBaseName = path.basename(inputFile, path.extname(inputFile));
      const defaultOutputFile = path.join(path.dirname(inputFile), `${inputBaseName}.pdf`);
      
      outputFile = await question(`Enter the output PDF file path (default: ${defaultOutputFile}): `);
      if (!outputFile.trim()) {
        outputFile = defaultOutputFile;
      }
    }
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputFile);
    await mkdirAsync(outputDir, { recursive: true }).catch(() => {});
    
    // Check if the input file exists
    if (!fs.existsSync(inputFile)) {
      console.error(`Error: File not found at ${inputFile}`);
      rl.close();
      return;
    }

    // Setup custom CSS if needed
    const cssFile = path.join(__dirname, 'pdf-styles.css');
    if (!fs.existsSync(cssFile)) {
      console.log('Creating default CSS stylesheet...');
      
      // Create a nice default stylesheet
      const defaultCss = `
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          font-size: 12pt;
          color: #333;
          padding: 20px;
          max-width: 100%;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.8em;
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
          page-break-inside: avoid;
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
          page-break-inside: avoid;
        }
        
        blockquote {
          margin-left: 0;
          padding: 0 1em;
          color: #6a737d;
          border-left: 0.25em solid #dfe2e5;
        }
        
        img {
          max-width: 100%;
          page-break-inside: avoid;
        }
        
        hr {
          height: 0.25em;
          padding: 0;
          margin: 24px 0;
          background-color: #e1e4e8;
          border: 0;
        }
        
        /* Cover page styles */
        .cover {
          text-align: center;
          page-break-after: always;
          margin-bottom: 60px;
        }
        
        .cover h1 {
          font-size: 32pt;
          margin-top: 30%;
          border-bottom: none;
        }
        
        /* Table of Contents styles */
        .toc {
          page-break-after: always;
        }
        
        /* Handle page breaks */
        .page-break {
          page-break-before: always;
        }
        
        /* Important sections */
        .important {
          background-color: #f8f8f8;
          border-left: 4px solid #0366d6;
          padding: 15px;
          margin: 20px 0;
        }
        
        /* Special client note */
        .client-note {
          background-color: #fffbdd;
          border: 1px solid #ffe58f;
          border-radius: 3px;
          padding: 16px;
          margin: 20px 0;
        }
      `;
      
      await writeFileAsync(cssFile, defaultCss);
      console.log(`Created default CSS stylesheet at: ${cssFile}`);
    }

    // Create header and footer script
    const runningsPath = path.join(__dirname, 'pdf-runnings.js');
    if (!fs.existsSync(runningsPath)) {
      console.log('Creating header and footer script...');
      const runningsScript = `
      exports.header = {
        height: '2cm',
        contents: function(pageNum, numPages) {
          if (pageNum === 1) return '';
          return '<div style="text-align: right; font-size: 10pt; color: #777;">MPAAI CSMP Proposal</div>';
        }
      };
      
      exports.footer = {
        height: '2cm',
        contents: function(pageNum, numPages) {
          if (pageNum === 1) return '';
          return '<div style="text-align: center; font-size: 10pt; color: #777;">Page ' + pageNum + ' of ' + numPages + '</div>';
        }
      };`;
      
      await writeFileAsync(runningsPath, runningsScript);
      console.log(`Created header and footer script at: ${runningsPath}`);
    }
    
    // Read the markdown file
    console.log(`\nReading markdown file: ${inputFile}`);
    const markdownContent = await readFileAsync(inputFile, 'utf8');
    
    // Log stats
    console.log(`File size: ${(markdownContent.length / 1024).toFixed(2)} KB`);
    console.log(`Line count: ${markdownContent.split('\n').length}`);
    
    // Fix internal links in the markdown content (Claude-specific)
    const fixedMarkdownContent = markdownContent.replace(
      /\[([^\]]+)\]\(https:\/\/claude\.ai\/chat\/[^)]+#([^)]+)\)/g,
      '[$1](#$2)'
    );

    // Get the markdown-pdf module
    const markdownPdf = require('markdown-pdf');
    
    console.log('\nConverting markdown to PDF. This may take a moment...');
    
    // Convert markdown to PDF
    markdownPdf({
      cssPath: cssFile,
      paperFormat: 'Letter',
      paperOrientation: 'portrait',
      paperBorder: '1cm',
      runningsPath: runningsPath,
      remarkable: {
        html: true,
        breaks: true,
        typographer: true
      }
    })
    .from.string(fixedMarkdownContent)
    .to(outputFile, () => {
      console.log(`\n✅ PDF successfully created at: ${outputFile}\n`);
      rl.close();
    });
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    rl.close();
  }
}

// Run the main function
main();
