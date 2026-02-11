/**
 * Конфигурация RegexHelper v4.0
 * Все константы приложения в одном месте
 * @module core/config
 * @version 1.0
 */

/**
 * Основная конфигурация приложения
 */
export const APP_CONFIG = {
    VERSION: '4.0.0',
    APP_NAME: 'RegexHelper',
    MAX_REGEX_LENGTH: 10000,
    DEBOUNCE_DELAY: 300,
    TOAST_DURATION: 3000,
};

/**
 * Конфигурация простых триггеров
 */
export const SIMPLE_TRIGGERS_CONFIG = {
    MAX_TRIGGERS: 200,
    MIN_TRIGGER_LENGTH: 1,
    MAX_TRIGGER_LENGTH: 100,
    SHORT_TRIGGER_LENGTH: 3,
};

/**
 * Конфигурация связанных триггеров
 */
export const LINKED_TRIGGERS_CONFIG = {
    MAX_GROUPS: 15,
    MAX_SUBGROUPS: 15,
    MAX_TRIGGERS_PER_SUBGROUP: 15,
    DEFAULT_DISTANCE: {
        min: 1,
        max: 7,
    },
};

/**
 * Конфигурация оптимизаций
 */
export const OPTIMIZER_CONFIG = {
    TYPES: {
        TYPE_1: 'prefixes',
        TYPE_2: 'commonRoot',
        TYPE_3: 'distance',
        TYPE_4: 'declensions',
        TYPE_5: 'optional',
        TYPE_6: 'variations',
    },
    DECLENSION_ENDINGS: ['а', 'у', 'ом', 'е', 'ов', 'ам', 'ами', 'ах'],
};

/**
 * Конфигурация истории
 */
export const HISTORY_CONFIG = {
    MAX_ENTRIES: 100,
    STORAGE_KEY: 'regexhelper_history',
};

/**
 * Конфигурация тестера
 */
export const TESTER_CONFIG = {
    MAX_MATCHES: 100,
    MAX_MATCH_LENGTH: 100,
    HIGHLIGHT_COLOR: '#ffeb3b',
};

/**
 * Конфигурация визуализатора
 */
export const VISUALIZER_CONFIG = {
    MAX_REGEX_LENGTH: 500,
    DEFAULT_ZOOM: 1.0,
    MIN_ZOOM: 0.5,
    MAX_ZOOM: 2.0,
    ZOOM_STEP: 0.1,
};

/**
 * Конфигурация toast уведомлений
 */
export const TOAST_CONFIG = {
    SUCCESS: {
        type: 'success',
        duration: 3000,
        icon: '✅',
    },
    ERROR: {
        type: 'error',
        duration: 5000,
        icon: '❌',
    },
    WARNING: {
        type: 'warning',
        duration: 4000,
        icon: '⚠️',
    },
    INFO: {
        type: 'info',
        duration: 3000,
        icon: 'ℹ️',
    },
};

/**
 * Сообщения об ошибках
 */
export const ERROR_MESSAGES = {
    TOO_MANY_TRIGGERS: 'Слишком много триггеров (максимум 200)',
    REGEX_TOO_LONG: 'Regex слишком длинный (максимум 10,000 символов)',
    INVALID_REGEX: 'Неправильный формат regex',
    NO_TRIGGERS: 'Введите хотя бы один триггер',
    COPY_FAILED: 'Не удалось скопировать в буфер обмена',
    SAVE_FAILED: 'Не удалось сохранить в историю',
};
