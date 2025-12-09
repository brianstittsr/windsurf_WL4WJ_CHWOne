#!/usr/bin/env python3
"""
Docling PDF Text Extractor
Uses IBM's Docling library for advanced PDF text extraction with document understanding.

Usage:
    python docling-extractor.py <pdf_file_path>
    
Output:
    JSON with extracted text and metadata
    
Requirements:
    pip install docling
"""

import sys
import json
import os

def extract_with_docling(pdf_path: str) -> dict:
    """Extract text from PDF using Docling library."""
    try:
        from docling.document_converter import DocumentConverter
        
        # Initialize the converter
        converter = DocumentConverter()
        
        # Convert the document
        result = converter.convert(pdf_path)
        
        # Get the document
        doc = result.document
        
        # Extract text content
        text_content = doc.export_to_markdown()
        
        # Get metadata
        metadata = {
            "num_pages": len(doc.pages) if hasattr(doc, 'pages') else 0,
            "title": doc.name if hasattr(doc, 'name') else os.path.basename(pdf_path),
        }
        
        return {
            "success": True,
            "text": text_content,
            "metadata": metadata,
            "method": "docling"
        }
        
    except ImportError:
        return {
            "success": False,
            "error": "Docling library not installed. Run: pip install docling",
            "method": "docling"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "method": "docling"
        }

def extract_with_pymupdf(pdf_path: str) -> dict:
    """Fallback: Extract text using PyMuPDF (fitz)."""
    try:
        import fitz  # PyMuPDF
        
        doc = fitz.open(pdf_path)
        text_parts = []
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            text_parts.append(page.get_text())
        
        text_content = "\n\n".join(text_parts)
        
        return {
            "success": True,
            "text": text_content,
            "metadata": {
                "num_pages": len(doc),
                "title": os.path.basename(pdf_path)
            },
            "method": "pymupdf"
        }
        
    except ImportError:
        return {
            "success": False,
            "error": "PyMuPDF not installed. Run: pip install pymupdf",
            "method": "pymupdf"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "method": "pymupdf"
        }

def extract_with_pdfplumber(pdf_path: str) -> dict:
    """Fallback: Extract text using pdfplumber."""
    try:
        import pdfplumber
        
        text_parts = []
        num_pages = 0
        
        with pdfplumber.open(pdf_path) as pdf:
            num_pages = len(pdf.pages)
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)
        
        text_content = "\n\n".join(text_parts)
        
        return {
            "success": True,
            "text": text_content,
            "metadata": {
                "num_pages": num_pages,
                "title": os.path.basename(pdf_path)
            },
            "method": "pdfplumber"
        }
        
    except ImportError:
        return {
            "success": False,
            "error": "pdfplumber not installed. Run: pip install pdfplumber",
            "method": "pdfplumber"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "method": "pdfplumber"
        }

def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Usage: python docling-extractor.py <pdf_file_path>"
        }))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    if not os.path.exists(pdf_path):
        print(json.dumps({
            "success": False,
            "error": f"File not found: {pdf_path}"
        }))
        sys.exit(1)
    
    # Try Docling first (best quality)
    result = extract_with_docling(pdf_path)
    
    if result["success"]:
        print(json.dumps(result))
        sys.exit(0)
    
    # Fallback to PyMuPDF
    print(f"Docling failed: {result.get('error', 'Unknown error')}, trying PyMuPDF...", file=sys.stderr)
    result = extract_with_pymupdf(pdf_path)
    
    if result["success"]:
        print(json.dumps(result))
        sys.exit(0)
    
    # Fallback to pdfplumber
    print(f"PyMuPDF failed: {result.get('error', 'Unknown error')}, trying pdfplumber...", file=sys.stderr)
    result = extract_with_pdfplumber(pdf_path)
    
    print(json.dumps(result))
    sys.exit(0 if result["success"] else 1)

if __name__ == "__main__":
    main()
