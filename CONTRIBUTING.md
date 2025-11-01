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

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (create a `.env.local` file):
   ```env
   # Add required environment variables here
   NEXT_PUBLIC_API_URL=your_api_url
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

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
State the convention (e.g., Conventional Commits), include examples, and how to
reference issues.

## Code Style, Linting & Formatting
Name the formatter/linter, config file locations, and the exact commands to
check/fix locally.

## Testing
Define required test types, how to run tests, expected coverage thresholds, and
when new/updated tests are mandatory.

## Pull Requests & Reviews
Outline PR requirements (template, checklist, size limits), reviewer expectations,
approval rules, and required status checks.

## CI/CD
Link to pipeline definitions, list mandatory jobs, how to view logs/re-run jobs,
and what must pass before merge/release.

## Security & Secrets
State how to report vulnerabilities, prohibited patterns (hard-coded secrets),
dependency update policy, and scanning tools.

## Documentation Expectations
Specify what must be updated (README, docs/, API refs, CHANGELOG) and
docstring/comment standards.

## Release Process
Describe versioning scheme, tagging, changelog generation, packaging/publishing
steps, and rollback process.

## Support & Contact
Provide maintainer contact channel, expected response windows, and where to ask
questions.
