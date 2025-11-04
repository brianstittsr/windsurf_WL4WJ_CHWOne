# Markdown to PDF Converter

This utility converts Markdown files to nicely formatted PDF documents with customizable headers, footers, and styling.

## Usage

### Basic Usage (Interactive)

```bash
npm run pdf
```

When run without arguments, the script will prompt you for input and output file paths.

### Command-line Usage

```bash
npm run pdf -- path/to/markdown-file.md [path/to/output.pdf]
```

If the output path is not specified, it will create a PDF with the same name as the input file in the same directory.

### Features

- Converts Markdown to well-formatted PDF
- Custom styling for professional documents
- Headers and footers with page numbers
- Table of contents support
- Code highlighting
- Proper handling of tables and images
- Page break control

## Customization

### CSS Styling

You can customize the PDF styling by editing the `scripts/pdf-styles.css` file.

### Headers and Footers

Headers and footers can be customized by editing the `scripts/pdf-runnings.js` file.

## Dependencies

This tool uses the following libraries:
- `markdown-pdf` - Core conversion from Markdown to PDF
- `phantom-js` - PDF rendering (installed automatically)

## Examples

### Convert a proposal document

```bash
npm run pdf -- docs/proposal.md docs/proposal.pdf
```

### Interactive mode

```bash
npm run pdf
# Then follow the prompts
```
