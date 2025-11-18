# Information retrieval pipeline setup - Complete Documentation

## Overview

Complete pipeline for transforming PDF textbooks into RAG-ready embeddings with metadata. Four-stage process: PDF parsing, tokenization, embedding generation, and AI summarization.

---

## System Architecture

```
Input: PDF textbook
  |
  v
[1] PDF Parser (pdf_parser.py)
  |
  v
Combined text + Metadata JSON
  |
  v
[2] Tokenization (tokenize_and_chunk_lemmatized.py)
  |
  v
Tokenized chunks + Research terms
  |
  v
[3] Embeddings (create_embeddings_metadata.py)
  |
  v
Final metadata with 3-level embeddings
  |
  v
[4] Page Summaries (generate_page_summaries.py)
```

---

## Stage 1: PDF Parser

**Purpose:** Extract text, images, links, and metadata from PDF textbooks.

**Command:**
```bash
python pdf_parser.py input.pdf --output-dir Materials/parsed
```

**Input:**
- PDF file (any size, tested up to 500 pages)

**Output:**
```
Materials/parsed/
├── textbook_combined.txt          # Page-separated text
├── textbook_metadata.json         # Per-page metadata
└── images/                        # Extracted images
    ├── page_1_img_0.png
    └── page_2_img_0.png
```

**Metadata Structure:**
```json
{
  "total_pages": 446,
  "pages": [
    {
      "page_number": 1,
      "word_count": 342,
      "non_word_count": 28,
      "links": [{"text": "Chapter 2", "url": "page://12"}],
      "images": [{"bbox": [100, 200, 300, 400], "size": [200, 200]}],
      "top_word_pairs": [["research", "methods"], ["statistical", "analysis"]]
    }
  ]
}
```

---

## Stage 2: Tokenization & Research Term Extraction

**Purpose:** Split text into 200-token chunks, extract research terms, identify questions/exclamations.

**Command:**
```bash
python tokenize_and_chunk_lemmatized.py \
    Materials/parsed/textbook_combined.txt \
    Materials/parsed/textbook_metadata.json \
    --output-dir Materials/tokenized
```

**Input:**
- Combined text file (from Stage 1)
- Metadata JSON (from Stage 1)

**Output:**
```json
{
  "total_pages": 446,
  "total_chunks": 1471,
  "pages": [
    {
      "page_number": 1,
      "chunks": [
        {
          "chunk_id": "page_1_chunk_0",
          "chunk_text": "Research methods in psychology involve...",
          "token_count": 200,
          "questions": ["What is a hypothesis?"],
          "exclamations": ["This is critical!"],
          "uppercase_non_initial": ["ANOVA", "Freud"],
          "research_terms_found": ["hypothesis", "p-value", "correlation"]
        }
      ]
    }
  ],
  "transition_chunks": [
    {
      "transition_pages": [1, 2],
      "chunk_text": "...last 150 tokens page 1 + first 150 tokens page 2...",
      "token_count": 300
    }
  ]
}
```

**Research Term Categories:**
- statistical_tests: t-test, ANOVA, chi-square, regression, ....
- experimental_design: randomization, counterbalancing, control group, ....
- measurement: reliability, validity, Cronbach's alpha, ....
- data_analysis: correlation, effect size, power analysis, ....
- sampling: random sampling, stratified sampling, ....
- ethics: IRB, informed consent, debriefing, ....
- cognitive_processes: memory, attention, perception, ....

---

## Stage 3: Embedding Generation with Multi-Level Filtering

**Purpose:** Generate OpenAI embeddings with TF-IDF and Zipf's law filtering at three levels.

**Command:**
```bash
export OPENAI_API_KEY="your-key"
python create_embeddings_metadata.py \
    Materials/tokenized/textbook_metadata_tokenized.json \
    Materials/parsed/textbook_combined.txt \
    Materials/parsed/textbook_metadata.json \
    --output-dir Materials/embeddings
```

**Input:**
- Tokenized JSON (from Stage 2)
- Combined text (from Stage 1)
- Original metadata (from Stage 1)

**Filtering Rules:**

