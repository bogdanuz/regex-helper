/**
 * RegexHelper v4.0 - Test Configuration
 * @version 1.0
 * @date 12.02.2026
 */

export const TEST_SUITES = [
    {
        id: 'chat-2',
        name: 'Chat 2: UI + Features + Main',
        file: 'test-suite-chat-2.js',
        description: '11 модулей (navigation, effects, panels, simple-triggers, linked-triggers, suggestions, history, export, tester, visualizer, main)',
        estimatedTests: 110,
        version: '1.0',
        date: '2026-02-12',
        enabled: false
    },
    {
        id: 'chat-1',
        name: 'Chat 1: Core + Converter + UI Modals',
        file: 'test-suite-chat-1.js',
        description: '7 модулей (config, utils, errors, parser, validator, optimizer, modals)',
        estimatedTests: 50,
        version: '1.0',
        date: '2026-02-11',
        enabled: false
    }
];
