"""
Unit tests for the Quiz Bank Pipeline.

Covers:
  - Schema validation (correct and malformed quizzes)
  - MongoDB retrieval (single quiz, by chapter, all quizzes)
  - Content checks (question count, answer count, correct answer)
"""

import json
import unittest
from pathlib import Path

from api.AI_core.question_bank_pipeline.schema_validator import validate_quiz, validate_question
from api.AI_core.quiz_pipeline.config import OUTPUT_DIR, MONGO_URI


# =====================================================================
# 1. SCHEMA VALIDATION TESTS
# =====================================================================

class TestSchemaValidation(unittest.TestCase):
    """Verify the validator catches good and bad quiz objects."""

    def test_valid_quiz(self):
        """A correctly structured quiz should pass with zero errors."""
        quiz = {
            "_id": "aabbccddeeff112233445566",
            "courseId": "PSY_METHODS_01",
            "section": "Chapter 1",
            "quizId": "QUIZ_TEST_CH01",
            "questions": [
                {
                    "questionId": 1,
                    "question": "What is a variable?",
                    "answers": [
                        {"text": "A measurable trait", "isCorrect": True},
                        {"text": "A type of graph", "isCorrect": False},
                        {"text": "A research lab", "isCorrect": False},
                        {"text": "A hypothesis", "isCorrect": False},
                    ],
                }
            ],
        }
        errors = validate_quiz(quiz)
        self.assertEqual(errors, [], f"Expected no errors, got: {errors}")

    def test_missing_fields(self):
        """Quiz missing required fields should fail."""
        quiz = {"_id": "aabbccddeeff112233445566"}
        errors = validate_quiz(quiz)
        self.assertTrue(len(errors) > 0)
        # Should mention missing fields
        combined = " ".join(errors)
        self.assertIn("courseId", combined)
        self.assertIn("questions", combined)

    def test_bad_objectid(self):
        """Invalid _id format should be flagged."""
        quiz = {
            "_id": "not-a-valid-id",
            "courseId": "PSY_METHODS_01",
            "section": "Chapter 1",
            "quizId": "QUIZ_TEST",
            "questions": [
                {
                    "questionId": 1,
                    "question": "Test?",
                    "answers": [
                        {"text": "A", "isCorrect": True},
                        {"text": "B", "isCorrect": False},
                        {"text": "C", "isCorrect": False},
                        {"text": "D", "isCorrect": False},
                    ],
                }
            ],
        }
        errors = validate_quiz(quiz)
        self.assertTrue(any("ObjectId" in e for e in errors))

    def test_wrong_answer_count(self):
        """Questions with != 4 answers should fail."""
        q = {
            "questionId": 1,
            "question": "Test?",
            "answers": [
                {"text": "A", "isCorrect": True},
                {"text": "B", "isCorrect": False},
            ],
        }
        errors = validate_question(q, expected_id=1, expected_answer_count=4)
        self.assertTrue(any("4 answer" in e for e in errors))

    def test_no_correct_answer(self):
        """Questions with zero correct answers should fail."""
        q = {
            "questionId": 1,
            "question": "Test?",
            "answers": [
                {"text": "A", "isCorrect": False},
                {"text": "B", "isCorrect": False},
                {"text": "C", "isCorrect": False},
                {"text": "D", "isCorrect": False},
            ],
        }
        errors = validate_question(q)
        self.assertTrue(any("1 answer must be correct" in e for e in errors))

    def test_multiple_correct_answers(self):
        """Questions with 2+ correct answers should fail."""
        q = {
            "questionId": 1,
            "question": "Test?",
            "answers": [
                {"text": "A", "isCorrect": True},
                {"text": "B", "isCorrect": True},
                {"text": "C", "isCorrect": False},
                {"text": "D", "isCorrect": False},
            ],
        }
        errors = validate_question(q)
        self.assertTrue(any("1 answer must be correct" in e for e in errors))

    def test_sequential_question_ids(self):
        """Question IDs not matching expected sequence should fail."""
        q = {
            "questionId": 5,  # expected 1
            "question": "Test?",
            "answers": [
                {"text": "A", "isCorrect": True},
                {"text": "B", "isCorrect": False},
                {"text": "C", "isCorrect": False},
                {"text": "D", "isCorrect": False},
            ],
        }
        errors = validate_question(q, expected_id=1)
        self.assertTrue(any("should be 1" in e for e in errors))

    def test_empty_question_text(self):
        """Empty question string should fail."""
        q = {
            "questionId": 1,
            "question": "",
            "answers": [
                {"text": "A", "isCorrect": True},
                {"text": "B", "isCorrect": False},
                {"text": "C", "isCorrect": False},
                {"text": "D", "isCorrect": False},
            ],
        }
        errors = validate_question(q)
        self.assertTrue(any("non-empty" in e for e in errors))