| Level | Uppercase Terms | Research Terms | Has Embeddings |
|-------|----------------|----------------|----------------|
| Full | ALL | ALL | No (text only) |
| Moderate | Top 50 page-TF-IDF OR <30% Zipf | Top 20 page-TF-IDF OR <15% Zipf | Yes |
| Aggressive | Top 30 page-TF-IDF OR <10% Zipf | Top 8 page-TF-IDF OR <10% Zipf | Yes |

**TF-IDF Calculation:**
```
TF-IDF = (term_freq / total_terms) × log(total_docs / docs_with_term)

Chunk-level: documents = 1471 chunks (for chunk embeddings)
Page-level: documents = 446 pages (for page embeddings)
```

**Output Structure:**
```json
{
  "metadata": {
    "source_files": {
      "tokenized_json": "textbook_metadata_tokenized.json",
      "original_combined_txt": "textbook_combined.txt",
      "original_metadata_json": "textbook_metadata.json"
    },
    "embedding_model": "text-embedding-3-large",
    "embedding_dimensions": 3072,
    "total_pages": 446,
    "total_chunks": 1471,
    "total_transition_chunks": 445,
    "processing_date": "2025-11-17T...",
    "processing_time_seconds": 8942.3,
    "status": "COMPLETE"
  },
  
  "processing_info": {
    "total_api_calls": 15847,
    "total_tokens_embedded": 2450000,
    "embedding_counts": {
      "chunk": 1471,
      "page": 446,
      "transition_chunk": 445,
      "question": 3421,
      "exclamation": 892,
      "term: ANOVA": 1,
      "term: hypothesis": 1
    },
    "processing_time_seconds": 8942.3
  },
  
  "pages": [
    {
      "page_number": 45,
      "original_text": "Full text of page 45...",
      "text_length": 2341,
      "word_count": 342,
      "non_word_count": 28,
      "page_embedding": [0.012, -0.034, 0.056, ..., -0.023],
      
      "links": [
        {"text": "Chapter 2", "url": "page://12"},
        {"text": "https://example.com", "url": "https://example.com"}
      ],
      
      "images": [
        {
          "bbox": [100.5, 200.3, 300.7, 400.2],
          "size": [200, 200]
        }
      ],
      
      "top_10_word_pairs": [
        ["research", "methods"],
        ["statistical", "analysis"],
        ["null", "hypothesis"]
      ],
      
      "terms_full_list": {
        "uppercase_non_initial_all": ["ANOVA", "Freud", "Stanford", "Cohen", "Piaget"],
        "research_terms_all": ["hypothesis", "correlation", "p-value", "t-test", "reliability"]
      },
      
      "terms_moderate_filtering": {
        "uppercase_non_initial": [
          {
            "term": "ANOVA",
            "original_text": "ANOVA",
            "chunk_tfidf_score": 0.6542,
            "page_tfidf_score": 0.4235,
            "zipf_percentage": 12.2,
            "is_special_case": false,
            "embedding": [0.023, -0.045, 0.067, ..., 0.034]
          },
          {
            "term": "Freud",
            "original_text": "Freud",
            "chunk_tfidf_score": 0.3421,
            "page_tfidf_score": 0.2156,
            "zipf_percentage": 8.7,
            "is_special_case": false,
            "embedding": [...]
          }
        ],
        "research_terms": [
          {
            "term": "null hypothesis",
            "original_text": "null hypothesis",
            "chunk_tfidf_score": 0.7234,
            "page_tfidf_score": 0.5123,
            "zipf_percentage": 9.3,
            "is_special_case": true,
            "category": "statistical_tests",
            "embedding": [...]
          },
          {
            "term": "correlation",
            "original_text": "correlation",
            "chunk_tfidf_score": 0.5432,
            "page_tfidf_score": 0.3876,
            "zipf_percentage": 15.6,
            "is_special_case": false,
            "embedding": [...]
          }
        ]
      },
      
      "terms_aggressive_filtering": {
        "uppercase_non_initial": [
          {
            "term": "ANOVA",
            "original_text": "ANOVA",
            "chunk_tfidf_score": 0.6542,
            "page_tfidf_score": 0.4235,
            "zipf_percentage": 12.2,
            "is_special_case": false,
            "embedding": [...]
          }
        ],
        "research_terms": [
          {
            "term": "null hypothesis",
            "original_text": "null hypothesis",
            "chunk_tfidf_score": 0.7234,
            "page_tfidf_score": 0.5123,
            "zipf_percentage": 9.3,
            "is_special_case": true,
            "category": "statistical_tests",
            "embedding": [...]
          }
        ]
      },
      
      "questions": [
        {
          "text": "What is ANOVA?",
          "original_text": "What is ANOVA?",
          "embedding": [0.034, -0.012, 0.045, ..., -0.023]
        },
        {
          "text": "How do you interpret F-statistics?",
          "original_text": "How do you interpret F-statistics?",
          "embedding": [...]
        }
      ],
      
      "exclamations": [
        {
          "text": "This is critical for understanding statistical power!",
          "original_text": "This is critical for understanding statistical power!",
          "embedding": [0.056, -0.023, 0.078, ..., 0.012]
        }
      ],
      
      "chunks": [
        {
          "chunk_id": "page_45_chunk_0",
          "chunk_text": "ANOVA is a statistical test used to compare means...",
          "chunk_text_original": "ANOVA is a statistical test used to compare means...",
          "token_count": 200,
          "chunk_embedding": [0.045, -0.023, 0.067, ..., -0.034],
          
          "questions": [
            {
              "text": "What is ANOVA?",
              "original_text": "What is ANOVA?",
              "embedding": [...]
            }
          ],
          
          "exclamations": [
            {
              "text": "This is critical!",
              "original_text": "This is critical!",
              "embedding": [...]
            }
          ],
          
          "uppercase_non_initial": ["ANOVA", "Freud"],
          "uppercase_non_initial_embedded": [
            {
              "term": "ANOVA",
              "original_text": "ANOVA",
              "chunk_tfidf_score": 0.6542,
              "page_tfidf_score": 0.4235,
              "zipf_percentage": 12.2,
              "is_special_case": false,
              "embedding": [...]
            }
          ],
          
          "research_terms_found": ["hypothesis", "p-value", "correlation"],
          "research_terms_embedded": [
            {
              "term": "hypothesis",
              "original_text": "hypothesis",
              "chunk_tfidf_score": 0.5234,
              "page_tfidf_score": 0.3421,
              "zipf_percentage": 18.4,
              "is_special_case": false,
              "embedding": [...]
            },
            {
              "term": "null hypothesis",
              "original_text": "null hypothesis",
              "chunk_tfidf_score": 0.7234,
              "page_tfidf_score": 0.5123,
              "zipf_percentage": 9.3,
              "is_special_case": true,
              "category": "statistical_tests",
              "embedding": [...]
            }
          ]
        },
        {
          "chunk_id": "page_45_chunk_1",
          "chunk_text": "The F-statistic is calculated by...",
          "chunk_text_original": "The F-statistic is calculated by...",
          "token_count": 200,
          "chunk_embedding": [...],
          "questions": [...],
          "exclamations": [...],
          "uppercase_non_initial": [...],
          "uppercase_non_initial_embedded": [...],
          "research_terms_found": [...],
          "research_terms_embedded": [...]
        }
      ]
    }
  ],
  
  "transition_chunks": [
    {
      "chunk_id": "transition_45_46",
      "transition_pages": [45, 46],
      "chunk_text": "...last 150 tokens of page 45...first 150 tokens of page 46...",
      "chunk_text_original": "...last 150 tokens of page 45...first 150 tokens of page 46...",
      "token_count": 300,
      "chunk_embedding": [...],
      "questions": [...],
      "exclamations": [...],
      "uppercase_non_initial": [...],
      "uppercase_non_initial_embedded": [...],
      "research_terms_found": [...],
      "research_terms_embedded": [...],
      "overlaps_with": {
        "regular_chunks": ["page_45_chunk_3", "page_46_chunk_0"],
        "tokens_overlap": {
          "page_45_chunk_3": 150,
          "page_46_chunk_0": 150
        }
      }
    }
  ]
}
```

