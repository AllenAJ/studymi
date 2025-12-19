export const getVibeString = (isGenZ: boolean, key: string): string => {
    const vibes: Record<string, { base: string, genz: string }> = {
        'generate': { base: 'Generate', genz: 'Cook' },
        'summary': { base: 'Summary', genz: 'The Tea' },
        'flashcards': { base: 'Flashcards', genz: 'Deck Rizz' },
        'quiz': { base: 'Quiz', genz: 'Vibe Check' },
        'mindmap': { base: 'Mind Map', genz: 'Aura Map' },
        'teachback': { base: 'Teach Back', genz: 'Main Character' },
        'recent': { base: 'Recent Study Sets', genz: 'Recent Vibes' },
        'loading_1': { base: 'Reading your content...', genz: 'scanning the vibe...' },
        'loading_2': { base: 'Identifying key concepts...', genz: 'finding the lore...' },
        'loading_3': { base: 'Creating flashcards...', genz: 'making card deck rizz...' },
        'loading_4': { base: 'Generating quiz questions...', genz: 'cooking up a test...' },
        'loading_5': { base: 'Building mind map...', genz: 'mapping the aura...' },
        'loading_6': { base: 'Saving your study set...', genz: 'saving the core...' },
        'loading_7': { base: 'All done! ✨', genz: 'locked in! ✨' },
        'whats_up': { base: "what's up", genz: "what's the move" },
        'sets_created': { base: 'study sets created', genz: 'vibes cooked' },
        'flashcards_generated': { base: 'flashcards generated', genz: 'cards rizzed' },
        'quiz_questions': { base: 'quiz questions', genz: 'check questions' },
        'breakdown': { base: 'The Breakdown', genz: 'the lore' },
        'key_concepts': { base: 'Key Concepts', genz: 'core memories' },
        'study_session': { base: 'Study Session', genz: 'lock in session' }
    };

    const vibe = vibes[key];
    if (!vibe) return key;
    return isGenZ ? vibe.genz : vibe.base;
};
