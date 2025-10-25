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

## How to Contribute
Add more here later...

## Boilerplate Next.js README.md
To be deleted later, but might be useful to keep around for now.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
