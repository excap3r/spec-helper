# SpecBoard

A visual requirements document editor for creating and managing software specifications with Gherkin-style acceptance criteria.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-Rolldown-646CFF?logo=vite)

## Overview

SpecBoard transforms Markdown-based requirements documents into an interactive board view. It supports structured editing of requirements, design documents, and implementation tasks with real-time parsing and syntax highlighting.

## Features

- **Requirements Management** - Parse and visualize requirements with user stories and acceptance criteria
- **Gherkin Syntax Support** - Built-in syntax highlighting for WHEN/IF/GIVEN conditions and SHALL/SHOULD/MUST actions
- **Design Documents** - Manage technical design specifications with code block support
- **Task Tracking** - Track implementation tasks with subtasks and requirement linking
- **Dual View Mode** - Toggle between visual board view and raw Markdown editing
- **Copy to Clipboard** - Export serialized documents with one click

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/excap3r/spec-helper.git
cd spec-helper

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Type-check and build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Usage

1. **Requirements Page** - Paste your `requirements.md` content in the Raw view, then switch to Board view to visualize and edit
2. **Design Page** - Load your `design.md` for technical specifications
3. **Tasks Page** - Track implementation progress with `tasks.md`

### Document Format

SpecBoard expects Markdown documents following this structure:

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

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite (Rolldown)** - Build tooling
- **Tailwind CSS v4** - Styling
- **Lucide React** - Icons

## License

MIT