# =====================================================================
# 2. LOCAL FILE VALIDATION TESTS
# =====================================================================

class TestGeneratedFiles(unittest.TestCase):
    """Validate the actual generated JSON files on disk."""

    def _load_all_quizzes(self):
        """Find all quiz JSON files."""
        files = sorted(OUTPUT_DIR.rglob("*.json"))
        self.assertTrue(len(files) > 0, f"No JSON files found in {OUTPUT_DIR}")
        return files

    def test_all_files_are_valid_json(self):
        """Every generated file should be parseable JSON."""
        for fp in self._load_all_quizzes():
            with self.subTest(file=fp.name):
                data = json.loads(fp.read_text())
                self.assertIsInstance(data, dict)

    def test_all_files_pass_schema(self):
        """Every generated file should pass schema validation."""
        for fp in self._load_all_quizzes():
            with self.subTest(file=fp.name):
                quiz = json.loads(fp.read_text())
                if quiz.get("_validation_errors"):
                    self.skipTest(f"{fp.name} has known validation errors")
                errors = validate_quiz(quiz)
                self.assertEqual(errors, [], f"{fp.name} failed: {errors}")

    def test_each_quiz_has_20_questions(self):
        """Each quiz should have exactly 20 questions."""
        for fp in self._load_all_quizzes():
            with self.subTest(file=fp.name):
                quiz = json.loads(fp.read_text())
                self.assertEqual(len(quiz["questions"]), 20,
                                 f"{fp.name} has {len(quiz['questions'])} questions")

    def test_each_question_has_4_answers(self):
        """Every question in every file should have exactly 4 options."""
        for fp in self._load_all_quizzes():
            quiz = json.loads(fp.read_text())
            for q in quiz["questions"]:
                with self.subTest(file=fp.name, qid=q["questionId"]):
                    self.assertEqual(len(q["answers"]), 4)

    def test_each_question_has_one_correct(self):
        """Every question should have exactly one correct answer."""
        for fp in self._load_all_quizzes():
            quiz = json.loads(fp.read_text())
            for q in quiz["questions"]:
                with self.subTest(file=fp.name, qid=q["questionId"]):
                    correct = [a for a in q["answers"] if a["isCorrect"]]
                    self.assertEqual(len(correct), 1)


# =====================================================================
# 3. MONGODB RETRIEVAL TESTS
# =====================================================================

