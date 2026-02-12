/**
 * RegexHelper v4.0 - Core Configuration
 * Все константы приложения, лимиты, настройки.
 * 
 * @version 1.0
 * @date 12.02.2026
 */

/**
 * Основные настройки приложения
 * @type {Object}
 */
export const APPCONFIG = {
  /** @type {string} Версия приложения */
  VERSION: '4.0.0',
  
  /** @type {string} Название приложения */
  APPNAME: 'RegexHelper',
  
  /** @type {number} Максимальная длина regex */
  MAXREGEXLENGTH: 10000,
  
  /** @type {number} Задержка debounce (ms) */
  DEBOUNCEDELAY: 300,
  
  /** @type {number} Длительность toast-уведомления (ms) */
  TOASTDURATION: 3000
};

/**
 * Настройки Simple Triggers
 * @type {Object}
 */
export const SIMPLETRIGGERSCONFIG = {
  /** @type {number} Максимальное количество триггеров */
  MAXTRIGGERS: 200,
  
  /** @type {number} Минимальная длина триггера */
  MINTRIGGERLENGTH: 1,
  
  /** @type {number} Максимальная длина триггера */
  MAXTRIGGERLENGTH: 100,
  
  /** @type {number} Длина "короткого" триггера */
  SHORTTRIGGERLENGTH: 3
};

/**
 * Настройки Linked Triggers
 * @type {Object}
 */
export const LINKEDTRIGGERSCONFIG = {
  /** @type {number} Максимальное количество групп */
  MAXGROUPS: 15,
  
  /** @type {number} Максимальное количество подгрупп */
  MAXSUBGROUPS: 15,
  
  /** @type {number} Максимальное количество триггеров в подгруппе */
  MAXTRIGGERSPERSUBGROUP: 15,
  
  /** @type {Object} Дистанция по умолчанию */
  DEFAULTDISTANCE: { min: 1, max: 7 }
};

/**
 * Настройки оптимизаций Type 1-6
 * @type {Object}
 */
export const OPTIMIZERCONFIG = {
  TYPES: {
    TYPE1: 'prefixes',
    TYPE2: 'commonRoot',
    TYPE3: 'distance', // linked!
    TYPE4: 'declensions',
    TYPE5: 'optional', // ?
    TYPE6: 'variations' // t.e.s.t
  },
  
  /** @type {string} Окончания для Type 4 */
  DECLENSIONSENDINGS: ['а', 'у', 'ом', 'е', 'ы', 'ами']
};

/**
 * Настройки истории
 * @type {Object}
 */
export const HISTORYCONFIG = {
  /** @type {number} Максимальное количество записей */
  MAXENTRIES: 100,
  
  /** @type {string} Ключ для localStorage */
  STORAGEKEY: 'regexhelper-history'
};

/**
 * Настройки regex-тестера
 * @type {Object}
 */
export const TESTERCONFIG = {
  /** @type {number} Максимальное количество совпадений */
  MAXMATCHES: 100,
  
  /** @type {number} Максимальная длина совпадения */
  MAXMATCHLENGTH: 100,
  
  /** @type {string} Цвет подсветки (hex) */
  HIGHLIGHTCOLOR: '#ffeb3b',
  
  /** @type {number} Задержка debounce (ms) */
  DEBOUNCEDELAY: 300
};

/**
 * Настройки regex-визуализатора
 * @type {Object}
 */
export const VISUALIZERCONFIG = {
  /** @type {number} Максимальная длина regex */
  MAXREGEXLENGTH: 500,
  
  /** @type {number} Zoom по умолчанию */
  DEFAULTZOOM: 1.0,
  
  /** @type {number} Минимальный zoom */
  MINZOOM: 0.5,
  
  /** @type {number} Максимальный zoom */
  MAXZOOM: 2.0,
  
  /** @type {number} Шаг zoom */
  ZOOMSTEP: 0.1
};

/**
 * Настройки toast-уведомлений
 * @type {Object}
 */
export const TOASTCONFIG = {
  SUCCESS: {
    type: 'success',
    duration: 3000,
    icon: '✅'
  },
  ERROR: {
    type: 'error',
    duration: 5000,
    icon: '❌'
  },
  WARNING: {
    type: 'warning',
    duration: 4000,
    icon: '⚠️'
  },
  INFO: {
    type: 'info',
    duration: 3000,
    icon: 'ℹ️'
  }
};

/**
 * Сообщения об ошибках
 * @type {Object}
 */
export const ERRORMESSAGES = {
  /** @type {string} Слишком много триггеров */
  TOOMANYTRIGGERS: `Максимум ${SIMPLETRIGGERSCONFIG.MAXTRIGGERS} триггеров`,
  
  /** @type {string} Regex слишком длинный */
  REGEXTOOLONG: `Regex не может быть длиннее ${APPCONFIG.MAXREGEXLENGTH} символов`,
  
  /** @type {string} Невалидный regex */
  INVALIDREGEX: 'Невалидный regex-синтаксис',
  
  /** @type {string} Нет триггеров */
  NOTRIGGERS: 'Добавьте хотя бы один триггер',
  
  /** @type {string} Ошибка копирования */
  COPYFAILED: 'Не удалось скопировать в буфер обмена',
  
  /** @type {string} Ошибка сохранения */
  SAVEFAILED: 'Не удалось сохранить данные',
  
  /** @type {string} Слишком много групп */
  TOOMANYGROUPS: `Максимум ${LINKEDTRIGGERSCONFIG.MAXGROUPS} групп`,
  
  /** @type {string} Слишком много подгрупп */
  TOOMANYSUBGROUPS: `Максимум ${LINKEDTRIGGERSCONFIG.MAXSUBGROUPS} подгрупп`,
  
  /** @type {string} Триггер слишком длинный */
  TRIGGERTOOLONG: `Триггер не может быть длиннее ${SIMPLETRIGGERSCONFIG.MAXTRIGGERLENGTH} символов`
};
