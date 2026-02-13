/**
 * REGEXHELPER v4.0
 * Configuration and Constants
 * Module 7A: App configuration
 */

export const APP_CONFIG = {
    NAME: 'RegexHelper',
    VERSION: '4.0.0',
    BUILD_DATE: '2026-02-14',
    
    // Limits
    MAX_TRIGGERS: 1000,
    MAX_GROUPS: 50,
    MAX_SUBGROUPS_PER_GROUP: 20,
    MAX_TRIGGERS_PER_SUBGROUP: 100,
    MAX_HISTORY_ITEMS: 100,
    
    // Autosave
    AUTOSAVE_DELAY: 500, // ms
    
    // LocalStorage keys
    STORAGE_KEYS: {
        SIMPLE_TRIGGERS: 'regexhelper_simple_triggers',
        LINKED_GROUPS: 'regexhelper_linked_groups',
        HISTORY: 'regexhelper_history',
        SETTINGS: 'regexhelper_settings',
        UI_STATE: 'regexhelper_ui_state'
    },
    
    // Distance presets
    DISTANCE_PRESETS: {
        SHORT: { value: '.{1,7}', label: 'Короткая (1-7 символов)' },
        MEDIUM: { value: '.{1,10}', label: 'Средняя (1-10 символов)' },
        LONG: { value: '.{0,30}', label: 'Длинная (0-30 символов)' },
        ANY: { value: '.*', label: 'Любая дистанция (любые символы)' },
        DIRECT: { value: ' ', label: 'Прямая (пробел)' },
        CUSTOM: { value: 'custom', label: 'Своя дистанция...' }
    },
    
    // Parameter types
    PARAM_TYPES: {
        LATIN_CYRILLIC: 'latin-cyrillic',
        COMMON_ROOT: 'common-root',
        DECLENSIONS: 'declensions',
        OPTIONAL: 'optional',
        PREFIX: 'prefix'
    },
    
    // Declension endings (Russian)
    DECLENSION_ENDINGS: [
        '', 'а', 'у', 'ом', 'е', 'ой', 'ы', 'ам', 'ами', 'ах',
        'я', 'ю', 'ем', 'и', 'ей', 'ям', 'ями', 'ях'
    ],
    
    // Connection modes
    CONNECTION_MODES: {
        INDIVIDUAL: 'individual',
        COMMON: 'common',
        ALTERNATION: 'alternation'
    }
};

export const UI_CONFIG = {
    // Animation durations (ms)
    ANIMATION_FAST: 150,
    ANIMATION_NORMAL: 200,
    ANIMATION_SLOW: 300,
    
    // Toasts
    TOAST_DURATION: 3000,
    
    // Modal
    MODAL_TRANSITION_DURATION: 200,
    
    // Debounce delays
    DEBOUNCE_INPUT: 300,
    DEBOUNCE_SCROLL: 100
};

export const REGEX_CONFIG = {
    // Special characters that need escaping
    SPECIAL_CHARS: /[.*+?^${}()|[\]\\]/g,
    
    // Word boundary
    WORD_BOUNDARY: '\\b',
    
    // Character classes
    CHAR_CLASSES: {
        DIGIT: '\\d',
        WORD: '\\w',
        SPACE: '\\s',
        CYRILLIC: '[а-яёА-ЯЁ]',
        LATIN: '[a-zA-Z]',
        ANY: '.'
    }
};

export const ERROR_MESSAGES = {
    MAX_TRIGGERS_EXCEEDED: `Превышен лимит триггеров (максимум ${APP_CONFIG.MAX_TRIGGERS})`,
    EMPTY_TRIGGER: 'Триггер не может быть пустым',
    INVALID_DISTANCE: 'Некорректный формат дистанции',
    STORAGE_ERROR: 'Ошибка сохранения данных',
    CONVERSION_ERROR: 'Ошибка конвертации',
    NO_TRIGGERS: 'Введите хотя бы один триггер'
};

export const SUCCESS_MESSAGES = {
    COPIED: 'Regex скопирован в буфер обмена',
    SAVED: 'Данные сохранены',
    CONVERTED: 'Конвертация успешно выполнена',
    EXPORTED: 'Файл успешно экспортирован',
    IMPORTED: 'Данные успешно импортированы'
};
