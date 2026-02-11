/**
 * RegexHelper v4.0 - Core Configuration
 * Центральный файл конфигурации приложения
 * @version 1.0
 * @date 11.02.2026
 */

/**
 * Основные настройки приложения
 * @type {Object}
 */
export const APPCONFIG = {
    VERSION: '4.0.0',
    APPNAME: 'RegexHelper',
    MAXREGEXLENGTH: 10000,
    DEBOUNCEDELAY: 300,
    TOASTDURATION: 3000
};

/**
 * Настройки простых триггеров
 * @type {Object}
 */
export const SIMPLETRIGGERSCONFIG = {
    MAXTRIGGERS: 200,
    MINTRIGGERLENGTH: 1,
    MAXTRIGGERLENGTH: 100,
    SHORTTRIGGERLENGTH: 3
};

/**
 * Настройки связанных триггеров
 * @type {Object}
 */
export const LINKEDTRIGGERSCONFIG = {
    MAXGROUPS: 15,
    MAXSUBGROUPS: 15,
    MAXTRIGGERSPERSUBGROUP: 15,
    DEFAULTDISTANCE: {
        min: 1,
        max: 7
    }
};

/**
 * Настройки оптимизатора (6 типов)
 * @type {Object}
 */
export const OPTIMIZERCONFIG = {
    TYPES: {
        TYPE1: 'prefixes',        // Латиница/кириллица
        TYPE2: 'commonRoot',      // Общие корни
        TYPE3: 'distance',        // Расстояние (только для linked!)
        TYPE4: 'declensions',     // Склонения
        TYPE5: 'optional',        // Удвоенные буквы
        TYPE6: 'variations'       // Вариации (t.e.s.t)
    },
    DECLENSIONENDINGS: ['а', 'у', 'ом', 'е', 'ы', 'ами', 'ах', 'ой', 'ою']
};

/**
 * Настройки истории
 * @type {Object}
 */
export const HISTORYCONFIG = {
    MAXENTRIES: 100,
    STORAGEKEY: 'regexhelper-history'
};

/**
 * Настройки тестера regex
 * @type {Object}
 */
export const TESTERCONFIG = {
    MAXMATCHES: 100,
    MAXMATCHLENGTH: 100,
    HIGHLIGHTCOLOR: '#ffeb3b'
};

/**
 * Настройки визуализатора
 * @type {Object}
 */
export const VISUALIZERCONFIG = {
    MAXREGEXLENGTH: 500,
    DEFAULTZOOM: 1.0,
    MINZOOM: 0.5,
    MAXZOOM: 2.0,
    ZOOMSTEP: 0.1
};

/**
 * Конфигурация toast-уведомлений
 * @type {Object}
 */
export const TOASTCONFIG = {
    SUCCESS: {
        type: 'success',
        duration: 3000,
        icon: '✓'
    },
    ERROR: {
        type: 'error',
        duration: 5000,
        icon: '✕'
    },
    WARNING: {
        type: 'warning',
        duration: 4000,
        icon: '⚠'
    },
    INFO: {
        type: 'info',
        duration: 3000,
        icon: 'ℹ'
    }
};

/**
 * Сообщения об ошибках
 * @type {Object}
 */
export const ERRORMESSAGES = {
    TOOMANYTRIGGERS: 'Слишком много триггеров (максимум 200)',
    REGEXTOOLONG: 'Regex слишком длинный (максимум 10,000 символов)',
    INVALIDREGEX: 'Некорректный regex',
    NOTRIGGERS: 'Нет триггеров для конвертации',
    COPYFAILED: 'Не удалось скопировать в буфер обмена',
    SAVEFAILED: 'Не удалось сохранить данные'
};
