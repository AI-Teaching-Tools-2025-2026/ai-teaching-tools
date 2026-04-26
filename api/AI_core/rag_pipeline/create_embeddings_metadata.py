"""
RAG System - Final Metadata Generator with Embeddings
======================================================

This script creates comprehensive metadata with embeddings for a RAG system on textbook content.

Features:
- Creates embeddings using OpenAI text-embedding-3-large
- Applies TF-IDF and Zipf's law filtering
- Embeds pages, chunks, questions, exclamations, terms
- Tracks chunk overlaps
- Generates visualization plots

Requirements:
    pip install openai scikit-learn matplotlib numpy --break-system-packages
"""

import json
import os
from pathlib import Path
from typing import List, Dict, Tuple, Set, Optional
from collections import Counter, defaultdict
import re
import time
from datetime import datetime

# Data analysis
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

# Visualization
import matplotlib.pyplot as plt
import matplotlib

# OpenAI
from openai import OpenAI

# Local imports
from api.AI_core.rag_pipeline.research_terminology import RESEARCH_TERMINOLOGY


class EmbeddingMetadataGenerator:
    """
    Generates comprehensive metadata with embeddings for RAG system.
    
    Workflow:
    1. Load tokenized data and original text
    2. Calculate TF-IDF and Zipf's law distributions
    3. Apply filtering rules for conditional embeddings
    4. Generate embeddings via OpenAI API
    5. Create final JSON with all metadata
    6. Generate visualization plots
    """
    
    def __init__(
        self,
        tokenized_json_path: str,
        original_combined_txt_path: str,
        original_metadata_json_path: str,
        output_dir: str = None,
        openai_api_key: str = None
    ):
        """
        Initialize the metadata generator.
        
        Args:
            tokenized_json_path: Path to tokenized metadata JSON
            original_combined_txt_path: Path to original combined text (for page embeddings)
            original_metadata_json_path: Path to original PDF parser metadata (for images, etc.)
            output_dir: Output directory for results
            openai_api_key: OpenAI API key (or set OPENAI_API_KEY env variable)
        """
        self.tokenized_json_path = Path(tokenized_json_path)
        self.original_combined_txt_path = Path(original_combined_txt_path)
        self.original_metadata_json_path = Path(original_metadata_json_path)
        
        # Validate paths
        if not self.tokenized_json_path.exists():
            raise FileNotFoundError(f"Tokenized JSON not found: {tokenized_json_path}")
        if not self.original_combined_txt_path.exists():
            raise FileNotFoundError(f"Combined text not found: {original_combined_txt_path}")
        if not self.original_metadata_json_path.exists():
            raise FileNotFoundError(f"Original metadata not found: {original_metadata_json_path}")
        
        # Set output directory
        if output_dir:
            self.output_dir = Path(output_dir)
        else:
            self.output_dir = self.tokenized_json_path.parent / "embeddings"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize OpenAI client
        api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OpenAI API key required. Set OPENAI_API_KEY or pass as parameter.")
        self.client = OpenAI(api_key=api_key)
        
        # Embedding model
        self.embedding_model = "text-embedding-3-large"
        self.embedding_dimensions = 3072
        
        # Load data
        print("Loading data...")
        with open(self.tokenized_json_path, 'r', encoding='utf-8') as f:
            self.tokenized_data = json.load(f)
        
        with open(self.original_metadata_json_path, 'r', encoding='utf-8') as f:
            self.original_metadata = json.load(f)
        
        # Extract original page texts
        self.original_page_texts = self._extract_original_page_texts()
        
        # Statistics tracking
        self.stats = {
            'total_api_calls': 0,
            'total_tokens_embedded': 0,
            'embedding_counts': defaultdict(int),
            'start_time': time.time()
        }
        
        # Special terminology categories
        self.special_categories = {
            "Statistical Tests",
            "Research Designs",
            "Validity and Reliability",
            "Measurement Scales",
            "Ethics",
            "Additional Design Terms",
            "Advanced Statistical Methods"
        }
        
        # Map terms to categories
        self.term_to_category = self._map_terms_to_categories()
    
    def _extract_original_page_texts(self) -> Dict[int, str]:
        """
        Extract original page texts from the combined text file.
        Parses page markers from the original PDF parser output.
        
        Returns:
            Dict mapping page_number -> original text
        """
        with open(self.original_combined_txt_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Split by page markers
        page_pattern = r'={80}\nPAGE (\d+)\n={80}\n'
        splits = re.split(page_pattern, content)
        
        page_texts = {}
        # splits will be: ['', '1', 'text for page 1', '2', 'text for page 2', ...]
        for i in range(1, len(splits), 2):
            page_num = int(splits[i])
            page_text = splits[i + 1].strip() if i + 1 < len(splits) else ""
            
            # Remove image references section if present
            image_marker = '\n\n[Images on this page:'
            if image_marker in page_text:
                page_text = page_text[:page_text.index(image_marker)]
            
            page_texts[page_num] = page_text
        
        return page_texts
    
    def _map_terms_to_categories(self) -> Dict[str, str]:
        """
        Map research terms to their categories.
        This is a heuristic mapping based on the terminology structure.
        
        Returns:
            Dict mapping term -> category
        """
        # Define category keywords (terms that indicate category membership)
        category_keywords = {
            "Statistical Tests": {
                "t-test", "anova", "chi-square", "f-test", "mann-whitney",
                "wilcoxon", "kruskal-wallis", "friedman", "z-test"
            },
            "Research Designs": {
                "experimental", "quasi-experimental", "between-subjects",
                "within-subjects", "longitudinal", "cross-sectional",
                "factorial", "randomized", "double-blind"
            },
            "Validity and Reliability": {
                "validity", "reliability", "cronbach", "internal consistency",
                "test-retest", "inter-rater", "construct validity"
            },
            "Measurement Scales": {
                "likert", "semantic differential", "visual analog",
                "rating scale", "ordinal scale", "interval scale"
            },
            "Ethics": {
                "irb", "informed consent", "debriefing", "confidentiality",
                "anonymity", "ethics committee"
            },
            "Additional Design Terms": {
                "counterbalancing", "carryover effect", "practice effect",
                "demand characteristics", "ceiling effect", "floor effect"
            },
            "Advanced Statistical Methods": {
                "structural equation", "hierarchical linear", "factor analysis",
                "cluster analysis", "survival analysis", "bayesian"
            }
        }
        
        term_map = {}
        for term in RESEARCH_TERMINOLOGY:
            term_lower = term.lower()
            for category, keywords in category_keywords.items():
                if any(kw in term_lower for kw in keywords):
                    term_map[term] = category
                    break
        
        return term_map
    
    def create_embedding(self, text: str, description: str = "") -> List[float]:
        """
        Create embedding using OpenAI API.
        
        Args:
            text: Text to embed
            description: Description for logging
            
        Returns:
            Embedding vector (list of floats)
        """
        try:
            response = self.client.embeddings.create(
                model=self.embedding_model,
                input=text
            )
            
            # Update statistics
            self.stats['total_api_calls'] += 1
            self.stats['total_tokens_embedded'] += response.usage.total_tokens
            if description:
                self.stats['embedding_counts'][description] += 1
            
            # Print progress every 50 API calls
            if self.stats['total_api_calls'] % 50 == 0:
                elapsed = time.time() - self.stats['start_time']
                print(f"\r  Progress: {self.stats['total_api_calls']:,} API calls | "
                      f"{self.stats['total_tokens_embedded']:,} tokens | "
                      f"{elapsed/60:.1f} min elapsed", end='', flush=True)
            
            return response.data[0].embedding
        
        except Exception as e:
            print(f"\nError creating embedding for {description}: {e}")
            return None
    
    def calculate_tfidf(self, documents: List[str], terms_list: List[str]) -> Dict[str, List[Tuple[int, float]]]:
        """
        Calculate TF-IDF scores for specific terms across documents.
        
        IMPORTANT: Calculates TF-IDF on FULL text (all words), then extracts only our terms.
        This gives realistic scores. If we limit vocabulary first, normalization makes all scores ~1.0.
        
        Args:
            documents: List of document texts (chunks or pages)
            terms_list: List of terms to calculate TF-IDF for
            
        Returns:
            Dict mapping term -> [(doc_idx, tfidf_score), ...]
        """
        try:
            # Calculate TF-IDF on FULL vocabulary (all words in documents)
            # This is critical for realistic scores
            vectorizer = TfidfVectorizer(
                lowercase=True,
                max_features=10000,  # Limit to top 10k words to avoid memory issues
                min_df=1  # Include even rare words
            )
            
            tfidf_matrix = vectorizer.fit_transform(documents)
            feature_names = vectorizer.get_feature_names_out()
            
            # Create mapping from term to feature index
            term_to_idx = {term: idx for idx, term in enumerate(feature_names)}
            
            # Build term -> scores mapping (only for our terms of interest)
            term_scores = defaultdict(list)
            terms_lower = {term.lower(): term for term in terms_list}
            
            for doc_idx in range(tfidf_matrix.shape[0]):
                doc_vector = tfidf_matrix[doc_idx].toarray().flatten()
                
                # Check each term we care about
                for term_lower, original_term in terms_lower.items():
                    if term_lower in term_to_idx:
                        term_idx = term_to_idx[term_lower]
                        score = doc_vector[term_idx]
                        if score > 0:
                            term_scores[original_term].append((doc_idx, float(score)))
            
            # Sort by score descending
            for term in term_scores:
                term_scores[term].sort(key=lambda x: x[1], reverse=True)
            
            return dict(term_scores)
        
        except Exception as e:
            print(f"Error calculating TF-IDF: {e}")
            import traceback
            traceback.print_exc()
            return {}
    
    def calculate_zipf_frequencies(self, all_chunks: List[Dict], terms_list: List[str]) -> Dict[str, float]:
        """
        Calculate Zipf's law frequency percentages.
        
        Args:
            all_chunks: List of all chunk dictionaries
            terms_list: List of terms to analyze
            
        Returns:
            Dict mapping term -> frequency_percentage
        """
        term_chunk_counts = Counter()
        total_chunks = len(all_chunks)
        
        # Count how many chunks each term appears in
        for chunk in all_chunks:
            chunk_terms = set()
            
            # Collect all terms in this chunk
            if 'uppercase_non_initial' in chunk:
                chunk_terms.update(chunk['uppercase_non_initial'])
            if 'research_terms_found' in chunk:
                chunk_terms.update(chunk['research_terms_found'])
            
            # Count unique terms
            for term in chunk_terms:
                if term in terms_list:
                    term_chunk_counts[term] += 1
        
        # Calculate percentages
        frequencies = {}
        for term in terms_list:
            count = term_chunk_counts.get(term, 0)
            frequencies[term] = (count / total_chunks * 100) if total_chunks > 0 else 0
        
        return frequencies
    
    def get_top_tfidf_terms(
        self,
        tfidf_scores: Dict[str, List[Tuple[int, float]]],
        top_n: int
    ) -> Set[str]:
        """
        Get top N terms by maximum TF-IDF score.
        
        Args:
            tfidf_scores: TF-IDF scores from calculate_tfidf()
            top_n: Number of top terms to return
            
        Returns:
            Set of top terms
        """
        # Get max score for each term
        term_max_scores = {}
        for term, scores in tfidf_scores.items():
            if scores:
                term_max_scores[term] = max(score for _, score in scores)
        
        # Sort and get top N
        sorted_terms = sorted(term_max_scores.items(), key=lambda x: x[1], reverse=True)
        top_terms = {term for term, _ in sorted_terms[:top_n]}
        
        return top_terms
    
    def filter_by_zipf(self, zipf_frequencies: Dict[str, float], threshold_percent: float) -> Set[str]:
        """
        Filter terms by Zipf's law frequency threshold.
        
        Args:
            zipf_frequencies: Frequency percentages from calculate_zipf_frequencies()
            threshold_percent: Threshold (keep terms below this percentage)
            
        Returns:
            Set of terms meeting criteria
        """
        return {term for term, freq in zipf_frequencies.items() if freq < threshold_percent}
    
    def collect_all_chunks(self) -> List[Dict]:
        """
        Collect all chunks from pages and transitions.
        
        Returns:
            List of all chunk dictionaries with added chunk_id
        """
        all_chunks = []
        
        # Regular chunks from pages
        for page in self.tokenized_data['pages']:
            for chunk in page['chunks']:
                chunk_copy = chunk.copy()
                chunk_copy['chunk_id'] = f"page_{page['page_number']}_chunk_{chunk['chunk_index']}"
                chunk_copy['page_number'] = page['page_number']
                all_chunks.append(chunk_copy)
        
        # Transition chunks
        for trans_chunk in self.tokenized_data.get('transition_chunks', []):
            chunk_copy = trans_chunk.copy()
            p1, p2 = trans_chunk['transition_pages']
            chunk_copy['chunk_id'] = f"transition_{p1}_{p2}"
            all_chunks.append(chunk_copy)
        
        return all_chunks
    
    def analyze_terms(self) -> Tuple[Dict, Dict, Dict, Dict, Dict, Dict, Dict, Dict]:
        """
        Perform TF-IDF and Zipf's law analysis on uppercase words and research terms.
        Calculates BOTH chunk-level and page-level TF-IDF.
        
        Returns:
            Tuple of 8 dicts:
            - uppercase_chunk_tfidf: TF-IDF at chunk level
            - uppercase_page_tfidf: TF-IDF at page level
            - uppercase_zipf: Zipf frequencies
            - terms_chunk_tfidf: TF-IDF at chunk level
            - terms_page_tfidf: TF-IDF at page level
            - terms_zipf: Zipf frequencies
        """
        print("\nPerforming TF-IDF and Zipf's law analysis...")
        
        all_chunks = self.collect_all_chunks()
        
        # Collect all unique terms
        all_uppercase = set()
        all_research_terms = set()
        
        for chunk in all_chunks:
            all_uppercase.update(chunk.get('uppercase_non_initial', []))
            all_research_terms.update(chunk.get('research_terms_found', []))
        
        print(f"Found {len(all_uppercase)} unique uppercase words")
        print(f"Found {len(all_research_terms)} unique research terms")
        
        # Prepare documents for TF-IDF
        # CHUNK-LEVEL: each chunk is a document
        chunk_documents = [chunk['chunk_text'] for chunk in all_chunks]
        
        # PAGE-LEVEL: each page's combined chunks is a document
        page_documents = []
        for page in self.tokenized_data['pages']:
            page_text = ' '.join(chunk['chunk_text'] for chunk in page['chunks'])
            page_documents.append(page_text)
        
        print(f"\nCalculating chunk-level TF-IDF ({len(chunk_documents)} chunks)...")
        # Calculate chunk-level TF-IDF
        uppercase_chunk_tfidf = self.calculate_tfidf(chunk_documents, list(all_uppercase))
        terms_chunk_tfidf = self.calculate_tfidf(chunk_documents, list(all_research_terms))
        
        print(f"Calculating page-level TF-IDF ({len(page_documents)} pages)...")
        # Calculate page-level TF-IDF
        uppercase_page_tfidf = self.calculate_tfidf(page_documents, list(all_uppercase))
        terms_page_tfidf = self.calculate_tfidf(page_documents, list(all_research_terms))
        
        # Calculate Zipf frequencies (same for both levels - based on chunk presence)
        print("Calculating Zipf's law frequencies...")
        uppercase_zipf = self.calculate_zipf_frequencies(all_chunks, list(all_uppercase))
        terms_zipf = self.calculate_zipf_frequencies(all_chunks, list(all_research_terms))
        
        return (
            uppercase_chunk_tfidf, 
            uppercase_page_tfidf,
            uppercase_zipf, 
            terms_chunk_tfidf, 
            terms_page_tfidf,
            terms_zipf
        )
    
    def determine_embedding_eligibility(
        self,
        uppercase_chunk_tfidf: Dict,
        uppercase_page_tfidf: Dict,
        uppercase_zipf: Dict,
        terms_chunk_tfidf: Dict,
        terms_page_tfidf: Dict,
        terms_zipf: Dict
    ) -> Tuple[Set[str], Set[str], Set[str], Set[str]]:
        """
        Determine which terms are eligible for embeddings at THREE filtering levels.
        
        Returns eligibility for PAGE-LEVEL only (chunks use moderate level).
        
        Filtering Rules:
        MODERATE (Level 2):
        - Uppercase: Top 50 page-TF-IDF OR < 30% Zipf
        - Terms: Top 20 page-TF-IDF OR < 15% Zipf
        
        AGGRESSIVE (Level 3):
        - Uppercase: Top 30 page-TF-IDF OR < 10% Zipf
        - Terms: Top 8 page-TF-IDF OR < 10% Zipf
        
        Args:
            uppercase_chunk_tfidf: Chunk-level TF-IDF for uppercase
            uppercase_page_tfidf: Page-level TF-IDF for uppercase
            uppercase_zipf: Zipf frequencies for uppercase
            terms_chunk_tfidf: Chunk-level TF-IDF for terms
            terms_page_tfidf: Page-level TF-IDF for terms
            terms_zipf: Zipf frequencies for terms
            
        Returns:
            Tuple of (eligible_uppercase_moderate, eligible_uppercase_aggressive,
                     eligible_terms_moderate, eligible_terms_aggressive)
        """
        print("\nDetermining embedding eligibility at THREE levels...")
        
        # MODERATE LEVEL - Uppercase: top 50 page-TF-IDF OR < 30% Zipf
        top_50_uppercase_page = self.get_top_tfidf_terms(uppercase_page_tfidf, 50)
        low_freq_uppercase_30 = self.filter_by_zipf(uppercase_zipf, 30.0)
        eligible_uppercase_moderate = top_50_uppercase_page | low_freq_uppercase_30
        
        # AGGRESSIVE LEVEL - Uppercase: top 30 page-TF-IDF OR < 10% Zipf
        top_30_uppercase_page = self.get_top_tfidf_terms(uppercase_page_tfidf, 30)
        low_freq_uppercase_10 = self.filter_by_zipf(uppercase_zipf, 10.0)
        eligible_uppercase_aggressive = top_30_uppercase_page | low_freq_uppercase_10
        
        print(f"\nUppercase Words:")
        print(f"  MODERATE (top 50 page-TF-IDF OR <30% Zipf): {len(eligible_uppercase_moderate)}")
        print(f"    - Top 50 page-TF-IDF: {len(top_50_uppercase_page)}")
        print(f"    - < 30% frequency: {len(low_freq_uppercase_30)}")
        print(f"  AGGRESSIVE (top 30 page-TF-IDF OR <10% Zipf): {len(eligible_uppercase_aggressive)}")
        print(f"    - Top 30 page-TF-IDF: {len(top_30_uppercase_page)}")
        print(f"    - < 10% frequency: {len(low_freq_uppercase_10)}")
        
        # Research terms - separate special terms first
        special_terms = {term for term in terms_page_tfidf.keys() if term in self.term_to_category}
        non_special_terms = set(terms_page_tfidf.keys()) - special_terms
        
        # Filter to only non-special terms
        non_special_page_tfidf = {t: s for t, s in terms_page_tfidf.items() if t in non_special_terms}
        
        # MODERATE LEVEL - Terms: top 20 page-TF-IDF OR < 15% Zipf
        top_20_terms_page = self.get_top_tfidf_terms(non_special_page_tfidf, 20)
        low_freq_terms_15 = self.filter_by_zipf(terms_zipf, 15.0) & non_special_terms
        eligible_terms_moderate = top_20_terms_page | low_freq_terms_15
        
        # AGGRESSIVE LEVEL - Terms: top 8 page-TF-IDF OR < 10% Zipf
        top_8_terms_page = self.get_top_tfidf_terms(non_special_page_tfidf, 8)
        low_freq_terms_10 = self.filter_by_zipf(terms_zipf, 10.0) & non_special_terms
        eligible_terms_aggressive = top_8_terms_page | low_freq_terms_10
        
        print(f"\nResearch Terms (non-special):")
        print(f"  MODERATE (top 20 page-TF-IDF OR <15% Zipf): {len(eligible_terms_moderate)}")
        print(f"    - Top 20 page-TF-IDF: {len(top_20_terms_page)}")
        print(f"    - < 15% frequency: {len(low_freq_terms_15)}")
        print(f"  AGGRESSIVE (top 8 page-TF-IDF OR <10% Zipf): {len(eligible_terms_aggressive)}")
        print(f"    - Top 8 page-TF-IDF: {len(top_8_terms_page)}")
        print(f"    - < 10% frequency: {len(low_freq_terms_10)}")
        print(f"\nSpecial category terms (all eligible): {len(special_terms)}")
        
        return (eligible_uppercase_moderate, eligible_uppercase_aggressive,
                eligible_terms_moderate, eligible_terms_aggressive)
    
    def create_term_embeddings(
        self,
        terms: Set[str],
        chunk_tfidf_scores: Dict,
        page_tfidf_scores: Dict,
        zipf_frequencies: Dict,
        is_chunk_level: bool = True,
        is_special: bool = False
    ) -> List[Dict]:
        """
        Create embeddings for terms with metadata.
        Saves BOTH chunk-level and page-level TF-IDF scores.
        
        Args:
            terms: Set of terms to embed
            chunk_tfidf_scores: Chunk-level TF-IDF scores
            page_tfidf_scores: Page-level TF-IDF scores
            zipf_frequencies: Zipf frequencies
            is_chunk_level: Whether this is for chunk-level (vs page-level)
            is_special: Whether these are special category terms
            
        Returns:
            List of dicts with term, original_text, embedding, and metadata
        """
        embedded_terms = []
        
        for term in terms:
            # Get scores at both levels
            chunk_tfidf = max((score for _, score in chunk_tfidf_scores.get(term, [])), default=0.0)
            page_tfidf = max((score for _, score in page_tfidf_scores.get(term, [])), default=0.0)
            zipf = zipf_frequencies.get(term, 0.0)
            
            # Create embedding
            embedding = self.create_embedding(term, f"term: {term}")
            
            if embedding:
                term_data = {
                    'term': term,
                    'original_text': term,  # For terms, original_text is the term itself
                    'chunk_tfidf_score': round(chunk_tfidf, 4),
                    'page_tfidf_score': round(page_tfidf, 4),
                    'zipf_percentage': round(zipf, 2),
                    'embedding': embedding
                }
                
                # Add category for special terms
                if is_special and term in self.term_to_category:
                    term_data['category'] = self.term_to_category[term]
                    term_data['is_special_case'] = True
                else:
                    term_data['is_special_case'] = False
                
                embedded_terms.append(term_data)
        
        return embedded_terms
    
    def process_chunk_embeddings(
        self,
        chunk: Dict,
        eligible_uppercase: Set[str],
        eligible_terms: Set[str],
        special_terms: Set[str],
        uppercase_chunk_tfidf: Dict,
        uppercase_page_tfidf: Dict,
        uppercase_zipf: Dict,
        terms_chunk_tfidf: Dict,
        terms_page_tfidf: Dict,
        terms_zipf: Dict
    ) -> Dict:
        """
        Process all embeddings for a single chunk.
        Saves original text with each embedding.
        
        Args:
            chunk: Chunk dictionary
            eligible_uppercase: Set of eligible uppercase words (chunk-level filtered)
            eligible_terms: Set of eligible non-special terms (chunk-level filtered)
            special_terms: Set of special category terms
            uppercase_chunk_tfidf: Chunk-level TF-IDF for uppercase
            uppercase_page_tfidf: Page-level TF-IDF for uppercase
            uppercase_zipf: Zipf frequencies for uppercase
            terms_chunk_tfidf: Chunk-level TF-IDF for terms
            terms_page_tfidf: Page-level TF-IDF for terms
            terms_zipf: Zipf frequencies for terms
            
        Returns:
            Enhanced chunk dictionary with embeddings
        """
        enhanced_chunk = chunk.copy()
        
        # 1. Chunk embedding (save original tokenized text)
        enhanced_chunk['chunk_text_original'] = chunk['chunk_text']
        enhanced_chunk['chunk_embedding'] = self.create_embedding(
            chunk['chunk_text'],
            f"chunk: {chunk.get('chunk_id', 'unknown')}"
        )
        
        # 2. Question embeddings (ALL questions, save original text)
        enhanced_chunk['questions'] = [
            {
                'text': q,
                'original_text': q,
                'embedding': self.create_embedding(q, "question")
            }
            for q in chunk.get('questions', [])
        ]
        
        # 3. Exclamation embeddings (ALL exclamations, save original text)
        enhanced_chunk['exclamations'] = [
            {
                'text': e,
                'original_text': e,
                'embedding': self.create_embedding(e, "exclamation")
            }
            for e in chunk.get('exclamations', [])
        ]
        
        # 4. Uppercase non-initial embeddings (filtered by chunk-level criteria)
        uppercase_in_chunk = set(chunk.get('uppercase_non_initial', []))
        eligible_in_chunk = uppercase_in_chunk & eligible_uppercase
        
        enhanced_chunk['uppercase_non_initial_embedded'] = self.create_term_embeddings(
            eligible_in_chunk,
            uppercase_chunk_tfidf,
            uppercase_page_tfidf,
            uppercase_zipf,
            is_chunk_level=True,
            is_special=False
        )
        
        # 5. Research terms embeddings
        terms_in_chunk = set(chunk.get('research_terms_found', []))
        
        # Non-special terms (filtered by chunk-level criteria)
        eligible_non_special = terms_in_chunk & eligible_terms
        embedded_non_special = self.create_term_embeddings(
            eligible_non_special,
            terms_chunk_tfidf,
            terms_page_tfidf,
            terms_zipf,
            is_chunk_level=True,
            is_special=False
        )
        
        # Special terms (ALL, with both TF-IDF levels)
        special_in_chunk = terms_in_chunk & special_terms
        embedded_special = self.create_term_embeddings(
            special_in_chunk,
            terms_chunk_tfidf,
            terms_page_tfidf,
            terms_zipf,
            is_chunk_level=True,
            is_special=True
        )
        
        enhanced_chunk['research_terms_embedded'] = embedded_non_special + embedded_special
        
        return enhanced_chunk
    
    def process_page_embeddings(
        self,
        page_data: Dict,
        original_page_info: Dict,
        eligible_uppercase_moderate: Set[str],
        eligible_uppercase_aggressive: Set[str],
        eligible_terms_moderate: Set[str],
        eligible_terms_aggressive: Set[str],
        special_terms: Set[str],
        uppercase_chunk_tfidf: Dict,
        uppercase_page_tfidf: Dict,
        uppercase_zipf: Dict,
        terms_chunk_tfidf: Dict,
        terms_page_tfidf: Dict,
        terms_zipf: Dict
    ) -> Dict:
        """
        Process embeddings for an entire page with THREE filtering levels.
        
        Level 1: Full list (no filtering, text only)
        Level 2: Moderate filtering (text + embeddings)
        Level 3: Aggressive filtering (text + embeddings)
        
        Args:
            page_data: Page data from tokenized JSON
            original_page_info: Original page info from PDF parser
            eligible_uppercase_moderate: Moderate filter uppercase
            eligible_uppercase_aggressive: Aggressive filter uppercase
            eligible_terms_moderate: Moderate filter terms
            eligible_terms_aggressive: Aggressive filter terms
            special_terms: Set of special terms
            uppercase_chunk_tfidf: Chunk-level TF-IDF for uppercase
            uppercase_page_tfidf: Page-level TF-IDF for uppercase
            uppercase_zipf: Zipf frequencies for uppercase
            terms_chunk_tfidf: Chunk-level TF-IDF for terms
            terms_page_tfidf: Page-level TF-IDF for terms
            terms_zipf: Zipf frequencies for terms
            
        Returns:
            Enhanced page dictionary with embeddings at three levels
        """
        page_num = page_data['page_number']
        
        # Get original text for this page
        original_text = self.original_page_texts.get(page_num, "")
        
        enhanced_page = {
            'page_number': page_num,
            'original_text': original_text,
            'text_length': len(original_text),
            'word_count': original_page_info.get('word_count', 0),
            'non_word_count': original_page_info.get('non_word_count', 0)
        }
        
        # Page embedding (from original text)
        enhanced_page['page_embedding'] = self.create_embedding(
            original_text,
            f"page: {page_num}"
        )
        
        # Links
        enhanced_page['links'] = original_page_info.get('links', [])
        
        # Images
        enhanced_page['images'] = original_page_info.get('images', [])
        
        # Top word pairs
        enhanced_page['top_10_word_pairs'] = original_page_info.get('top_word_pairs', [])[:10]
        
        # Aggregate all terms from chunks in this page
        all_questions = []
        all_exclamations = []
        all_uppercase = set()
        all_terms = set()
        
        for chunk in page_data['chunks']:
            all_questions.extend(chunk.get('questions', []))
            all_exclamations.extend(chunk.get('exclamations', []))
            all_uppercase.update(chunk.get('uppercase_non_initial', []))
            all_terms.update(chunk.get('research_terms_found', []))
        
        # Create embeddings for page-level questions/exclamations
        enhanced_page['questions'] = [
            {
                'text': q,
                'original_text': q,
                'embedding': self.create_embedding(q, "page_question")
            }
            for q in set(all_questions)  # Deduplicate
        ]
        
        enhanced_page['exclamations'] = [
            {
                'text': e,
                'original_text': e,
                'embedding': self.create_embedding(e, "page_exclamation")
            }
            for e in set(all_exclamations)  # Deduplicate
        ]
        
        # =================================================================
        # LEVEL 1: FULL LIST (No filtering, text only, no embeddings)
        # =================================================================
        enhanced_page['terms_full_list'] = {
            'uppercase_non_initial_all': sorted(list(all_uppercase)),
            'research_terms_all': sorted(list(all_terms))
        }
        
        # =================================================================
        # LEVEL 2: MODERATE FILTERING (Top 50/20 TF-IDF OR <30%/15% Zipf)
        # =================================================================
        # Uppercase - moderate
        eligible_uppercase_page_moderate = all_uppercase & eligible_uppercase_moderate
        embedded_uppercase_moderate = self.create_term_embeddings(
            eligible_uppercase_page_moderate,
            uppercase_chunk_tfidf,
            uppercase_page_tfidf,
            uppercase_zipf,
            is_chunk_level=False,  # Page-level
            is_special=False
        )
        
        # Terms - moderate (non-special)
        eligible_terms_page_moderate = all_terms & eligible_terms_moderate
        embedded_terms_moderate = self.create_term_embeddings(
            eligible_terms_page_moderate,
            terms_chunk_tfidf,
            terms_page_tfidf,
            terms_zipf,
            is_chunk_level=False,  # Page-level
            is_special=False
        )
        
        # Special terms (ALL, always included)
        special_terms_page = all_terms & special_terms
        embedded_special_moderate = self.create_term_embeddings(
            special_terms_page,
            terms_chunk_tfidf,
            terms_page_tfidf,
            terms_zipf,
            is_chunk_level=False,  # Page-level
            is_special=True
        )
        
        enhanced_page['terms_moderate_filtering'] = {
            'uppercase_non_initial': embedded_uppercase_moderate,
            'research_terms': embedded_terms_moderate + embedded_special_moderate
        }
        
        # =================================================================
        # LEVEL 3: AGGRESSIVE FILTERING (Top 30/8 TF-IDF OR <10% Zipf)
        # =================================================================
        # Uppercase - aggressive
        eligible_uppercase_page_aggressive = all_uppercase & eligible_uppercase_aggressive
        embedded_uppercase_aggressive = self.create_term_embeddings(
            eligible_uppercase_page_aggressive,
            uppercase_chunk_tfidf,
            uppercase_page_tfidf,
            uppercase_zipf,
            is_chunk_level=False,  # Page-level
            is_special=False
        )
        
        # Terms - aggressive (non-special)
        eligible_terms_page_aggressive = all_terms & eligible_terms_aggressive
        embedded_terms_aggressive = self.create_term_embeddings(
            eligible_terms_page_aggressive,
            terms_chunk_tfidf,
            terms_page_tfidf,
            terms_zipf,
            is_chunk_level=False,  # Page-level
            is_special=False
        )
        
        # Special terms (ALL, always included)
        embedded_special_aggressive = self.create_term_embeddings(
            special_terms_page,
            terms_chunk_tfidf,
            terms_page_tfidf,
            terms_zipf,
            is_chunk_level=False,  # Page-level
            is_special=True
        )
        
        enhanced_page['terms_aggressive_filtering'] = {
            'uppercase_non_initial': embedded_uppercase_aggressive,
            'research_terms': embedded_terms_aggressive + embedded_special_aggressive
        }
        
        # Process all chunks in page (chunks use moderate filtering only)
        enhanced_page['chunks'] = []
        for chunk in page_data['chunks']:
            enhanced_chunk = self.process_chunk_embeddings(
                chunk,
                eligible_uppercase_moderate,  # Chunks use moderate
                eligible_terms_moderate,      # Chunks use moderate
                special_terms,
                uppercase_chunk_tfidf,
                uppercase_page_tfidf,
                uppercase_zipf,
                terms_chunk_tfidf,
                terms_page_tfidf,
                terms_zipf
            )
            enhanced_page['chunks'].append(enhanced_chunk)
        
        return enhanced_page
    
    def add_overlap_tracking(self, pages: List[Dict], transition_chunks: List[Dict]):
        """
        Add overlap tracking information to chunks.
        
        Args:
            pages: List of enhanced page dictionaries
            transition_chunks: List of enhanced transition chunk dictionaries
        """
        print("\nAdding overlap tracking...")
        
        # Create mapping of transition chunks
        transition_map = {}
        for trans in transition_chunks:
            p1, p2 = trans['transition_pages']
            transition_map[(p1, p2)] = trans['chunk_id']
        
        # Add overlap info to regular chunks
        for page in pages:
            page_num = page['page_number']
            chunks = page['chunks']
            
            if not chunks:
                continue
            
            # First chunk might overlap with transition from previous page
            if page_num > 1:
                prev_transition = transition_map.get((page_num - 1, page_num))
                if prev_transition:
                    chunks[0]['overlaps_with'] = {
                        'transition_chunks': [prev_transition],
                        'overlapping_tokens': 150
                    }
            
            # Last chunk might overlap with transition to next page
            last_page = max(p['page_number'] for p in pages)
            if page_num < last_page:
                next_transition = transition_map.get((page_num, page_num + 1))
                if next_transition:
                    chunks[-1]['overlaps_with'] = {
                        'transition_chunks': [next_transition],
                        'overlapping_tokens': 150
                    }
        
        # Add overlap info to transition chunks
        for trans in transition_chunks:
            p1, p2 = trans['transition_pages']
            
            # Find overlapping regular chunks
            overlapping_regular = []
            for page in pages:
                if page['page_number'] == p1:
                    if page['chunks']:
                        overlapping_regular.append(page['chunks'][-1]['chunk_id'])
                elif page['page_number'] == p2:
                    if page['chunks']:
                        overlapping_regular.append(page['chunks'][0]['chunk_id'])
            
            trans['overlaps_with'] = {
                'regular_chunks': overlapping_regular,
                'tokens_overlap': {
                    overlapping_regular[0]: 150 if len(overlapping_regular) > 0 else 0,
                    overlapping_regular[1]: 150 if len(overlapping_regular) > 1 else 0
                }
            }
    
    def plot_tfidf_analysis(
        self,
        uppercase_tfidf: Dict,
        terms_tfidf: Dict,
        top_n: int = 50
    ):
        """
        Create TF-IDF visualization plots.
        
        Args:
            uppercase_tfidf: TF-IDF scores for uppercase words
            terms_tfidf: TF-IDF scores for research terms
            top_n: Number of top items to plot
        """
        print("\nGenerating TF-IDF plots...")
        
        # Get top items by max TF-IDF score
        def get_top_items(tfidf_dict, n):
            max_scores = {
                term: max((score for _, score in scores), default=0)
                for term, scores in tfidf_dict.items()
            }
            sorted_items = sorted(max_scores.items(), key=lambda x: x[1], reverse=True)
            return sorted_items[:n]
        
        # Create figure with subplots
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 12))
        
        # Plot 1: Top uppercase words
        top_uppercase = get_top_items(uppercase_tfidf, min(top_n, len(uppercase_tfidf)))
        if top_uppercase:
            terms, scores = zip(*top_uppercase)
            ax1.barh(range(len(terms)), scores, color='steelblue')
            ax1.set_yticks(range(len(terms)))
            ax1.set_yticklabels(terms, fontsize=8)
            ax1.set_xlabel('TF-IDF Score', fontsize=10)
            ax1.set_title(f'Top {len(terms)} Uppercase Non-Initial Words by TF-IDF', fontsize=12, fontweight='bold')
            ax1.invert_yaxis()
            ax1.grid(axis='x', alpha=0.3)
        
        # Plot 2: Top research terms
        top_terms = get_top_items(terms_tfidf, min(20, len(terms_tfidf)))
        if top_terms:
            terms, scores = zip(*top_terms)
            ax2.barh(range(len(terms)), scores, color='coral')
            ax2.set_yticks(range(len(terms)))
            ax2.set_yticklabels(terms, fontsize=8)
            ax2.set_xlabel('TF-IDF Score', fontsize=10)
            ax2.set_title(f'Top {len(terms)} Research Terms by TF-IDF', fontsize=12, fontweight='bold')
            ax2.invert_yaxis()
            ax2.grid(axis='x', alpha=0.3)
        
        plt.tight_layout()
        
        # Save plot
        tfidf_plot_path = self.output_dir / 'tfidf_analysis.png'
        plt.savefig(tfidf_plot_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"✓ Saved TF-IDF plot: {tfidf_plot_path.name}")
    
    def plot_zipf_analysis(
        self,
        uppercase_zipf: Dict,
        terms_zipf: Dict,
        uppercase_tfidf: Dict,
        terms_tfidf: Dict,
        num_highlights: int = 40,
        filename: str = 'zipf_law_analysis.png'
    ):
        """
        Create Zipf's law visualization plots with highlighted terms showing TF-IDF scores.
        
        Args:
            uppercase_zipf: Zipf frequencies for uppercase words
            terms_zipf: Zipf frequencies for research terms
            uppercase_tfidf: TF-IDF scores for uppercase words
            terms_tfidf: TF-IDF scores for research terms
            num_highlights: Number of terms to highlight (default: 40)
            filename: Output filename (default: 'zipf_law_analysis.png')
        """
        print(f"Generating Zipf's law plot with {num_highlights} highlighted terms...")
        
        # Combine and sort by frequency
        all_items = {}
        for term, freq in uppercase_zipf.items():
            # Get max TF-IDF score for this term
            tfidf_scores = uppercase_tfidf.get(term, [])
            max_tfidf = max((score for _, score in tfidf_scores), default=0.0)
            all_items[term] = {'freq': freq, 'type': 'uppercase', 'tfidf': max_tfidf}
        
        for term, freq in terms_zipf.items():
            tfidf_scores = terms_tfidf.get(term, [])
            max_tfidf = max((score for _, score in tfidf_scores), default=0.0)
            all_items[term] = {'freq': freq, 'type': 'term', 'tfidf': max_tfidf}
        
        # Sort by frequency descending
        sorted_items = sorted(all_items.items(), key=lambda x: x[1]['freq'], reverse=True)
        
        if not sorted_items:
            print("No items to plot for Zipf's law")
            return
        
        # Prepare data
        ranks = list(range(1, len(sorted_items) + 1))
        frequencies = [item[1]['freq'] for item in sorted_items]
        
        # Select terms to highlight - mix of high frequency and high TF-IDF
        # Get top 20 by frequency
        top_by_freq = sorted_items[:20]
        
        # Get top 20 by TF-IDF
        sorted_by_tfidf = sorted(all_items.items(), key=lambda x: x[1]['tfidf'], reverse=True)
        top_by_tfidf = sorted_by_tfidf[:20]
        
        # Combine and deduplicate
        highlight_set = set()
        for term, _ in top_by_freq + top_by_tfidf:
            highlight_set.add(term)
            if len(highlight_set) >= num_highlights:
                break
        
        # If we still need more, add more by frequency
        for term, _ in sorted_items:
            if len(highlight_set) >= num_highlights:
                break
            highlight_set.add(term)
        
        highlight_terms = list(highlight_set)
        
        # Create larger figure to accommodate labels
        fig, ax = plt.subplots(figsize=(16, 10))
        
        # Plot all points
        ax.loglog(ranks, frequencies, 'o', alpha=0.3, markersize=3, color='lightgray', label='All terms')
        
        # Highlight selected terms
        highlight_ranks = []
        highlight_freqs = []
        highlight_labels = []
        highlight_tfidfs = []
        
        for i, (term, data) in enumerate(sorted_items):
            if term in highlight_terms:
                highlight_ranks.append(i + 1)
                highlight_freqs.append(data['freq'])
                highlight_tfidfs.append(data['tfidf'])
                # Create label with term and TF-IDF
                label = f"{term}\n(TF-IDF: {data['tfidf']:.3f})"
                highlight_labels.append(label)
        
        if highlight_ranks:
            # Color code by TF-IDF score
            scatter = ax.scatter(
                highlight_ranks, 
                highlight_freqs, 
                c=highlight_tfidfs,
                cmap='YlOrRd',
                s=100,
                edgecolors='black',
                linewidths=1,
                alpha=0.8,
                label='Highlighted terms',
                zorder=5
            )
            
            # Add colorbar for TF-IDF scores
            cbar = plt.colorbar(scatter, ax=ax)
            cbar.set_label('TF-IDF Score', fontsize=11)
            
            # Add labels with smart positioning to avoid overlap
            # Use adjustText library if available, otherwise basic positioning
            try:
                from adjustText import adjust_text
                texts = []
                for rank, freq, label in zip(highlight_ranks, highlight_freqs, highlight_labels):
                    txt = ax.annotate(
                        label,
                        (rank, freq),
                        fontsize=7,
                        bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', alpha=0.8)
                    )
                    texts.append(txt)
                # Adjust text positions to avoid overlap
                adjust_text(texts, arrowprops=dict(arrowstyle='-', color='gray', lw=0.5))
            except ImportError:
                # Fallback: simple positioning with offsets
                for idx, (rank, freq, label) in enumerate(zip(highlight_ranks, highlight_freqs, highlight_labels)):
                    # Alternate offset directions to reduce overlap
                    if idx % 4 == 0:
                        xytext = (15, 10)
                    elif idx % 4 == 1:
                        xytext = (-50, 10)
                    elif idx % 4 == 2:
                        xytext = (15, -25)
                    else:
                        xytext = (-50, -25)
                    
                    ax.annotate(
                        label,
                        (rank, freq),
                        xytext=xytext,
                        textcoords='offset points',
                        fontsize=7,
                        bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', alpha=0.8),
                        arrowprops=dict(arrowstyle='->', connectionstyle='arc3,rad=0.3', color='gray', lw=0.5)
                    )
        
        ax.set_xlabel('Rank (log scale)', fontsize=12, fontweight='bold')
        ax.set_ylabel('Frequency % (log scale)', fontsize=12, fontweight='bold')
        ax.set_title(f"Zipf's Law Distribution with {len(highlight_ranks)} Highlighted Terms\n(Color = TF-IDF Score)", 
                     fontsize=14, fontweight='bold')
        ax.grid(True, alpha=0.3, which='both', linestyle='--')
        ax.legend(loc='upper right', fontsize=10)
        
        plt.tight_layout()
        
        # Save plot
        zipf_plot_path = self.output_dir / filename
        plt.savefig(zipf_plot_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"✓ Saved Zipf's law plot with {len(highlight_ranks)} highlighted terms: {filename}")
    
    def _create_metadata_structure(
        self,
        enhanced_pages: List[Dict],
        enhanced_transitions: List[Dict],
        status: str = 'COMPLETE'
    ) -> Dict:
        """
        Create metadata structure (used for both temp and final saves).
        
        Args:
            enhanced_pages: List of enhanced page dictionaries
            enhanced_transitions: List of enhanced transition dictionaries
            status: 'IN_PROGRESS' or 'COMPLETE'
            
        Returns:
            Metadata dictionary
        """
        processing_time = time.time() - self.stats['start_time']
        
        return {
            'metadata': {
                'source_files': {
                    'tokenized_json': str(self.tokenized_json_path.name),
                    'original_combined_txt': str(self.original_combined_txt_path.name),
                    'original_metadata_json': str(self.original_metadata_json_path.name)
                },
                'embedding_model': self.embedding_model,
                'embedding_dimensions': self.embedding_dimensions,
                'total_pages': len(enhanced_pages),
                'total_chunks': sum(len(p['chunks']) for p in enhanced_pages),
                'total_transition_chunks': len(enhanced_transitions),
                'processing_date': datetime.now().isoformat(),
                'processing_time_seconds': round(processing_time, 2),
                'status': status
            },
            'processing_info': {
                'total_api_calls': self.stats['total_api_calls'],
                'total_tokens_embedded': self.stats['total_tokens_embedded'],
                'embedding_counts': dict(self.stats['embedding_counts']),
                'processing_time_seconds': round(processing_time, 2)
            },
            'pages': enhanced_pages,
            'transition_chunks': enhanced_transitions
        }
    
    def plot_zipf_analysis_with_specific_terms(
        self,
        uppercase_zipf: Dict,
        terms_zipf: Dict,
        uppercase_tfidf: Dict,
        terms_tfidf: Dict,
        highlight_terms: Set[str],
        title: str,
        filename: str
    ):
        """
        Create Zipf's law plot highlighting specific terms that made a cut.
        
        Args:
            uppercase_zipf: Zipf frequencies for uppercase
            terms_zipf: Zipf frequencies for terms
            uppercase_tfidf: TF-IDF scores for uppercase
            terms_tfidf: TF-IDF scores for terms
            highlight_terms: Set of terms to highlight
            title: Plot title
            filename: Output filename
        """
        print(f"  Generating {filename} with {len(highlight_terms)} highlighted terms...")
        
        # Combine and sort by frequency
        all_items = {}
        for term, freq in uppercase_zipf.items():
            tfidf_scores = uppercase_tfidf.get(term, [])
            max_tfidf = max((score for _, score in tfidf_scores), default=0.0)
            all_items[term] = {'freq': freq, 'type': 'uppercase', 'tfidf': max_tfidf}
        
        for term, freq in terms_zipf.items():
            tfidf_scores = terms_tfidf.get(term, [])
            max_tfidf = max((score for _, score in tfidf_scores), default=0.0)
            all_items[term] = {'freq': freq, 'type': 'term', 'tfidf': max_tfidf}
        
        # Sort by frequency descending
        sorted_items = sorted(all_items.items(), key=lambda x: x[1]['freq'], reverse=True)
        
        if not sorted_items:
            print("No items to plot")
            return
        
        # Prepare data
        ranks = list(range(1, len(sorted_items) + 1))
        frequencies = [item[1]['freq'] for item in sorted_items]
        
        # Create figure
        fig, ax = plt.subplots(figsize=(16, 10))
        
        # Plot all points
        ax.loglog(ranks, frequencies, 'o', alpha=0.3, markersize=3, color='lightgray', label='All terms')
        
        # Highlight specific terms
        highlight_ranks = []
        highlight_freqs = []
        highlight_tfidfs = []
        highlight_labels = []
        
        for i, (term, data) in enumerate(sorted_items):
            if term in highlight_terms:
                highlight_ranks.append(i + 1)
                highlight_freqs.append(data['freq'])
                highlight_tfidfs.append(data['tfidf'])
                label = f"{term}\n(TF-IDF: {data['tfidf']:.3f})"
                highlight_labels.append(label)
        
        if highlight_ranks:
            # Color code by TF-IDF score
            scatter = ax.scatter(
                highlight_ranks,
                highlight_freqs,
                c=highlight_tfidfs,
                cmap='YlOrRd',
                s=100,
                edgecolors='black',
                linewidths=1,
                alpha=0.8,
                label=f'Terms that made cut ({len(highlight_ranks)})',
                zorder=5
            )
            
            # Add colorbar
            cbar = plt.colorbar(scatter, ax=ax)
            cbar.set_label('TF-IDF Score', fontsize=11)
        
        ax.set_xlabel('Rank (log scale)', fontsize=12, fontweight='bold')
        ax.set_ylabel('Frequency % (log scale)', fontsize=12, fontweight='bold')
        ax.set_title(title, fontsize=14, fontweight='bold')
        ax.grid(True, alpha=0.3, which='both', linestyle='--')
        ax.legend(loc='upper right', fontsize=10)
        
        plt.tight_layout()
        
        # Save plot
        plot_path = self.output_dir / filename
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"  ✓ Saved: {filename}")
    
    def generate_final_metadata(self):
        """
        Main method to generate complete metadata with embeddings.
        
        Returns:
            Final metadata dictionary
        """
        print("="*80)
        print("RAG SYSTEM - FINAL METADATA GENERATION WITH EMBEDDINGS")
        print("="*80)
        print(f"\n📖 Source Files:")
        print(f"  • Tokenized JSON: {self.tokenized_json_path.name}")
        print(f"  • Original text: {self.original_combined_txt_path.name}")
        print(f"  • Original metadata: {self.original_metadata_json_path.name}")
        print(f"\n🎯 Configuration:")
        print(f"  • Model: {self.embedding_model}")
        print(f"  • Embedding dimensions: {self.embedding_dimensions}")
        print(f"  • Total pages: {len(self.tokenized_data['pages'])}")
        print(f"  • Total chunks: {sum(len(p['chunks']) for p in self.tokenized_data['pages'])}")
        print(f"  • Output directory: {self.output_dir}")
        print(f"\n⚙️  Embedding Rules - THREE LEVELS:")
        print(f"  • Questions: ALL")
        print(f"  • Exclamations: ALL")
        print(f"  • Level 1 (Full): ALL terms, text only, no embeddings")
        print(f"  • Level 2 (Moderate): Uppercase top 50 page-TF-IDF OR < 30% Zipf, Terms top 20 OR < 15% Zipf")
        print(f"  • Level 3 (Aggressive): Uppercase top 30 page-TF-IDF OR < 10% Zipf, Terms top 8 OR < 10% Zipf")
        print(f"  • Special categories: ALL (7 categories)")
        print("\n" + "="*80)
        
        # Step 1: Analyze terms (TF-IDF and Zipf's law)
        (uppercase_chunk_tfidf, uppercase_page_tfidf, uppercase_zipf,
         terms_chunk_tfidf, terms_page_tfidf, terms_zipf) = self.analyze_terms()
        
        # Step 2: Determine eligibility at THREE levels
        (eligible_uppercase_moderate, eligible_uppercase_aggressive,
         eligible_terms_moderate, eligible_terms_aggressive) = self.determine_embedding_eligibility(
            uppercase_chunk_tfidf,
            uppercase_page_tfidf,
            uppercase_zipf,
            terms_chunk_tfidf,
            terms_page_tfidf,
            terms_zipf
        )
        
        # Get special category terms
        special_terms = {
            term for term in terms_page_tfidf.keys()
            if term in self.term_to_category
        }
        
        # Step 3: Generate plots
        self.plot_tfidf_analysis(uppercase_page_tfidf, terms_page_tfidf)
        
        # Zipf plot with 40+ highlights showing TF-IDF scores (all terms)
        print("\nGenerating Zipf's law plot (all terms)...")
        self.plot_zipf_analysis(
            uppercase_zipf, 
            terms_zipf,
            uppercase_page_tfidf,
            terms_page_tfidf,
            num_highlights=40,
            filename='zipf_law_analysis_all.png'
        )
        
        # NEW: Zipf plot highlighting MODERATE cut terms
        print("\nGenerating Zipf's law plot (moderate cut)...")
        moderate_terms = eligible_uppercase_moderate | eligible_terms_moderate
        self.plot_zipf_analysis_with_specific_terms(
            uppercase_zipf,
            terms_zipf,
            uppercase_page_tfidf,
            terms_page_tfidf,
            highlight_terms=moderate_terms,
            title="Zipf's Law - Moderate Filtering (Top 50/20 TF-IDF OR <30%/15% Zipf)",
            filename='zipf_law_analysis_moderate.png'
        )
        
        # NEW: Zipf plot highlighting AGGRESSIVE cut terms
        print("\nGenerating Zipf's law plot (aggressive cut)...")
        aggressive_terms = eligible_uppercase_aggressive | eligible_terms_aggressive
        self.plot_zipf_analysis_with_specific_terms(
            uppercase_zipf,
            terms_zipf,
            uppercase_page_tfidf,
            terms_page_tfidf,
            highlight_terms=aggressive_terms,
            title="Zipf's Law - Aggressive Filtering (Top 30/8 TF-IDF OR <10% Zipf)",
            filename='zipf_law_analysis_aggressive.png'
        )
        
        # Step 4: Process pages and chunks
        print("\nProcessing pages and creating embeddings...")
        print(f"Total pages to process: {len(self.tokenized_data['pages'])}")
        print("-" * 80)
        
        enhanced_pages = []
        
        for idx, page_data in enumerate(self.tokenized_data['pages'], 1):
            page_num = page_data['page_number']
            num_chunks = len(page_data['chunks'])
            
            print(f"\n[Page {idx}/{len(self.tokenized_data['pages'])}] Processing page {page_num} ({num_chunks} chunks)...")
            
            # Find corresponding original page info
            original_page_info = next(
                (p for p in self.original_metadata['pages'] if p['page_number'] == page_num),
                {}
            )
            
            enhanced_page = self.process_page_embeddings(
                page_data,
                original_page_info,
                eligible_uppercase_moderate,
                eligible_uppercase_aggressive,
                eligible_terms_moderate,
                eligible_terms_aggressive,
                special_terms,
                uppercase_chunk_tfidf,
                uppercase_page_tfidf,
                uppercase_zipf,
                terms_chunk_tfidf,
                terms_page_tfidf,
                terms_zipf
            )
            
            enhanced_pages.append(enhanced_page)
            
            # Progress summary for this page
            print(f"  ✓ Page {page_num} complete: {num_chunks} chunks embedded")
            
            # INCREMENTAL SAVE: Save progress every 10 pages
            if idx % 10 == 0:
                print(f"\n  💾 Saving progress (every 10 pages)...")
                temp_metadata = self._create_metadata_structure(
                    enhanced_pages,
                    [],  # No transitions yet
                    status='IN_PROGRESS'
                )
                temp_path = self.output_dir / 'final_metadata_with_embeddings_TEMP.json'
                with open(temp_path, 'w', encoding='utf-8') as f:
                    json.dump(temp_metadata, f, indent=2, ensure_ascii=False)
                print(f"  ✓ Progress saved: {len(enhanced_pages)} pages so far")
        
        print(f"\n{'='*80}")
        print(f"✓ All {len(enhanced_pages)} pages processed!")
        print(f"{'='*80}")
        
        # Step 5: Process transition chunks
        print("\n" + "="*80)
        print("Processing transition chunks...")
        print(f"Total transition chunks: {len(self.tokenized_data.get('transition_chunks', []))}")
        print("-" * 80)
        
        enhanced_transitions = []
        
        for idx, trans_chunk in enumerate(self.tokenized_data.get('transition_chunks', []), 1):
            trans_chunk['chunk_id'] = f"transition_{trans_chunk['transition_pages'][0]}_{trans_chunk['transition_pages'][1]}"
            
            print(f"[{idx}/{len(self.tokenized_data['transition_chunks'])}] Processing transition {trans_chunk['transition_pages'][0]} → {trans_chunk['transition_pages'][1]}...")
            
            enhanced_trans = self.process_chunk_embeddings(
                trans_chunk,
                eligible_uppercase_moderate,  # Use moderate for chunks
                eligible_terms_moderate,       # Use moderate for chunks
                special_terms,
                uppercase_chunk_tfidf,
                uppercase_page_tfidf,
                uppercase_zipf,
                terms_chunk_tfidf,
                terms_page_tfidf,
                terms_zipf
            )
            
            enhanced_transitions.append(enhanced_trans)
        
        print(f"\n{'='*80}")
        print(f"✓ All {len(enhanced_transitions)} transition chunks processed!")
        print(f"{'='*80}")
        
        # Step 6: Add overlap tracking
        self.add_overlap_tracking(enhanced_pages, enhanced_transitions)
        
        # Step 7: Build final metadata structure using helper
        final_metadata = self._create_metadata_structure(
            enhanced_pages,
            enhanced_transitions,
            status='COMPLETE'
        )
        
        # Add embedding rules (detailed documentation)
        final_metadata['embedding_rules'] = {
            'model': self.embedding_model,
            'embedding_dimensions': self.embedding_dimensions,
            
            'chunk_creation': {
                'regular_chunk_size': 200,
                'transition_chunk_size': 300,
                'transition_composition': 'last 150 tokens page N + first 150 tokens page N+1'
            },
            
            'conditional_embedding_criteria': {
                'questions': {
                    'rule': 'embed ALL questions',
                    'method': 'individual sentence embeddings'
                },
                'exclamations': {
                    'rule': 'embed ALL exclamations',
                    'method': 'individual sentence embeddings'
                },
                'uppercase_non_initial': {
                    'rule': 'embed if (top 50 TF-IDF) OR (< 30% Zipf frequency)',
                    'tfidf_threshold': 'top 50',
                    'zipf_threshold': '< 30%',
                    'method': 'individual word embeddings with metadata'
                },
                'research_terms_non_special': {
                    'rule': 'embed if (top 20 TF-IDF) OR (< 15% Zipf frequency)',
                    'tfidf_threshold': 'top 20',
                    'zipf_threshold': '< 15%',
                    'method': 'term embeddings with metadata'
                },
                'research_terms_special_categories': {
                    'rule': 'embed ALL regardless of TF-IDF/Zipf',
                    'categories': list(self.special_categories),
                    'method': 'term embeddings with TF-IDF and Zipf metadata attached'
                }
            },
            
            'tfidf_calculation': {
                'corpus': 'all chunks',
                'formula': 'TF-IDF = (term_freq / total_terms_in_doc) × log(total_docs / docs_with_term)',
                'applied_to': ['uppercase_non_initial', 'research_terms']
            },
            
            'zipf_calculation': {
                'corpus': 'all chunks',
                'formula': 'frequency_percentage = (chunks_with_term / total_chunks) × 100',
                'applied_to': ['uppercase_non_initial', 'research_terms']
            }
        }
        
        return final_metadata
    
    def save_metadata(self, metadata: Dict):
        """
        Save final metadata to JSON file and remove temp file.
        
        Args:
            metadata: Final metadata dictionary
        """
        output_path = self.output_dir / 'final_metadata_with_embeddings.json'
        
        print(f"\nSaving final metadata to: {output_path}")
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        print(f"✓ Saved: {output_path.name}")
        print(f"  File size: {output_path.stat().st_size / (1024*1024):.2f} MB")
        
        # Remove temp file if it exists
        temp_path = self.output_dir / 'final_metadata_with_embeddings_TEMP.json'
        if temp_path.exists():
            temp_path.unlink()
            print(f"  Removed temporary file: {temp_path.name}")
    
    def run(self):
        """
        Run the complete pipeline.
        
        Returns:
            Final metadata dictionary
        """
        try:
            # Generate metadata
            metadata = self.generate_final_metadata()
            
            # Save to file
            self.save_metadata(metadata)
            
            # Print summary
            print("\n" + "="*80)
            print("PROCESSING COMPLETE!")
            print("="*80)
            
            # Calculate estimated cost
            cost_per_1m_tokens = 0.13  # text-embedding-3-large
            estimated_cost = (self.stats['total_tokens_embedded'] / 1_000_000) * cost_per_1m_tokens
            
            print(f"\n📊 API Usage:")
            print(f"  Total API calls: {self.stats['total_api_calls']:,}")
            print(f"  Total tokens embedded: {self.stats['total_tokens_embedded']:,}")
            print(f"  Estimated cost: ${estimated_cost:.2f} USD")
            
            print(f"\n✨ Embeddings Created:")
            print(f"  Total: {sum(self.stats['embedding_counts'].values()):,}")
            for desc, count in sorted(self.stats['embedding_counts'].items(), key=lambda x: x[1], reverse=True):
                print(f"    • {desc}: {count:,}")
            
            print(f"\n⏱️  Performance:")
            print(f"  Processing time: {metadata['processing_info']['processing_time_seconds']:.1f}s ({metadata['processing_info']['processing_time_seconds']/60:.1f} min)")
            print(f"  Average time per API call: {metadata['processing_info']['processing_time_seconds']/self.stats['total_api_calls']:.2f}s")
            
            print(f"\n📁 Output Files:")
            print(f"  • {self.output_dir}/final_metadata_with_embeddings.json")
            print(f"  • {self.output_dir}/tfidf_analysis.png")
            print(f"  • {self.output_dir}/zipf_law_analysis_all.png")
            print(f"  • {self.output_dir}/zipf_law_analysis_moderate.png")
            print(f"  • {self.output_dir}/zipf_law_analysis_aggressive.png")
            
            print("\n" + "="*80)
            print("🎉 Your RAG system data is ready!")
            print("="*80)
            
            return metadata
        
        except Exception as e:
            print(f"\nError during processing: {e}")
            import traceback
            traceback.print_exc()
            raise


def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Generate final metadata with embeddings for RAG system'
    )
    parser.add_argument(
        'tokenized_json',
        help='Path to tokenized metadata JSON'
    )
    parser.add_argument(
        'original_combined_txt',
        help='Path to original combined text file'
    )
    parser.add_argument(
        'original_metadata_json',
        help='Path to original PDF parser metadata JSON'
    )
    parser.add_argument(
        '--output-dir', '-o',
        help='Output directory',
        default=None
    )
    parser.add_argument(
        '--api-key',
        help='OpenAI API key (or set OPENAI_API_KEY env variable)',
        default=None
    )
    
    args = parser.parse_args()
    
    try:
        generator = EmbeddingMetadataGenerator(
            args.tokenized_json,
            args.original_combined_txt,
            args.original_metadata_json,
            output_dir=args.output_dir,
            openai_api_key=args.api_key
        )
        
        generator.run()
        
    except Exception as e:
        print(f"Error: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())