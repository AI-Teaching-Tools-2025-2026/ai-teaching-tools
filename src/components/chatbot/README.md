# AI Tutor — Chatbot Feature

Configurable AI chatbot that lets instructors build custom AI teaching assistants for their courses, grounded in actual textbook content.

## How It Works

### Instructor Side (Config)
1. Navigate to any course → **AI Tutor** in the sidebar
2. Choose a persona preset (Socratic Tutor, Study Buddy, Quiz Master, Strict Professor) or write a custom system prompt
3. Set topic focus (e.g. "Chapter 1-3"), restrictions, welcome message, and temperature
4. Click **Activate** to make it live, or **Save Draft** to keep editing
5. Click **Preview** to test the chatbot as a student would see it

### Student Side (Chat)
1. Opens the chatbot → sees the instructor's configured bot name and welcome message
2. Asks a question → backend loads the relevant textbook chapter(s) and injects them into the AI context
3. AI responds using actual textbook content, not just general knowledge

### Textbook Integration
- Chapter `.txt` files live in `AI_core/quiz_pipeline/textbook_chapters/`
- When a student mentions "chapter 5" (or the instructor's config specifies chapters), the backend reads the raw text and passes it to OpenAI as reference material
- Max 3 chapters loaded per request (~30K chars each) to stay within context limits
- Same textbook files the quiz pipeline uses — no duplication

## File Structure

```
src/
├── app/courses/[courseId]/chatbot/
│   ├── page.tsx              # Instructor config page
│   └── preview/page.tsx      # Chat preview (what students see)
├── components/chatbot/
│   └── ChatInterface.tsx     # Chat UI component
└── types/
    └── chatbot.ts            # TypeScript interfaces

backend/modules/chatbot/
├── __init__.py
├── models.py                 # Pydantic request/response models
└── routes.py                 # /chatbot/config, /chatbot/chat, /chatbot/chapters
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/chatbot/config/{courseId}` | Fetch saved config for a course |
| POST | `/chatbot/config` | Create or update chatbot config |
| GET | `/chatbot/chapters` | List available textbook chapters |
| POST | `/chatbot/chat` | Send message and get AI response |

## Config (stored in MongoDB `chatbot_configs` collection)

```json
{
  "courseId": "COURSE001",
  "botName": "Study Buddy",
  "persona": "Study Buddy",
  "systemPrompt": "You are a friendly study buddy...",
  "topics": "Chapter 1-3",
  "restrictions": "Do not give direct homework answers",
  "welcomeMessage": "Hey! Ready to study?",
  "temperature": 0.8,
  "status": "active"
}
```

## Environment Variables

Requires in `.env`:
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```
