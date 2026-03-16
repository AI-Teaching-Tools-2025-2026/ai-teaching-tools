"""
Tests for the chatbot module.

Run with: python -m pytest tests/test_chatbot.py -v
(from the backend/ directory)
"""
import pytest
from pathlib import Path


# We import just the pure functions -- no FastAPI/DB dependencies needed
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from modules.chatbot.routes import (
    pick_relevant_chapters,
    build_system_prompt,
    get_available_chapters,
    load_chapter_text,
    TEXTBOOK_DIR,
)


# pick_relevant_chapters 

class TestPickRelevantChapters:

    FAKE_CHAPTERS = {1: Path("ch1.txt"), 2: Path("ch2.txt"), 3: Path("ch3.txt"), 
                     5: Path("ch5.txt"), 10: Path("ch10.txt")}

    def test_user_mentions_chapter(self):
        result = pick_relevant_chapters("explain chapter 2", self.FAKE_CHAPTERS)
        assert result == [2]

    def test_user_mentions_multiple_chapters(self):
        result = pick_relevant_chapters("compare chapter 1 and chapter 3", self.FAKE_CHAPTERS)
        assert result == [1, 3]

    def test_user_mentions_nonexistent_chapter(self):
        result = pick_relevant_chapters("chapter 99", self.FAKE_CHAPTERS)
        assert result == []

    def test_falls_back_to_config_topics(self):
        result = pick_relevant_chapters("what is ANOVA?", self.FAKE_CHAPTERS, "Chapter 5")
        assert result == [5]

    def test_config_range(self):
        result = pick_relevant_chapters("help me study", self.FAKE_CHAPTERS, "Chapter 1-3")
        assert result == [1, 2, 3]

    def test_user_message_takes_priority_over_config(self):
        result = pick_relevant_chapters("chapter 10 please", self.FAKE_CHAPTERS, "Chapter 1-3")
        assert result == [10]

    def test_no_chapter_reference_returns_empty(self):
        result = pick_relevant_chapters("what is psychology?", self.FAKE_CHAPTERS)
        assert result == []

    def test_case_insensitive(self):
        result = pick_relevant_chapters("CHAPTER 1", self.FAKE_CHAPTERS)
        assert result == [1]


# build_system_prompt 

class TestBuildSystemPrompt:

    def test_default_prompt_no_config(self):
        prompt = build_system_prompt(None, None, {})
        assert "AI teaching assistant" in prompt

    def test_uses_config_prompt(self):
        config = {"systemPrompt": "You are a Socratic tutor.", "topics": "", "restrictions": ""}
        prompt = build_system_prompt(config, None, {})
        assert "Socratic tutor" in prompt
        assert "AI teaching assistant" not in prompt

    def test_includes_course_title(self):
        course = {"courseTitle": "Intro to Psych", "courseDescription": "A cool course"}
        prompt = build_system_prompt(None, course, {})
        assert "Intro to Psych" in prompt
        assert "A cool course" in prompt

    def test_includes_restrictions(self):
        config = {"systemPrompt": "be helpful", "topics": "", 
                  "restrictions": "never give homework answers"}
        prompt = build_system_prompt(config, None, {})
        assert "never give homework answers" in prompt

    def test_includes_chapter_text(self):
        chapters = {1: "This is chapter 1 content about research methods."}
        prompt = build_system_prompt(None, None, chapters)
        assert "CHAPTER 1" in prompt
        assert "research methods" in prompt

    def test_multiple_chapters(self):
        chapters = {1: "Chapter 1 stuff", 3: "Chapter 3 stuff"}
        prompt = build_system_prompt(None, None, chapters)
        assert "CHAPTER 1" in prompt
        assert "CHAPTER 3" in prompt


# get_available_chapters 

class TestGetAvailableChapters:

    def test_finds_chapters_if_dir_exists(self):
        # this depends on the actual textbook files being present
        if TEXTBOOK_DIR.exists():
            chapters = get_available_chapters()
            assert len(chapters) > 0
            assert all(isinstance(k, int) for k in chapters.keys())
            assert all(isinstance(v, Path) for v in chapters.values())
        else:
            pytest.skip("textbook dir not found")

    def test_returns_empty_if_no_dir(self):
        # temporarily point at a nonexistent dir
        import modules.chatbot.routes as routes
        original = routes.TEXTBOOK_DIR
        routes.TEXTBOOK_DIR = Path("/tmp/definitely_does_not_exist_12345")
        result = routes.get_available_chapters()
        routes.TEXTBOOK_DIR = original
        assert result == {}


# load_chapter_text 

class TestLoadChapterText:

    def test_truncation(self, tmp_path):
        # write a big file
        big_file = tmp_path / "big_chapter.txt"
        big_file.write_text("x" * 50000)
        
        text = load_chapter_text(big_file, max_chars=1000)
        assert len(text) < 1100  # 1000 + truncation message
        assert "truncated" in text

    def test_small_file_not_truncated(self, tmp_path):
        small_file = tmp_path / "small_chapter.txt"
        small_file.write_text("hello world")
        
        text = load_chapter_text(small_file)
        assert text == "hello world"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
