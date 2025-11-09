# Contributing to AI-Enhanced Teaching Tools Platform
This section details how you can contribute to our project.

## Code of Conduct

This project is developed in collaboration with Oregon State University and AI Education Labs, Inc. We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and professional in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/ai-teaching-tools.git
   cd ai-teaching-tools
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/AI-Teaching-Tools-2025-2026/ai-teaching-tools.git
   ```

## Development Setup

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- Git
- Python 3
- pip

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```
   ```bash
   pip install -r requirements.txt
   ```

2. Set up environment variables (create a `.env` file in the backend folder):
   ```env
   # Add required environment variables here
   NEXT_PUBLIC_API_URL=your_api_url
   ```

3. Run the backend server (in the backend directory):
   ```bash
   python -m uvicorn main:app --reload 
   ```
   
4. Run the development server (in the root directory):
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Project Structure
```
ai-teaching-tools/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable React components
│   ├── lib/             # Utility functions and helpers
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
└── tests/              # Test files
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Branching & Workflow
- Default branch: main
- Branch naming: name/feature/description
- Simple feature-branch workflow and merge completed brances into main 

## Issues & Planning
- File issues in GitHub with a description of the problem with labels such as feature, bug, etc.
- Estimate effort roughly (e.g., small, medium, large)

## Commit Messages
- We’ll use short, descriptive commit messages following the Conventional Commits style for consistency and clarity. 
- Each message should state what was done (e.g., feat: add new assignment form or fix: update API call). 
- When relevant, we’ll reference related issues using the issue number in parentheses.

## Code Style, Linting & Formatting
- Linters: ESLint and Prettier
   - ESLint Config File: [eslint.config.mjs](https://github.com/AI-Teaching-Tools-2025-2026/ai-teaching-tools/blob/2654cd121aeca2871fb19697cbcdb551c3349f9d/eslint.config.mjs)
   - Prettier Config File: [.prettierrc](https://github.com/AI-Teaching-Tools-2025-2026/ai-teaching-tools/blob/2654cd121aeca2871fb19697cbcdb551c3349f9d/.prettierrc)
- Before commiting and/or as often as possible, run the following command from the root directory: `npx eslint . --fix`. This will automatically reformat your code according to the standards set in the config files

## Testing
- Testing guidelines TBD (pending partner input)

## Pull Requests & Reviews
- Refer to the [pull_request_template.md](https://github.com/AI-Teaching-Tools-2025-2026/ai-teaching-tools/blob/2654cd121aeca2871fb19697cbcdb551c3349f9d/pull_request_template.md) for the PR template
- PRs require at least one reviewer, who can determine based on Github's recommendation and a manual check whether or not to approve the change
   - If a reviewer is unsure whether or not to approve a change, they should contact the rest of the team for feedback
- When a PR needs immediate review, the team member who authored it should ping the rest of the team via the Discord server

## CI/CD
- CI/CD guidelines TBD (pending partner input)

## Security & Secrets
- Secrets should never be hard-coded into code, they should be stored in in .env, which should never be pushed to the Github repo since it is in the [.gitignore](https://github.com/AI-Teaching-Tools-2025-2026/ai-teaching-tools/blob/2654cd121aeca2871fb19697cbcdb551c3349f9d/.gitignore)
- If a vulnerability is discovered, alert the team immediately, who will then decide if escalation to the partner is necessary or if it can be handled internally 

## Documentation Expectations
- If any changes are made to the code that affect the setup process, those changes should be documented in the [README.md](https://github.com/AI-Teaching-Tools-2025-2026/ai-teaching-tools/blob/2654cd121aeca2871fb19697cbcdb551c3349f9d/README.md) file as soon as possible (ideally, they should accompany the PR)
- Comments should be meaningful and as detailed as possible if needed (e.g., listing the date/time, describing what changed, etc) 

## Release Process
- Release Process guidelines TBD (pending partner input)

## Support & Contact
- Main method of communication is via the Discord server 
- Communication with the partner can be through Discord or during weekly in-person partner meetings 
- Expected response window: 24 hours 
   - Exceptions shall be made on a case-by-case basis
   - If a team member knows ahead of time that they will be unavailable, they should let the team know as soon as possible
