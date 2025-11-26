export interface Requirement {
    id: string;
    title: string;
    userStory: string;
    acceptanceCriteria: string[];
    raw: string;
}

export interface Section {
    type: 'intro' | 'glossary' | 'requirement';
    title: string;
    content?: string;
    items?: string[];
    data?: Requirement;
}

export interface GherkinParts {
    conditionType: string; // WHEN, IF, GIVEN
    conditionText: string;
    actorPrefix: string; // THE
    actorAndAction: string; // Legacy: The entire rest of the sentence (Actor + Action)
    actor: string; // New: Just the actor name
    action: string; // New: The action part (after SHALL/SHOULD)
    actionType: string; // SHALL, SHOULD, MUST
    actionText?: string;
    isStructured: boolean; // Fallback for complex sentences
    original: string;
}

// Design types
export interface DesignComponent {
    id: string;
    title: string;
    responsibility?: string;
    interface?: string;
    raw: string;
}

export interface DesignSection {
    type: 'overview' | 'architecture' | 'component' | 'schema' | 'error-handling' | 'testing' | 'other';
    title: string;
    content?: string;
    codeBlocks?: string[];
    data?: DesignComponent;
}

// Tasks types
export interface Task {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    optional?: boolean;
    requirements?: string[];
    subtasks?: Task[];
}

export interface TaskSection {
    type: 'task-group';
    title: string;
    tasks: Task[];
}
