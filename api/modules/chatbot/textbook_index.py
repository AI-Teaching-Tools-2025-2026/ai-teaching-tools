from __future__ import annotations
import hashlib
import json
import math
from pathlib import Path
from typing import Any
import httpx

from configs.settings import settings
from AI_core.question_bank_pipeline.pdfParser import pdfParser

CACHE_DIR = Path("/tmp/chatbot_textbook_cache")
CACHE_DIR.mkdir(exist_ok=True, parents=True)

EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_URL = "https://api.openai.com/v1/embeddings"
CHUNK_CHAR_SIZE = 1500
CHUNK_OVERLAP = 200
EMBEDDING_BATCH_SIZE = 100

_INDEX_CACHE: dict[str, dict[str, Any]] = {}


def _chunk_text(text: str, chunk_size: int = CHUNK_CHAR_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    text = text.strip()
    if not text:
        return []

    chunks: list[str] = []
    start = 0

    while start < len(text):
        end = min(start + chunk_size, len(text))

        # try to break on sentence boundary
        if end < len(text):
            sentence_end = text.rfind(".", end - 300, end)
            if sentence_end > start:
                end = sentence_end + 1

        piece = text[start:end].strip()
        if piece:
            chunks.append(piece)

        if end >= len(text):
            break
        start = end - overlap

    return chunks


async def _embed_batch(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    if not settings.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not set")

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            EMBEDDING_URL,
            headers={
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={"model": EMBEDDING_MODEL, "input": texts},
        )
        response.raise_for_status()
        data = response.json()
        items = sorted(data["data"], key=lambda x: x["index"])
        return [item["embedding"] for item in items]


def _cosine(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(x * x for x in b))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


def _cache_path_for(file_path: str) -> Path:
    h = hashlib.md5(file_path.encode("utf-8")).hexdigest()[:12]
    return CACHE_DIR / f"index_{h}.json"


async def get_or_build_index(file_path: str) -> dict[str, Any]:
    # check memory
    if file_path in _INDEX_CACHE:
        return _INDEX_CACHE[file_path]

    # check disk
    cache_file = _cache_path_for(file_path)
    if cache_file.exists():
        try:
            with cache_file.open("r", encoding="utf-8") as f:
                index = json.load(f)
            _INDEX_CACHE[file_path] = index
            return index
        except (json.JSONDecodeError, OSError):
            pass  # fall through and rebuild

    # parse PDF using the team's parser, same as question bank generation
    parsed = pdfParser(file_path)
    textbook_name = parsed["textbookName"]
    chapters = parsed["chapters"]

    # chunk every chapter
    chunk_meta: list[dict[str, Any]] = []
    for chapter in chapters:
        for piece in _chunk_text(chapter.get("text", "")):
            chunk_meta.append({
                "chapterNum": chapter["chapterNum"],
                "chapterTitle": chapter["chapterTitle"],
                "text": piece,
            })

    # embed in batches
    for i in range(0, len(chunk_meta), EMBEDDING_BATCH_SIZE):
        batch = chunk_meta[i:i + EMBEDDING_BATCH_SIZE]
        embeddings = await _embed_batch([c["text"] for c in batch])
        for chunk, emb in zip(batch, embeddings):
            chunk["embedding"] = emb

    index = {"textbookName": textbook_name, "chunks": chunk_meta}

    # save to disk
    try:
        with cache_file.open("w", encoding="utf-8") as f:
            json.dump(index, f)
    except OSError:
        pass

    _INDEX_CACHE[file_path] = index
    return index


async def retrieve_relevant_chunks(index: dict[str, Any], query: str, k: int = 5) -> list[dict[str, Any]]:
    chunks = index.get("chunks", [])
    if not chunks or not query.strip():
        return []

    query_emb = (await _embed_batch([query]))[0]
    scored = [(_cosine(query_emb, c["embedding"]), c) for c in chunks]
    scored.sort(key=lambda pair: pair[0], reverse=True)

    return [
        {
            "chapterNum": c["chapterNum"],
            "chapterTitle": c["chapterTitle"],
            "text": c["text"],
            "score": round(score, 4),
        }
        for score, c in scored[:k]
    ]


async def get_pdf_path_for_course(course_id: str, db) -> str | None:
    # look up the textbook PDF the same way the team stores it: question_banks.sourceFile
    qb = await db["question_banks"].find_one(
        {"courseID": course_id},
        sort=[("lastModified", -1)],
    )
    return qb.get("sourceFile") if qb else None


def format_chunks_for_prompt(chunks: list[dict[str, Any]]) -> str:
    if not chunks:
        return ""

    parts = ["TEXTBOOK REFERENCE MATERIAL"]
    parts.append("Use the following passages from the course textbook to answer the student's "
                 "questions accurately. Reference the chapter when relevant. If the answer is not "
                 "in these passages, say so and offer what you can.\n")

    for i, chunk in enumerate(chunks, start=1):
        parts.append(f"--- Passage {i} (Chapter {chunk['chapterNum']}: {chunk['chapterTitle']}) ---")
        parts.append(chunk["text"])
        parts.append("")

    return "\n".join(parts)