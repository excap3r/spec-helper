import type { Task, TaskSection } from '../types';

export const parseTasksDocument = (text: string): TaskSection[] => {
    const sections: TaskSection[] = [];
    const lines = text.split('\n');

    let currentSection: TaskSection | null = null;
    let currentTask: Task | null = null;
    let currentSubtask: Task | null = null;
    let taskIdCounter = 0;

    const createTaskId = () => `task-${++taskIdCounter}`;

    for (const line of lines) {
        // Main task group header (e.g., "# Implementation Plan")
        if (line.startsWith('# ')) {
            if (currentTask && currentSection) {
                currentSection.tasks.push(currentTask);
            }
            if (currentSection) {
                sections.push(currentSection);
            }
            currentSection = {
                type: 'task-group',
                title: line.replace('# ', '').trim(),
                tasks: []
            };
            currentTask = null;
            currentSubtask = null;
            continue;
        }

        // Subtask line (e.g., "- [x] 2.1 Implement..." or "- [ ]* 2.1 Implement...")
        // Check subtask FIRST because it's more specific (has X.Y format)
        // Format: - [x] or - [ ] or - [ ]* (optional)
        const subtaskMatch = line.match(/^\s*- \[(x| )\](\*)?\s*(\d+\.\d+)\s+(.+)$/);
        if (subtaskMatch && currentTask) {
            // Save previous subtask before creating new one
            if (currentSubtask) {
                currentTask.subtasks?.push(currentSubtask);
            }
            currentSubtask = {
                id: createTaskId(),
                title: subtaskMatch[4].trim(),
                description: '',
                completed: subtaskMatch[1] === 'x',
                optional: subtaskMatch[2] === '*',
                requirements: []
            };
            continue;
        }

        // Main task line (e.g., "- [x] 1. Database schema..." or "- [ ]* 11. Testing...")
        // Format: - [x] or - [ ] or - [ ]* (optional)
        const mainTaskMatch = line.match(/^\s*- \[(x| )\](\*)?\s*(\d+)\.\s+(.+)$/);
        if (mainTaskMatch) {
            // Save previous subtask if exists
            if (currentSubtask && currentTask) {
                currentTask.subtasks?.push(currentSubtask);
                currentSubtask = null;
            }
            // Save previous task if exists
            if (currentTask && currentSection) {
                currentSection.tasks.push(currentTask);
            }
            currentTask = {
                id: createTaskId(),
                title: mainTaskMatch[4].trim(),
                description: '',
                completed: mainTaskMatch[1] === 'x',
                optional: mainTaskMatch[2] === '*',
                subtasks: [],
                requirements: []
            };
            currentSubtask = null;
            continue;
        }

        // Description lines (start with "- " but not checkbox, must have some indentation or follow a task)
        const descMatch = line.match(/^\s*- (?!\[)(.+)$/);
        if (descMatch && (currentSubtask || currentTask)) {
            const desc = descMatch[1].trim();
            
            // Check if this is a requirements line (handles both _Requirements:_ and _Requirement:_)
            const reqInlineMatch = desc.match(/_Requirements?:\s*(.+?)_/);
            if (reqInlineMatch) {
                const reqs = reqInlineMatch[1].split(',').map(r => r.trim());
                if (currentSubtask) {
                    currentSubtask.requirements = reqs;
                } else if (currentTask) {
                    currentTask.requirements = reqs;
                }
                continue;
            }
            
            // Preserve bullet point prefix for display in editor
            const descWithBullet = '- ' + desc;
            if (currentSubtask) {
                currentSubtask.description += (currentSubtask.description ? '\n' : '') + descWithBullet;
            } else if (currentTask) {
                currentTask.description += (currentTask.description ? '\n' : '') + descWithBullet;
            }
            continue;
        }

        // Requirements reference on standalone line (e.g., "_Requirements: 1, 2, 3_")
        const reqMatch = line.match(/^\s*_Requirements?:\s*(.+)_\s*$/);
        if (reqMatch && (currentSubtask || currentTask)) {
            const reqs = reqMatch[1].split(',').map(r => r.trim());
            if (currentSubtask) {
                currentSubtask.requirements = reqs;
            } else if (currentTask) {
                currentTask.requirements = reqs;
            }
            continue;
        }
    }

    // Save last items
    if (currentSubtask && currentTask) {
        currentTask.subtasks?.push(currentSubtask);
    }
    if (currentTask && currentSection) {
        currentSection.tasks.push(currentTask);
    }
    if (currentSection) {
        sections.push(currentSection);
    }

    return sections;
};

export const serializeTasksDocument = (sections: TaskSection[]): string => {
    let output = '';

    for (const section of sections) {
        output += `# ${section.title}\n\n`;

        section.tasks.forEach((task, idx) => {
            const checkbox = task.completed ? '[x]' : '[ ]';
            const optionalMark = task.optional ? '*' : '';
            output += `- ${checkbox}${optionalMark} ${idx + 1}. ${task.title}\n`;

            if (task.description) {
                task.description.split('\n').forEach(line => {
                    // Strip existing bullet if present to avoid duplication
                    const cleanLine = line.replace(/^- /, '');
                    output += `  - ${cleanLine}\n`;
                });
            }

            if (task.subtasks && task.subtasks.length > 0) {
                task.subtasks.forEach((subtask, subIdx) => {
                    const subCheckbox = subtask.completed ? '[x]' : '[ ]';
                    const subOptionalMark = subtask.optional ? '*' : '';
                    output += `  - ${subCheckbox}${subOptionalMark} ${idx + 1}.${subIdx + 1} ${subtask.title}\n`;
                    if (subtask.description) {
                        subtask.description.split('\n').forEach(line => {
                            // Strip existing bullet if present to avoid duplication
                            const cleanLine = line.replace(/^- /, '');
                            output += `    - ${cleanLine}\n`;
                        });
                    }
                    if (subtask.requirements && subtask.requirements.length > 0) {
                        output += `    - _Requirements: ${subtask.requirements.join(', ')}_\n`;
                    }
                });
            }

            if (task.requirements && task.requirements.length > 0) {
                output += `  - _Requirements: ${task.requirements.join(', ')}_\n`;
            }
        });

        output += '\n';
    }

    return output.trim();
};
