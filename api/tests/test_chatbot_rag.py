import pytest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from modules.chatbot.textbook_index import _chunk_text, _cosine, format_chunks_for_prompt
from modules.chatbot.history_routes import _build_system_prompt


class TestChunkText:
    def test_empty_string(self):
        assert _chunk_text("") == []

    def test_short_text_one_chunk(self):
        text = "This is a short sentence."
        assert _chunk_text(text) == [text]

    def test_long_text_splits(self):
        text = ("This is sentence number one. " * 200).strip()
        chunks = _chunk_text(text, chunk_size=500, overlap=50)
        assert len(chunks) > 1
        for chunk in chunks:
            assert len(chunk) <= 600

    def test_chunks_overlap(self):
        text = "A. " + ("B. " * 200) + "C."
        chunks = _chunk_text(text, chunk_size=200, overlap=50)
        if len(chunks) > 1:
            total = sum(len(c) for c in chunks)
            assert total > len(text)


class TestCosine:
    def test_identical_vectors(self):
        assert _cosine([1.0, 0.0], [1.0, 0.0]) == pytest.approx(1.0)

    def test_orthogonal_vectors(self):
        assert _cosine([1.0, 0.0], [0.0, 1.0]) == pytest.approx(0.0)

    def test_opposite_vectors(self):
        assert _cosine([1.0, 0.0], [-1.0, 0.0]) == pytest.approx(-1.0)

    def test_zero_vector_returns_zero(self):
        assert _cosine([0.0, 0.0], [1.0, 1.0]) == 0.0


class TestFormatChunks:
    def test_no_chunks_returns_empty(self):
        assert format_chunks_for_prompt([]) == ""

    def test_includes_chapter_info(self):
        chunks = [
            {"chapterNum": "1", "chapterTitle": "Intro", "text": "psychology is..."},
            {"chapterNum": "2", "chapterTitle": "Methods", "text": "experiments are..."},
        ]
        result = format_chunks_for_prompt(chunks)
        assert "Chapter 1" in result
        assert "Intro" in result
        assert "Chapter 2" in result
        assert "Methods" in result
        assert "psychology is" in result
        assert "experiments are" in result


class TestBuildSystemPromptEnhanced:
    def test_default_prompt_no_config(self):
        prompt = _build_system_prompt(None, None, "")
        assert "AI teaching assistant" in prompt

    def test_uses_config_prompt(self):
        config = {"systemPrompt": "You are a Socratic tutor.", "topics": "", "restrictions": ""}
        prompt = _build_system_prompt(config, None, "")
        assert "Socratic tutor" in prompt
        assert "AI teaching assistant" not in prompt

    def test_includes_course_title(self):
        course = {"courseTitle": "Intro to Psych", "courseDescription": "A cool course"}
        prompt = _build_system_prompt(None, course, "")
        assert "Intro to Psych" in prompt
        assert "A cool course" in prompt

    def test_includes_restrictions(self):
        config = {"systemPrompt": "be helpful", "topics": "", "restrictions": "never give homework answers"}
        prompt = _build_system_prompt(config, None, "")
        assert "never give homework answers" in prompt

    def test_includes_passages_when_provided(self):
        passages = "TEXTBOOK REFERENCE MATERIAL\n--- Passage 1 ---\nResearch methods..."
        prompt = _build_system_prompt(None, None, passages)
        assert "TEXTBOOK REFERENCE MATERIAL" in prompt
        assert "Research methods" in prompt

    def test_no_passages_means_no_textbook_section(self):
        prompt = _build_system_prompt(None, None, "")
        assert "TEXTBOOK REFERENCE MATERIAL" not in prompt


if __name__ == "__main__":
    pytest.main([__file__, "-v"])