**Incremental Saving:**
- Saves every 10 pages to `final_metadata_with_embeddings_TEMP.json`
- Max loss on crash: 10 pages
- Final save: `final_metadata_with_embeddings.json` with status "COMPLETE"

**Visualization Outputs:**
- `tfidf_analysis.png` - TF-IDF bar charts for top terms
- `zipf_law_analysis_all.png` - All terms distribution
- `zipf_law_analysis_moderate.png` - Terms passing moderate filter
- `zipf_law_analysis_aggressive.png` - Terms passing aggressive filter

---

## Stage 4: AI-Powered Page Summaries

**Purpose:** Generate 150-word summaries per page using Claude Sonnet 4.5.

**Command:**
```bash
export ANTHROPIC_API_KEY="your-key"
python generate_page_summaries.py \
    Materials/parsed/textbook_combined.txt \
    --output-dir Materials/page_summaries \
    --batch-size 8
```
**Input:**
- Combined text file (from Stage 1)

**Output Structure:**
```json
{
  "metadata": {
    "model": "claude-sonnet-4-5",
    "total_pages": 446,
    "generation_date": "2025-11-17T..."
  },
  "page_summaries": [
    {
      "page_number": 45,
      "summary": "This page covers ANOVA (Analysis of Variance), explaining F-statistics, post-hoc tests, and effect size calculations. It distinguishes between one-way and factorial ANOVA designs, providing worked examples with interpretation guidelines. The content is unique in presenting specific decision trees for choosing appropriate post-hoc tests based on sample size and variance homogeneity. Key concepts include between-subjects design, within-subjects design, and mixed models.",
      "main_topics": ["ANOVA", "F-statistic", "Post-hoc tests", "Effect sizes"],
      "key_concepts": ["ANOVA", "F-ratio", "Tukey HSD", "Bonferroni", "effect size"],
      "methods_discussed": ["one-way ANOVA", "factorial ANOVA", "post-hoc tests"],
      "questions_answered": [
        "What is ANOVA?",
        "When should ANOVA be used?",
        "How do you interpret F-statistics?",
        "What are post-hoc tests?"
      ],
      "unique_information": "Provides decision trees for post-hoc test selection"
    }
  ]
}
```