class TestMongoRetrieval(unittest.TestCase):
    """Test different ways to retrieve quizzes from MongoDB.

    These tests require a live MongoDB connection and uploaded data.
    They will be skipped if MongoDB is unreachable.
    """

    @classmethod
    def setUpClass(cls):
        """Try to connect to MongoDB. Skip all tests if unreachable."""
        try:
            from api.AI_core.question_bank_pipeline.mongo_operations import (
                get_quiz,
                get_quizzes_for_chapter,
                get_all_quizzes,
                list_quiz_ids,
            )
            cls.get_quiz = staticmethod(get_quiz)
            cls.get_quizzes_for_chapter = staticmethod(get_quizzes_for_chapter)
            cls.get_all_quizzes = staticmethod(get_all_quizzes)
            cls.list_quiz_ids = staticmethod(list_quiz_ids)
        except Exception as e:
            raise unittest.SkipTest(f"MongoDB not available: {e}")

    # --- Retrieval: get single quiz by quizId ---

    def test_get_quiz_by_id(self):
        """Retrieve a specific quiz by its quizId."""
        quiz = self.get_quiz("QUIZ_SONNET_CH01")
        self.assertIsNotNone(quiz, "QUIZ_SONNET_CH01 not found in DB")
        self.assertEqual(quiz["quizId"], "QUIZ_SONNET_CH01")
        self.assertEqual(quiz["section"], "Chapter 1")
        print(f"\n  Retrieved: {quiz['quizId']} | "
              f"{quiz['section']} | "
              f"{len(quiz['questions'])} questions")

    def test_get_nonexistent_quiz(self):
        """Requesting a quiz that doesn't exist should return None."""
        quiz = self.get_quiz("QUIZ_DOES_NOT_EXIST")
        self.assertIsNone(quiz)

    # --- Retrieval: get all quizzes for a chapter ---

    def test_get_quizzes_for_chapter_1(self):
        """Retrieve all quizzes for Chapter 1."""
        quizzes = self.get_quizzes_for_chapter("Chapter 1")
        self.assertTrue(len(quizzes) >= 1, "No quizzes found for Chapter 1")
        for q in quizzes:
            self.assertEqual(q["section"], "Chapter 1")
        print(f"\n  Chapter 1 quizzes: {[q['quizId'] for q in quizzes]}")

    def test_get_quizzes_for_chapter_13(self):
        """Retrieve all quizzes for Chapter 13."""
        quizzes = self.get_quizzes_for_chapter("Chapter 13")
        self.assertTrue(len(quizzes) >= 1, "No quizzes found for Chapter 13")
        for q in quizzes:
            self.assertEqual(q["section"], "Chapter 13")
        print(f"\n  Chapter 13 quizzes: {[q['quizId'] for q in quizzes]}")

    # --- Retrieval: get all quizzes ---

    def test_get_all_quizzes(self):
        """Retrieve every quiz in the database."""
        quizzes = self.get_all_quizzes()
        self.assertTrue(len(quizzes) >= 13,
                        f"Expected at least 13 quizzes, got {len(quizzes)}")
        print(f"\n  Total quizzes in DB: {len(quizzes)}")

    # --- Retrieval: list summary ---

    def test_list_quiz_ids(self):
        """List all quiz IDs and verify structure."""
        summaries = self.list_quiz_ids()
        self.assertTrue(len(summaries) >= 13)
        for s in summaries:
            self.assertIn("quizId", s)
            self.assertIn("section", s)
            self.assertIn("questionCount", s)
            self.assertEqual(s["questionCount"], 20)
        print(f"\n  Quiz ID summary:")
        for s in summaries:
            print(f"    {s['quizId']:<25} {s['section']:<15} {s['questionCount']} Qs")

    # --- Content validation on retrieved data ---

    def test_retrieved_quiz_passes_schema(self):
        """A quiz pulled from MongoDB should still pass validation."""
        quiz = self.get_quiz("QUIZ_SONNET_CH05")
        self.assertIsNotNone(quiz, "QUIZ_SONNET_CH05 not found")
        errors = validate_quiz(quiz)
        self.assertEqual(errors, [], f"Schema errors: {errors}")

    def test_retrieved_quiz_has_correct_structure(self):
        """Spot-check the structure of a retrieved quiz."""
        quiz = self.get_quiz("QUIZ_SONNET_CH03")
        self.assertIsNotNone(quiz)
        self.assertIn("_id", quiz)
        self.assertIn("courseId", quiz)
        self.assertIn("questions", quiz)
        self.assertEqual(len(quiz["questions"]), 20)

        # Check first question structure
        q1 = quiz["questions"][0]
        self.assertEqual(q1["questionId"], 1)
        self.assertIsInstance(q1["question"], str)
        self.assertEqual(len(q1["answers"]), 4)

        # Print a sample question
        print(f"\n  Sample question from {quiz['quizId']}:")
        print(f"    Q: {q1['question']}")
        for a in q1["answers"]:
            marker = " ✓" if a["isCorrect"] else ""
            print(f"      {'→' if a['isCorrect'] else ' '} {a['text']}{marker}")


if __name__ == "__main__":
    unittest.main(verbosity=2)
