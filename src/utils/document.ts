import type { Section } from '../types';

export const parseDocument = (text: string): Section[] => {
    const lines = text.split('\n');
    const sections: Section[] = [];

    let currentSection: Section | null = null;
    let buffer: string[] = [];
    let criteriaBuffer: string[] = [];
    let isCollectingCriteria = false;

    const flushSection = () => {
        if (currentSection) {
            if (currentSection.type === 'requirement' && currentSection.data) {
                const fullText = buffer.join('\n');
                if (!currentSection.data.userStory) {
                    const usMatch = fullText.match(/\*\*User Story:\*\*(.*?)(####|$)/s);
                    if (usMatch) currentSection.data.userStory = usMatch[1].trim();
                }
                if (criteriaBuffer.length > 0) {
                    currentSection.data.acceptanceCriteria = [...criteriaBuffer];
                }
            } else if (currentSection.type === 'glossary') {
                const content = buffer.join('\n');
                // Filter lines that start with list markers and extract content
                const items = content.split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^-\s*/, '').trim());
                currentSection.items = items;
            } else {
                currentSection.content = buffer.join('\n').trim();
            }
            sections.push(currentSection);
        }
        buffer = [];
        criteriaBuffer = [];
        isCollectingCriteria = false;
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (trimmed.startsWith('# Requirements Document')) continue;

        if (trimmed.startsWith('## Introduction')) {
            flushSection();
            currentSection = { type: 'intro', title: 'Introduction', content: '' };
            continue;
        }

        if (trimmed.startsWith('## Glossary')) {
            flushSection();
            currentSection = { type: 'glossary', title: 'Glossary', items: [] };
            continue;
        }

        if (trimmed.startsWith('## Requirements')) continue;

        if (trimmed.startsWith('### Requirement') || trimmed.match(/^###\s*\d+(\.\d+)?[.:]/)) {
            flushSection();
            const title = trimmed.replace(/^###\s*/, '');
            // Extract ID from format "Requirement 1:" or "Requirement 8.1:" or "Requirement 13.1:"
            const reqIdMatch = title.match(/Requirement\s+(\d+(?:\.\d+)?)\s*:/i);
            const id = reqIdMatch ? reqIdMatch[1] : (sections.filter(s => s.type === 'requirement').length + 1).toString();
            currentSection = {
                type: 'requirement',
                title,
                data: { id, title, userStory: '', acceptanceCriteria: [], raw: '' }
            };
            continue;
        }

        if (currentSection?.type === 'requirement' && currentSection.data) {
            if (trimmed.startsWith('**User Story:**')) {
                const storyStart = trimmed.replace('**User Story:**', '').trim();
                currentSection.data.userStory = storyStart;
                continue;
            }

            if (trimmed.startsWith('#### Acceptance Criteria')) {
                isCollectingCriteria = true;
                continue;
            }

            if (isCollectingCriteria) {
                // Collect list items (1., 2., 3., etc.)
                if (trimmed.match(/^\d+\./)) {
                    criteriaBuffer.push(trimmed.replace(/^\d+\.\s*/, ''));
                } else if (trimmed.length > 0 && !trimmed.startsWith('#')) {
                    // Handle wrapped lines for the last criteria item
                    if (criteriaBuffer.length > 0) {
                        criteriaBuffer[criteriaBuffer.length - 1] += ' ' + trimmed;
                    }
                }
                continue;
            }
        }

        if (trimmed.length > 0 || currentSection?.type === 'intro') {
            buffer.push(line);
        }
    }

    flushSection();
    return sections;
};

export const serializeDocument = (sections: Section[]): string => {
    let output = '# Requirements Document\n\n';

    sections.forEach(s => {
        if (s.type === 'intro') {
            output += `## ${s.title}\n\n${s.content}\n\n`;
        } else if (s.type === 'glossary') {
            output += `## ${s.title}\n\n`;
            s.items?.forEach(item => {
                output += `- ${item}\n`;
            });
            output += '\n';
        } else if (s.type === 'requirement' && s.data) {
            output += `### ${s.title}\n\n`;
            output += `**User Story:** ${s.data.userStory}\n\n`;
            output += `#### Acceptance Criteria\n\n`;
            s.data.acceptanceCriteria.forEach((ac, idx) => {
                output += `${idx + 1}. ${ac}\n`;
            });
            output += '\n';
        }
    });

    return output + '## Requirements\n\n(Generated from SpecBoard)';
};
