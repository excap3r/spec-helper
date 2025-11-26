import type { DesignSection, DesignComponent } from '../types';

export const parseDesignDocument = (text: string): DesignSection[] => {
    const sections: DesignSection[] = [];
    const lines = text.split('\n');

    let currentSection: DesignSection | null = null;
    let currentContent: string[] = [];
    let inCodeBlock = false;
    let currentCodeBlock: string[] = [];

    const getSectionType = (title: string): DesignSection['type'] => {
        const lower = title.toLowerCase();
        if (lower.includes('overview')) return 'overview';
        if (lower.includes('architecture')) return 'architecture';
        if (lower.includes('component') || lower.includes('interface')) return 'component';
        if (lower.includes('schema') || lower.includes('database') || lower.includes('model')) return 'schema';
        if (lower.includes('error')) return 'error-handling';
        if (lower.includes('test')) return 'testing';
        return 'other';
    };

    const saveCurrentSection = () => {
        if (currentSection) {
            currentSection.content = currentContent.join('\n').trim();
            sections.push(currentSection);
        }
    };

    for (const line of lines) {
        // Track code blocks
        if (line.trim().startsWith('```')) {
            if (inCodeBlock) {
                currentCodeBlock.push(line);
                if (currentSection) {
                    if (!currentSection.codeBlocks) currentSection.codeBlocks = [];
                    currentSection.codeBlocks.push(currentCodeBlock.join('\n'));
                }
                currentCodeBlock = [];
                inCodeBlock = false;
            } else {
                inCodeBlock = true;
                currentCodeBlock = [line];
            }
            currentContent.push(line);
            continue;
        }

        if (inCodeBlock) {
            currentCodeBlock.push(line);
            currentContent.push(line);
            continue;
        }

        // H2 headers - main sections
        if (line.startsWith('## ')) {
            saveCurrentSection();
            const title = line.replace('## ', '').trim();
            currentSection = {
                type: getSectionType(title),
                title,
                content: '',
                codeBlocks: []
            };
            currentContent = [];
            continue;
        }

        // H3 headers - subsections (components)
        if (line.startsWith('### ') && currentSection) {
            // Add as part of content
            currentContent.push(line);
            continue;
        }

        currentContent.push(line);
    }

    saveCurrentSection();
    return sections;
};

export const serializeDesignDocument = (sections: DesignSection[]): string => {
    let output = '# Design Document\n\n';

    for (const section of sections) {
        output += `## ${section.title}\n\n`;
        if (section.content) {
            output += section.content + '\n\n';
        }
    }

    return output.trim();
};
