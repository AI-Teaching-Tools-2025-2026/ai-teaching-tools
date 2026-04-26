# Quiz Bank Generator Pipeline

Generates multiple-choice quiz questions from textbook chapters using the Anthropic Claude API, then stores them in MongoDB.

**How it works:** Each chapter's full `.txt` file is passed directly into the LLM's context window (no RAG, no embeddings). One API call per chapter = 20 questions. No cross-chapter content leaks.

## Setup

```bash
pip install anthropic pymongo[srv]

export ANTHROPIC_API_KEY="sk-ant-..."
export MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/?appName=..."
```

Put the 13 chapter files in `./textbook_chapters/`:
```
research_methods_in_psychology_chapter_01.txt
research_methods_in_psychology_chapter_02.txt
...
research_methods_in_psychology_chapter_13.txt
```

## Usage

```bash
# Generate quizzes (all chapters, both models)
python quiz_generator.py

# Just one model
python quiz_generator.py --model sonnet

# Just specific chapters
python quiz_generator.py --chapters 1 3 5

# Upload to MongoDB
python mongo_operations.py upload

# List what's in the DB
python mongo_operations.py list

# Get a specific quiz
python mongo_operations.py get QUIZ_SONNET_CH01

# Get all quizzes for a chapter
python mongo_operations.py chapter "Chapter 1"

# Delete a quiz
python mongo_operations.py delete QUIZ_SONNET_CH01

# Run tests
python test_pipeline.py
```

## Files

| File | What it does |
|------|-------------|
| `config.py` | All settings: models, paths, DB connection, question counts |
| `quiz_generator.py` | Reads chapters, calls Claude API, saves JSON files |
| `schema_validator.py` | Validates quiz objects against the tech spec schema |
| `mongo_operations.py` | Upload/retrieve/delete quizzes in MongoDB |
| `test_pipeline.py` | Unit tests for validation, file checks, and DB retrieval |

## Output Format

Each quiz is a MongoDB-ready JSON doc:

```json
{
  "_id": "a1b2c3d4e5f6a1b2c3d4e5f6",
  "courseId": "PSY_METHODS_01",
  "section": "Chapter 1",
  "quizId": "QUIZ_SONNET_CH01",
  "questions": [
    {
      "questionId": 1,
      "question": "What is the primary goal of the scientific method?",
      "answers": [
        { "text": "To confirm personal beliefs", "isCorrect": false },
        { "text": "To systematically observe and explain behavior", "isCorrect": true },
        { "text": "To replace common sense", "isCorrect": false },
        { "text": "To prove psychology is a science", "isCorrect": false }
      ]
    }
  ]
}
```

## Models

| Label | Model ID | Notes |
|-------|----------|-------|
| `opus` | `claude-opus-4-5-20251101` | Higher quality, slower, more expensive |
| `sonnet` | `claude-sonnet-4-5-20250929` | Faster, cheaper, still good |

Change these in `config.py` under `MODELS`.