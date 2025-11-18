"""
Text Tokenization and Chunking with Lemmatization
Processes textbook content for RAG system with advanced preprocessing.

Requirements:
    pip install spacy --break-system-packages
    python -m spacy download en_core_web_sm
"""

import json
import re
from pathlib import Path
from typing import List, Dict, Tuple, Optional, Set
import spacy
from collections import defaultdict
from research_terminology import is_research_term, RESEARCH_TERMINOLOGY


class TextTokenizer:
    def __init__(self, combined_txt_path: str, metadata_json_path: str, output_dir: str = None):
        """
        Initialize Text Tokenizer.
        
        Args:
            combined_txt_path: Path to combined text file from PDF parser
            metadata_json_path: Path to metadata JSON from PDF parser
            output_dir: Directory to save outputs
        """
        self.combined_txt_path = Path(combined_txt_path)
        self.metadata_json_path = Path(metadata_json_path)
        
        if not self.combined_txt_path.exists():
            raise FileNotFoundError(f"Combined text file not found: {combined_txt_path}")
        if not self.metadata_json_path.exists():
            raise FileNotFoundError(f"Metadata JSON file not found: {metadata_json_path}")
        
        if output_dir:
            self.output_dir = Path(output_dir)
        else:
            self.output_dir = self.combined_txt_path.parent / "tokenized"
        
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Load spaCy model for lemmatization
        print("Loading spaCy model...")
        self.nlp = spacy.load("en_core_web_sm")
        
        # Load metadata
        with open(self.metadata_json_path, 'r', encoding='utf-8') as f:
            self.metadata = json.load(f)
        
        print(f"Loaded metadata for {len(self.metadata['pages'])} pages")
    
    def normalize_numbers(self, text: str) -> str:
        """
        Normalize standalone numbers to <NUM> token.
        Preserves numbers in terminology like 't-test', 'COVID-19'.
        """
        # First, protect terms with numbers
        protected_terms = []
        for term in RESEARCH_TERMINOLOGY:
            if any(char.isdigit() for char in term):
                # Store position and term
                for match in re.finditer(re.escape(term), text, re.IGNORECASE):
                    protected_terms.append((match.start(), match.end(), match.group()))
        
        # Sort by position
        protected_terms.sort(key=lambda x: x[0])
        
        # Build new text, replacing numbers but not in protected ranges
        result = []
        last_end = 0
        
        for start, end, term in protected_terms:
            # Process text before protected term
            before_text = text[last_end:start]
            # Replace standalone numbers
            before_text = re.sub(r'\b\d+\.?\d*\b', '<NUM>', before_text)
            result.append(before_text)
            result.append(term)
            last_end = end
        
        # Process remaining text
        remaining = text[last_end:]
        remaining = re.sub(r'\b\d+\.?\d*\b', '<NUM>', remaining)
        result.append(remaining)
        
        return ''.join(result)
    
    def lemmatize_text(self, text: str) -> List[Dict]:
        """
        Lemmatize text and return tokens with both original and lemmatized forms.
        Preserves case and tracks original form.
        
        Returns:
            List of dicts with 'original', 'lemma', 'pos', 'is_punct'
        """
        # Normalize numbers first
        text_normalized = self.normalize_numbers(text)
        
        doc = self.nlp(text_normalized)
        tokens = []
        
        for token in doc:
            # Skip whitespace-only tokens
            if token.text.strip():
                tokens.append({
                    'original': token.text,
                    'lemma': token.lemma_,
                    'pos': token.pos_,
                    'is_punct': token.is_punct,
                    'is_space': token.is_space
                })
        
        return tokens
    
    def remove_punctuation_except_expressive(self, tokens: List[Dict]) -> List[str]:
        """
        Remove punctuation except ? and !
        Returns list of processed tokens (lemmas).
        """
        processed = []
        for token in tokens:
            # Keep ? and !
            if token['original'] in ['?', '!']:
                processed.append(token['original'])
            # Skip other punctuation
            elif token['is_punct']:
                continue
            # Keep words (use lemma)
            else:
                processed.append(token['lemma'])
        
        return processed
    
    def extract_sentences_by_punctuation(self, text: str, punct: str) -> List[str]:
        """
        Extract sentences ending with specific punctuation (? or !).
        Backtracks to previous sentence boundary.
        """
        sentences = []
        # Split by sentence boundaries
        sentence_endings = re.split(r'([.!?])', text)
        
        current_sentence = ""
        for i, part in enumerate(sentence_endings):
            if part in ['.', '!', '?']:
                current_sentence += part
                if part == punct:
                    # This sentence ends with our target punctuation
                    sentences.append(current_sentence.strip())
                current_sentence = ""
            else:
                current_sentence += part
        
        return sentences
    
    def extract_links(self, text: str) -> List[str]:
        """Extract URLs and DOIs from text."""
        links = []
        
        # URLs
        url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
        urls = re.findall(url_pattern, text)
        links.extend(urls)
        
        # www links
        www_pattern = r'www\.[^\s<>"{}|\\^`\[\]]+'
        www_links = re.findall(www_pattern, text)
        links.extend(www_links)
        
        # DOIs
        doi_pattern = r'doi:\s*10\.\d{4,}/[^\s]+'
        dois = re.findall(doi_pattern, text, re.IGNORECASE)
        links.extend(dois)
        
        # DOI URLs
        doi_url_pattern = r'https?://doi\.org/10\.\d{4,}/[^\s]+'
        doi_urls = re.findall(doi_url_pattern, text)
        links.extend(doi_urls)
        
        return list(set(links))  # Remove duplicates
    
    def extract_uppercase_non_initial(self, text: str) -> List[str]:
        """
        Extract capitalized words that are:
        1. NOT at beginning of sentence (after . ? !)
        2. NOT in research terminology
        3. Capitalized (first letter uppercase)
        """
        uppercase_words = []
        
        # Split into sentences
        sentences = re.split(r'[.!?]+', text)
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
            
            words = sentence.split()
            # Skip first word (sentence start)
            for word in words[1:]:
                # Clean word of punctuation for checking
                clean_word = re.sub(r'[^\w\-]', '', word)
                
                # Check if capitalized (first letter uppercase, not all caps unless it's an acronym)
                if clean_word and clean_word[0].isupper():
                    # Not in terminology
                    if not is_research_term(clean_word):
                        uppercase_words.append(word)
        
        return uppercase_words
    
    def find_research_terms(self, tokens: List[str]) -> List[str]:
        """Find research terminology in token list."""
        found_terms = []
        
        # Check individual tokens
        for token in tokens:
            if is_research_term(token):
                found_terms.append(token)
        
        # Check multi-word terms (bigrams, trigrams)
        text = ' '.join(tokens)
        for term in RESEARCH_TERMINOLOGY:
            if ' ' in term or '-' in term:  # Multi-word or hyphenated terms
                if re.search(r'\b' + re.escape(term) + r'\b', text, re.IGNORECASE):
                    found_terms.append(term)
        
        return list(set(found_terms))
    
    def create_chunks(self, tokens: List[str], chunk_size: int = 200) -> List[List[str]]:
        """Split tokens into fixed-size chunks."""
        chunks = []
        for i in range(0, len(tokens), chunk_size):
            chunk = tokens[i:i + chunk_size]
            chunks.append(chunk)
        return chunks
    
    def extract_chunk_metadata(self, original_text: str, chunk_tokens: List[str]) -> Dict:
        """
        Extract metadata for a chunk based on original text.
        """
        # Reconstruct approximate text for this chunk (for searching in original)
        chunk_text_approx = ' '.join(chunk_tokens)
        
        # Extract questions and exclamations from original text
        questions = self.extract_sentences_by_punctuation(original_text, '?')
        exclamations = self.extract_sentences_by_punctuation(original_text, '!')
        
        # Filter to only include those that appear in chunk
        # This is approximate - we check if key words from sentence appear in chunk
        chunk_questions = []
        for q in questions:
            q_words = set(re.findall(r'\b\w+\b', q.lower()))
            chunk_words = set(w.lower() for w in chunk_tokens if w not in ['?', '!'])
            # If significant overlap, include it
            if len(q_words & chunk_words) >= min(3, len(q_words) * 0.5):
                chunk_questions.append(q)
        
        chunk_exclamations = []
        for e in exclamations:
            e_words = set(re.findall(r'\b\w+\b', e.lower()))
            chunk_words = set(w.lower() for w in chunk_tokens if w not in ['?', '!'])
            if len(e_words & chunk_words) >= min(3, len(e_words) * 0.5):
                chunk_exclamations.append(e)
        
        # Extract uppercase words
        uppercase_words = self.extract_uppercase_non_initial(original_text)
        
        # Find research terms in chunk tokens
        research_terms = self.find_research_terms(chunk_tokens)
        
        # Extract links
        links = self.extract_links(original_text)
        
        return {
            'questions': chunk_questions,
            'exclamations': chunk_exclamations,
            'uppercase_non_initial': uppercase_words,
            'research_terms_found': research_terms,
            'links': links
        }
    
    def process_pages(self) -> Tuple[List[Dict], str]:
        """
        Process all pages and create chunks.
        
        Returns:
            Tuple of (processed_data, combined_text)
        """
        all_page_data = []
        combined_text_parts = []
        
        print("\nProcessing pages and creating chunks...")
        
        for page_info in self.metadata['pages']:
            page_num = page_info['page_number']
            original_text = page_info['text']
            
            print(f"Processing page {page_num}...", end='\r')
            
            # Lemmatize and tokenize
            token_dicts = self.lemmatize_text(original_text)
            processed_tokens = self.remove_punctuation_except_expressive(token_dicts)
            
            # Create 200-token chunks
            chunks = self.create_chunks(processed_tokens, chunk_size=200)
            
            page_chunks = []
            for chunk_idx, chunk_tokens in enumerate(chunks):
                chunk_text = ' '.join(chunk_tokens)
                
                # Extract metadata
                metadata = self.extract_chunk_metadata(original_text, chunk_tokens)
                
                chunk_data = {
                    'page_number': page_num,
                    'chunk_index': chunk_idx + 1,
                    'total_chunks_in_page': len(chunks),
                    'chunk_text': chunk_text,
                    'token_count': len(chunk_tokens),
                    'overlaps_with_transition': None,  # Will be set later
                    **metadata
                }
                
                page_chunks.append(chunk_data)
                
                # Add to combined text
                combined_text_parts.append(
                    f"\n{'='*80}\n"
                    f"PAGE {page_num} - CHUNK {chunk_idx + 1}/{len(chunks)}\n"
                    f"{'='*80}\n"
                    f"{chunk_text}\n"
                )
            
            all_page_data.append({
                'page_number': page_num,
                'original_text_length': len(original_text),
                'total_tokens': len(processed_tokens),
                'total_chunks': len(chunks),
                'chunks': page_chunks
            })
        
        print(f"\nProcessed {len(all_page_data)} pages")
        
        combined_text = '\n'.join(combined_text_parts)
        return all_page_data, combined_text
    
    def create_transition_chunks(self, all_page_data: List[Dict]) -> List[Dict]:
        """
        Create transition chunks between consecutive pages.
        Last 150 tokens of page N + first 150 tokens of page N+1.
        """
        transition_chunks = []
        
        print("\nCreating transition chunks...")
        
        for i in range(len(all_page_data) - 1):
            current_page = all_page_data[i]
            next_page = all_page_data[i + 1]
            
            current_page_num = current_page['page_number']
            next_page_num = next_page['page_number']
            
            # Get last 150 tokens from current page
            current_page_chunks = current_page['chunks']
            current_all_tokens = []
            for chunk in current_page_chunks:
                current_all_tokens.extend(chunk['chunk_text'].split())
            
            last_150_current = current_all_tokens[-150:] if len(current_all_tokens) >= 150 else current_all_tokens
            
            # Get first 150 tokens from next page
            next_page_chunks = next_page['chunks']
            next_all_tokens = []
            for chunk in next_page_chunks:
                next_all_tokens.extend(chunk['chunk_text'].split())
            
            first_150_next = next_all_tokens[:150] if len(next_all_tokens) >= 150 else next_all_tokens
            
            # Combine
            transition_tokens = last_150_current + first_150_next
            transition_text = ' '.join(transition_tokens)
            
            # Get original texts for metadata extraction
            current_original = self.metadata['pages'][i]['text']
            next_original = self.metadata['pages'][i + 1]['text']
            combined_original = current_original + " " + next_original
            
            # Extract metadata
            metadata = self.extract_chunk_metadata(combined_original, transition_tokens)
            
            transition_chunk = {
                'transition_pages': (current_page_num, next_page_num),
                'chunk_text': transition_text,
                'token_count': len(transition_tokens),
                'tokens_from_page_1': len(last_150_current),
                'tokens_from_page_2': len(first_150_next),
                **metadata
            }
            
            transition_chunks.append(transition_chunk)
            
            # Mark overlapping chunks in page data
            # Last chunk of current page
            if current_page_chunks:
                current_page_chunks[-1]['overlaps_with_transition'] = (current_page_num, next_page_num)
            
            # First chunk of next page
            if next_page_chunks:
                next_page_chunks[0]['overlaps_with_transition'] = (current_page_num, next_page_num)
            
            print(f"Created transition chunk: Page {current_page_num} -> {next_page_num}")
        
        return transition_chunks
    
    def process_and_save(self):
        """Main processing pipeline."""
        print("="*80)
        print("TEXT TOKENIZATION AND CHUNKING")
        print("="*80)
        
        # Process pages
        all_page_data, combined_text = self.process_pages()
        
        # Create transition chunks
        transition_chunks = self.create_transition_chunks(all_page_data)
        
        # Add transition chunks to combined text
        transition_text_parts = []
        for tc in transition_chunks:
            transition_text_parts.append(
                f"\n{'#'*80}\n"
                f"TRANSITION CHUNK: PAGE {tc['transition_pages'][0]} -> PAGE {tc['transition_pages'][1]}\n"
                f"{'#'*80}\n"
                f"{tc['chunk_text']}\n"
            )
        
        combined_text += '\n' + '\n'.join(transition_text_parts)
        
        # Calculate statistics
        total_chunks = sum(page['total_chunks'] for page in all_page_data)
        total_tokens = sum(page['total_tokens'] for page in all_page_data)
        
        # Create final metadata structure
        output_metadata = {
            'source_combined_txt': str(self.combined_txt_path.name),
            'source_metadata_json': str(self.metadata_json_path.name),
            'total_pages': len(all_page_data),
            'total_chunks': total_chunks,
            'total_transition_chunks': len(transition_chunks),
            'total_tokens': total_tokens,
            'chunk_size': 200,
            'transition_chunk_tokens': 300,
            'processing': {
                'lemmatization': True,
                'number_normalization': True,
                'punctuation_removed': 'all except ? and !',
                'case_preserved': True
            },
            'pages': all_page_data,
            'transition_chunks': transition_chunks
        }
        
        # Save combined text
        text_output_path = self.output_dir / f"{self.combined_txt_path.stem}_tokenized.txt"
        with open(text_output_path, 'w', encoding='utf-8') as f:
            f.write(combined_text)
        print(f"\n✓ Saved tokenized text: {text_output_path.name}")
        
        # Save metadata JSON
        json_output_path = self.output_dir / f"{self.metadata_json_path.stem}_tokenized.json"
        with open(json_output_path, 'w', encoding='utf-8') as f:
            json.dump(output_metadata, f, indent=2, ensure_ascii=False)
        print(f"✓ Saved tokenized metadata: {json_output_path.name}")
        
        # Print summary
        print(f"\n{'='*80}")
        print("PROCESSING SUMMARY")
        print(f"{'='*80}")
        print(f"Total pages: {len(all_page_data)}")
        print(f"Total chunks: {total_chunks}")
        print(f"Total transition chunks: {len(transition_chunks)}")
        print(f"Total tokens: {total_tokens:,}")
        print(f"Average chunks per page: {total_chunks / len(all_page_data):.1f}")
        print(f"Output directory: {self.output_dir}")
        print(f"{'='*80}")
        
        return output_metadata


def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Tokenize and chunk text with lemmatization for RAG system'
    )
    parser.add_argument('combined_txt', help='Path to combined text file')
    parser.add_argument('metadata_json', help='Path to metadata JSON file')
    parser.add_argument('--output-dir', '-o', help='Output directory', default=None)
    
    args = parser.parse_args()
    
    try:
        tokenizer = TextTokenizer(args.combined_txt, args.metadata_json, args.output_dir)
        tokenizer.process_and_save()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())