import { KEYWORDS } from '../constants';
import type { GherkinParts } from '../types';

// Highlights Gherkin/Spec keywords in text (Read-only view, and now also for contentEditable)
export const highlightSyntax = (text: string) => {
    const parts = text.split(/(\s+)/);
    return parts.map((part, index) => {
        // Pouze pro slova, která nejsou prázdné mezery
        if (part.trim() === '') return part;

        const upper = part.replace(/[^A-Za-z]/g, '').toUpperCase();

        // Používáme regulární výraz, aby se zachovaly i interpunkční znaménka
        const applyHighlight = (colorClass: string) => (
            <span key={index} className={`font-bold ${colorClass}`}>
                {part}
            </span>
        );

        if (KEYWORDS.condition.includes(upper)) {
            return applyHighlight('text-purple-400');
        }
        if (KEYWORDS.action.includes(upper)) {
            return applyHighlight('text-emerald-400');
        }
        if (KEYWORDS.logic.includes(upper)) {
            return applyHighlight('text-orange-400');
        }
        if (KEYWORDS.entity.includes(upper)) {
            return applyHighlight('text-cyan-400');
        }
        return part;
    });
};

// Converts text with syntax highlighting to HTML string for contentEditable
export const highlightSyntaxToHTML = (text: string): string => {
    const parts = text.split(/(\s+)/);
    return parts.map((part) => {
        // Pouze pro slova, která nejsou prázdné mezery
        if (part.trim() === '') return part;

        const upper = part.replace(/[^A-Za-z]/g, '').toUpperCase();

        if (KEYWORDS.condition.includes(upper)) {
            return `<span class="font-bold text-purple-400">${part}</span>`;
        }
        if (KEYWORDS.action.includes(upper)) {
            return `<span class="font-bold text-emerald-400">${part}</span>`;
        }
        if (KEYWORDS.logic.includes(upper)) {
            return `<span class="font-bold text-orange-400">${part}</span>`;
        }
        if (KEYWORDS.entity.includes(upper)) {
            return `<span class="font-bold text-cyan-400">${part}</span>`;
        }
        return part;
    }).join('');
};

// Deconstructs a sentence into Gherkin parts for the UI Editor
export const parseGherkinSentence = (sentence: string): GherkinParts => {
    const defaultParts: GherkinParts = {
        conditionType: 'WHEN',
        conditionText: '',
        actorPrefix: 'THE',
        actorAndAction: sentence,
        actor: '',
        action: sentence,
        actionType: 'SHALL',
        isStructured: false,
        original: sentence
    };

    // Helper to split actor and action based on modal verb
    const splitActorAction = (fullText: string): { actor: string, actionType: string, action: string } => {
        const actionPrefixes = KEYWORDS.action.join('|');
        // Find the first occurrence of a modal verb
        const match = fullText.match(new RegExp(`\\b(${actionPrefixes})\\b`, 'i'));

        if (match && match.index !== undefined) {
            const actionType = match[1].toUpperCase();
            const actor = fullText.substring(0, match.index).trim();
            const action = fullText.substring(match.index + match[0].length).trim();
            return { actor, actionType, action };
        }

        // Fallback if no modal verb found
        return { actor: fullText, actionType: 'SHALL', action: '' };
    };

    // 1. Try to find a standard condition start (e.g., WHEN)
    const conditionPrefixes = KEYWORDS.condition.join('|');
    const fullRegex = new RegExp(`^(${conditionPrefixes})\\s+(.*?)(?:,\\s*)?(${KEYWORDS.entity.join('|')})\\s+(.*)$`, 'i');
    const match = sentence.match(fullRegex);

    if (match) {
        const conditionType = match[1].toUpperCase();
        const conditionText = match[2].trim();
        const actorPrefix = match[3].toUpperCase();
        const actorAndAction = match[4].trim();

        const { actor, actionType, action } = splitActorAction(actorAndAction);

        return {
            conditionType,
            conditionText,
            actorPrefix,
            actorAndAction,
            actor,
            action,
            actionType,
            isStructured: true,
            original: sentence
        };
    }

    // 2. Try to find a sentence starting directly with THE
    const entityPrefixes = KEYWORDS.entity.join('|');
    const entityRegex = new RegExp(`^(${entityPrefixes})\\s+`, 'i');
    const matchEntity = sentence.match(entityRegex);

    if (matchEntity) {
        const actorAndAction = sentence.substring(matchEntity[0].length).trim();
        const { actor, actionType, action } = splitActorAction(actorAndAction);

        return {
            conditionType: 'WHEN',
            conditionText: '',
            actorPrefix: matchEntity[1].toUpperCase(),
            actorAndAction,
            actor,
            action,
            actionType,
            isStructured: true,
            original: sentence
        };
    }

    return defaultParts;
};


// Reconstructs the object back to a string
export const buildGherkinSentence = (parts: GherkinParts): string => {
    if (!parts.isStructured) return parts.original;

    let output = '';

    // 1. Condition Block
    if (parts.conditionText.length > 0) {
        output += `${parts.conditionType} ${parts.conditionText}`;
    }

    // 2. Actor + Action Block
    // We construct the full action part from the structured fields if available
    const fullActionPart = `${parts.actor} ${parts.actionType} ${parts.action}`.trim();

    if (fullActionPart.length > 0) {
        if (parts.conditionText.length > 0) {
            output += `, `;
        } else if (parts.conditionType === 'WHEN') {
            output = '';
        }

        output += `${parts.actorPrefix} ${fullActionPart}`;
    } else if (parts.conditionText.length > 0) {
        output = `${parts.conditionType} ${parts.conditionText}`;
    }

    return output.replace(/\s{2,}/g, ' ').trim();
};
