"""
PDF Parser for Textbook Materials
Parses PDF files to extract text, images, and generate comprehensive metadata.

Requirements:
    pip install PyMuPDF Pillow nltk --break-system-packages
"""

import fitz  # PyMuPDF
import json
import re
from pathlib import Path
from collections import Counter
from typing import Dict, List, Tuple
import base64
from PIL import Image
import io


class PDFParser:
    def __init__(self, pdf_path: str, output_dir: str = None):
        """
        Initialize PDF Parser.
        
        Args:
            pdf_path: Path to the PDF file
            output_dir: Directory to save outputs (default: same as PDF)
        """
        self.pdf_path = Path(pdf_path)
        if not self.pdf_path.exists():
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")
        
        if output_dir:
            self.output_dir = Path(output_dir)
        else:
            self.output_dir = self.pdf_path.parent / f"{self.pdf_path.stem}_parsed"
        
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.doc = fitz.open(str(self.pdf_path))
        
    def extract_text_from_page(self, page) -> str:
        """Extract text from a PDF page."""
        return page.get_text()
    
    def extract_images_from_page(self, page, page_num: int) -> List[Dict]:
        """
        Extract images from a PDF page.
        
        Returns:
            List of dictionaries containing image information
        """
        images = []
        image_list = page.get_images(full=True)
        
        for img_index, img in enumerate(image_list):
            xref = img[0]
            try:
                base_image = self.doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                
                # Save image to file
                image_filename = f"page_{page_num + 1:04d}_image_{img_index + 1:02d}.{image_ext}"
                image_path = self.output_dir / "images" / image_filename
                image_path.parent.mkdir(parents=True, exist_ok=True)
                
                with open(image_path, "wb") as img_file:
                    img_file.write(image_bytes)
                
                # Get image dimensions
                img_obj = Image.open(io.BytesIO(image_bytes))
                width, height = img_obj.size
                
                images.append({
                    "image_index": img_index + 1,
                    "filename": image_filename,
                    "path": str(image_path.relative_to(self.output_dir)),
                    "format": image_ext,
                    "width": width,
                    "height": height,
                    "size_bytes": len(image_bytes)
                })
            except Exception as e:
                print(f"Warning: Could not extract image {img_index} from page {page_num + 1}: {e}")
                continue
        
        return images
    
    def tokenize_text(self, text: str) -> List[str]:
        """
        Tokenize text into words.
        Simple tokenization by splitting on whitespace and punctuation.
        """
        # Convert to lowercase and split
        tokens = re.findall(r'\b\w+\b', text.lower())
        return tokens
    
    def get_word_pairs(self, tokens: List[str]) -> List[Tuple[str, str]]:
        """Get consecutive word pairs (bigrams) from tokens."""
        pairs = []
        for i in range(len(tokens) - 1):
            pairs.append((tokens[i], tokens[i + 1]))
        return pairs
    
    def get_top_word_pairs(self, text: str, top_n: int = 15) -> List[Dict]:
        """
        Get the most common word pairs from text.
        
        Returns:
            List of dictionaries with word pairs and their counts
        """
        tokens = self.tokenize_text(text)
        if len(tokens) < 2:
            return []
        
        pairs = self.get_word_pairs(tokens)
        pair_counts = Counter(pairs)
        
        top_pairs = pair_counts.most_common(top_n)
        return [
            {
                "pair": f"{pair[0]} {pair[1]}",
                "word1": pair[0],
                "word2": pair[1],
                "count": count
            }
            for pair, count in top_pairs
        ]
    
    def count_words_and_nonwords(self, text: str) -> Tuple[int, int]:
        """
        Count words and non-word entries in text.
        
        Returns:
            Tuple of (word_count, non_word_count)
        """
        # Words: alphanumeric sequences
        words = re.findall(r'\b\w+\b', text)
        word_count = len(words)
        
        # Non-words: punctuation, symbols, etc.
        # Remove all words and whitespace, count what remains
        text_without_words = re.sub(r'\b\w+\b', '', text)
        text_without_whitespace = re.sub(r'\s+', '', text_without_words)
        non_word_count = len(text_without_whitespace)
        
        return word_count, non_word_count
    
    def parse_page(self, page_num: int) -> Dict:
        """
        Parse a single page and return its data.
        
        Returns:
            Dictionary containing page text, images, and metadata
        """
        page = self.doc[page_num]
        
        # Extract text
        text = self.extract_text_from_page(page)
        
        # Extract images
        images = self.extract_images_from_page(page, page_num)
        
        # Generate metadata
        word_count, non_word_count = self.count_words_and_nonwords(text)
        top_word_pairs = self.get_top_word_pairs(text)
        
        page_data = {
            "page_number": page_num + 1,
            "text": text,
            "text_length": len(text),
            "word_count": word_count,
            "non_word_count": non_word_count,
            "image_count": len(images),
            "images": images,
            "top_word_pairs": top_word_pairs
        }
        
        return page_data
    
    def parse_pdf(self):
        """
        Parse the entire PDF and generate all output files.
        
        Generates:
            1. Combined text and images file
            2. Pure text file
            3. Pure images (saved separately)
            4. Metadata JSON file
        """
        print(f"Parsing PDF: {self.pdf_path.name}")
        print(f"Total pages: {len(self.doc)}")
        print(f"Output directory: {self.output_dir}")
        
        all_pages_data = []
        all_text = []
        combined_content = []
        
        for page_num in range(len(self.doc)):
            print(f"Processing page {page_num + 1}/{len(self.doc)}...", end='\r')
            
            page_data = self.parse_page(page_num)
            all_pages_data.append(page_data)
            
            # Collect text
            all_text.append(page_data["text"])
            
            # Create combined content (text + image references)
            combined_page = f"\n{'='*80}\nPAGE {page_num + 1}\n{'='*80}\n\n"
            combined_page += page_data["text"]
            
            if page_data["images"]:
                combined_page += f"\n\n[Images on this page: {page_data['image_count']}]\n"
                for img in page_data["images"]:
                    combined_page += f"  - {img['filename']} ({img['format']}, {img['width']}x{img['height']})\n"
            
            combined_content.append(combined_page)
        
        print(f"\nProcessing complete!")
        
        # Save combined text and images file
        combined_file = self.output_dir / f"{self.pdf_path.stem}_combined.txt"
        with open(combined_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(combined_content))
        print(f"✓ Saved combined file: {combined_file.name}")
        
        # Save pure text file
        text_file = self.output_dir / f"{self.pdf_path.stem}_text_only.txt"
        with open(text_file, 'w', encoding='utf-8') as f:
            f.write('\n\n'.join(all_text))
        print(f"✓ Saved text-only file: {text_file.name}")
        
        # Save metadata JSON
        metadata = {
            "source_pdf": str(self.pdf_path.name),
            "total_pages": len(self.doc),
            "total_images": sum(page["image_count"] for page in all_pages_data),
            "total_words": sum(page["word_count"] for page in all_pages_data),
            "total_non_words": sum(page["non_word_count"] for page in all_pages_data),
            "pages": all_pages_data
        }
        
        metadata_file = self.output_dir / f"{self.pdf_path.stem}_metadata.json"
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        print(f"✓ Saved metadata file: {metadata_file.name}")
        
        # Summary
        print(f"\n{'='*80}")
        print("PARSING SUMMARY")
        print(f"{'='*80}")
        print(f"Total pages processed: {len(self.doc)}")
        print(f"Total images extracted: {metadata['total_images']}")
        print(f"Total words: {metadata['total_words']:,}")
        print(f"Total non-word characters: {metadata['total_non_words']:,}")
        print(f"Output directory: {self.output_dir}")
        print(f"{'='*80}")
        
        self.doc.close()
        
        return metadata


def main():
    """Main function to run the PDF parser."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Parse PDF textbook and extract text, images, and metadata')
    parser.add_argument('pdf_path', help='Path to the PDF file')
    parser.add_argument('--output-dir', '-o', help='Output directory (default: same as PDF)', default=None)
    
    args = parser.parse_args()
    
    try:
        pdf_parser = PDFParser(args.pdf_path, args.output_dir)
        pdf_parser.parse_pdf()
    except Exception as e:
        print(f"Error: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())