# SpecHelper

A visual editor for [Kiro](https://kiro.dev) specification files. View and edit your requirements, design documents, and tasks in an interactive board interface instead of raw Markdown.

![npm](https://img.shields.io/npm/v/spec-helper)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Electron](https://img.shields.io/badge/Electron-39-47848F?logo=electron)

## Installation

```bash
npm install -g spec-helper
```

## Usage with Kiro Specs

Kiro generates specification files in `.kiro/specs/<feature-name>/` directory. SpecHelper provides a visual interface for these files.

```bash
# Navigate to your spec folder and run
cd .kiro/specs/my-feature
spec-helper .

# Or specify the path directly
spec-helper .kiro/specs/my-feature

# Or use absolute path
spec-helper /path/to/project/.kiro/specs/my-feature
```

### Example

```bash
# From your project root
spec-helper .kiro/specs/external-product-search
```

This opens a visual board with three tabs:
- **Requirements** - User stories and acceptance criteria from `requirements.md`
- **Design** - Technical specifications from `design.md`
- **Tasks** - Implementation tasks from `tasks.md`

### CLI Options

```bash
spec-helper --help      # Show help
spec-helper --version   # Show version
```

## Features

- **Visual Board View** - See all requirements, design specs, and tasks at a glance
- **Gherkin Syntax Highlighting** - WHEN/IF/GIVEN conditions and SHALL/SHOULD/MUST actions are color-coded
- **Dual View Mode** - Toggle between visual board and raw Markdown editing
- **File Sync** - Changes are saved directly back to your spec files
- **macOS Native** - Seamless integration with macOS window controls

## Kiro Spec Files

SpecHelper works with the standard Kiro spec structure:

```
.kiro/
└── specs/
    └── my-feature/
        ├── requirements.md    # User stories & acceptance criteria
        ├── design.md          # Technical design & architecture
        └── tasks.md           # Implementation tasks & subtasks
```

### requirements.md format

```markdown
# Introduction
Feature overview and context...

## Glossary
- **Term**: Definition

## Requirements

### Requirement 1: Feature Name
**User Story:** As a user, I want...

#### Acceptance Criteria
1. WHEN user clicks button, THE System SHALL display confirmation
2. IF input is invalid, THE System SHOULD show error message
```

### design.md format

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
```

### tasks.md format

```markdown
# Implementation Tasks

## Task 1: Setup Authentication
- [ ] Subtask 1.1: Create login form
- [x] Subtask 1.2: Add validation
```

## Development

```bash
# Clone and install
git clone https://github.com/jakubsladek/spec-helper.git
cd spec-helper
npm install

# Development
npm run dev              # Web only
npm run electron:dev     # Electron app

# Build
npm run build            # Production build
npm run electron:build   # Electron distribution
```

## License

MIT
