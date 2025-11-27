# SpecHelper

A visual requirements document editor for creating and managing software specifications with Gherkin-style acceptance criteria.

![npm](https://img.shields.io/npm/v/spec-helper)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Electron](https://img.shields.io/badge/Electron-39-47848F?logo=electron)

## Installation

```bash
npm install -g spec-helper
```

## Usage

Navigate to a directory containing your spec files and run:

```bash
spec-helper .
```

Or specify a path directly:

```bash
spec-helper /path/to/your/specs
```

### CLI Options

```bash
spec-helper --help      # Show help
spec-helper --version   # Show version
```

## Expected Files

SpecHelper looks for these Markdown files in the target directory:

- `requirements.md` - Requirements with user stories and acceptance criteria
- `design.md` - Technical design specifications
- `tasks.md` - Implementation tasks and subtasks

## Features

- **Requirements Management** - Parse and visualize requirements with user stories and acceptance criteria
- **Gherkin Syntax Support** - Built-in syntax highlighting for WHEN/IF/GIVEN conditions and SHALL/SHOULD/MUST actions
- **Design Documents** - Manage technical design specifications with code block support
- **Task Tracking** - Track implementation tasks with subtasks and requirement linking
- **Dual View Mode** - Toggle between visual board view and raw Markdown editing
- **File Sync** - Save changes directly back to your local files
- **Copy to Clipboard** - Export serialized documents with one click

## Document Format

### requirements.md

```markdown
# Introduction
Project overview and context...

## Glossary
- **Term**: Definition

## Requirements

### Requirement 1: Feature Name
**User Story:** As a user, I want...

#### Acceptance Criteria
1. WHEN user clicks button, THE System SHALL display confirmation
2. IF input is invalid, THE System SHOULD show error message
```

### design.md

```markdown
# Technical Design

## Component: Authentication
Description of the component...

### Interface
```typescript
interface User {
  id: string;
  email: string;
}
```

### tasks.md

```markdown
# Implementation Tasks

## Task 1: Setup Authentication
- [ ] Subtask 1.1: Create login form
- [x] Subtask 1.2: Add validation
```

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/jakubsladek/spec-helper.git
cd spec-helper

# Install dependencies
npm install

# Start development (web only)
npm run dev

# Start Electron development
npm run electron:dev
```

### Available Scripts

```bash
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run electron:dev     # Start Electron in dev mode
npm run electron:build   # Build Electron app for distribution
```

## Tech Stack

- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Electron 39** - Desktop app framework
- **Vite (Rolldown)** - Build tooling
- **Tailwind CSS v4** - Styling
- **Lucide React** - Icons

## License

MIT
