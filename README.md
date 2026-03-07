# 14 HEC — Plant Intelligence System

A desktop application for exploring herbal, energetic, and celestial plant intelligence. Cross-references 207+ plants with ailments, astrology, body systems, and traditional teachings.

Built with Electron 33, React 18, TypeScript, SQLite, and Tailwind CSS.

## Quick Start

```bash
# 1. Clone the repository
git clone git@github.com:YOUR-ORG/14hec.git
cd 14hec

# 2. Run first-time setup
bash scripts/setup.sh

# 3. Start the app
npm run dev
```

The database is created automatically on first launch from seed data.

## Daily Workflow

```bash
# Get the latest changes from everyone
bash scripts/sync.sh

# Create your work branch
git checkout -b yourname/what-you-are-working-on

# ... work with Claude Code ...

# Save your work
git add .
git commit -m "Description of what you did"

# Push for others to see
bash scripts/publish.sh
```

When your feature is ready, create a Pull Request on GitHub to merge into `main`.

## Resetting the Database

After someone changes the seed data (JSON files in `src/seed/`), reset your database:

```bash
rm ~/Library/Application\ Support/14hec/14hec.db*
npm run dev
```

The app rebuilds the database from seed files on launch.

## Using Claude Code

Open a Claude Code session in the project directory. Claude will automatically read `CLAUDE.md` and understand the full architecture, conventions, and workflow. Just describe what you want to build and Claude will follow the project patterns.

## Team

- **James** — Co-founder
- **Shannon** — Co-founder
- **Rafa** — Co-founder

Coordination docs, design assets, and releases live in the shared Google Drive folder.
# Relational-Alchemy