**Incremental Saving:**
- Saves every batch to `page_summaries_claude_TEMP.json`
- Final save: `page_summaries_claude.json` with status "COMPLETE"
---

## Complete Pipeline Execution

```bash
# Stage 1: Parse PDF
python pdf_parser.py textbook.pdf --output-dir Materials/parsed

# Stage 2: Tokenize
python tokenize_and_chunk_lemmatized.py \
    Materials/parsed/textbook_combined.txt \
    Materials/parsed/textbook_metadata.json \
    --output-dir Materials/tokenized

# Stage 3: Generate embeddings
export OPENAI_API_KEY="your-key"
python create_embeddings_metadata.py \
    Materials/tokenized/textbook_metadata_tokenized.json \
    Materials/parsed/textbook_combined.txt \
    Materials/parsed/textbook_metadata.json \
    --output-dir Materials/embeddings

# Stage 4: Generate summaries
export ANTHROPIC_API_KEY="your-key"
python generate_page_summaries.py \
    Materials/parsed/textbook_combined.txt \
    --output-dir Materials/page_summaries \
    --batch-size 8
```

---

## File Structure

```
Materials/
├── parsed/
│   ├── textbook_combined.txt
│   ├── textbook_metadata.json
│   └── textbook_images/
├── tokenized/
│   └── textbook_metadata_tokenized.json
├── embeddings/
│   ├── final_metadata_with_embeddings.json
│   ├── tfidf_analysis.png
│   ├── zipf_law_analysis_all.png
│   ├── zipf_law_analysis_moderate.png
│   └── zipf_law_analysis_aggressive.png
└── page_summaries/
    └── page_summaries_claude.json
```

---

## Dependencies

```
PyMuPDF>=1.23.0
Pillow>=10.0.0
spacy>=3.0.0
openai>=1.0.0
scikit-learn>=1.0.0
matplotlib>=3.5.0
numpy>=1.21.0
adjustText>=0.8.0
anthropic>=0.39.0
```
