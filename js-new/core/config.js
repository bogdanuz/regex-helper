/**
 * RegexHelper v4.0 - Core Configuration
 * 
 * Центральное хранилище всех констант, лимитов и конфигураций приложения.
 * Этот модуль не имеет зависимостей и используется всеми остальными модулями.
 * 
 * @version 1.0
 * @date 12.02.2026
 */

/**
 * Основная конфигурация приложения
 * @type {Object}
 */
export const APP_CONFIG = {
  /** @type {string} Версия приложения */
  VERSION: '4.0.0',
  
  /** @type {string} Название приложения */
  APPNAME: 'RegexHelper',
  
  /** @type {number} Максимальная длина regex (символов) */
  MAXREGEXLENGTH: 10000,
  
  /** @type {number} Задержка debounce для автообновления (мс) */
  DEBOUNCEDELAY: 300,
  
  /** @type {number} Длительность показа toast-уведомлений по умолчанию (мс) */
  TOASTDURATION: 3000
};

/**
 * Конфигурация для простых триггеров
 * @type {Object}
 */
export const SIMPLE_TRIGGERS_CONFIG = {
  /** @type {number} Максимальное количество триггеров */
  MAXTRIGGERS: 200,
  
  /** @type {number} Минимальная длина триггера (символов) */
  MINTRIGGERLENGTH: 1,
  
  /** @type {number} Максимальная длина триггера (символов) */
  MAXTRIGGERLENGTH: 100,
  
  /** @type {number} Длина "короткого" триггера для предупреждений (символов) */
  SHORTTRIGGERLENGTH: 3
};

/**
 * Конфигурация для связанных триггеров (групп и подгрупп)
 * @type {Object}
 */
export const LINKED_TRIGGERS_CONFIG = {
  /** @type {number} Максимальное количество групп */
  MAXGROUPS: 15,
  
  /** @type {number} Максимальное количество подгрупп в группе */
  MAXSUBGROUPS: 15,
  
  /** @type {number} Максимальное количество триггеров в подгруппе */
  MAXTRIGGERSPERSUBGROUP: 15,
  
  /** @type {Object} Расстояние по умолчанию */
  DEFAULTDISTANCE: {
    min: 1,
    max: 7
  }
};

/**
 * Конфигурация оптимизаций Type 1-6
 * @type {Object}
 */
export const OPTIMIZER_CONFIG = {
  /** @type {Object} Типы оптимизаций */
  TYPES: {
    TYPE1: 'prefixes',      // Префиксы/суффиксы
    TYPE2: 'commonRoot',    // Общий корень
    TYPE3: 'distance',      // Расстояние (только для linked!)
    TYPE4: 'declensions',   // Склонения
    TYPE5: 'optional',      // Опциональные символы (ё?)
    TYPE6: 'variations'     // Вариации (t.e.s.t)
  },
  
  /** @type {string[]} Окончания для склонений (Type 4) */
  DECLENSIONENDINGS: ['а', 'у', 'ом', 'е', 'ы', 'ами', 'ах']
};

/**
 * Конфигурация истории конвертаций
 * @type {Object}
 */
export const HISTORY_CONFIG = {
  /** @type {number} Максимальное количество записей в истории */
  MAXENTRIES: 100,
  
  /** @type {string} Ключ для сохранения в localStorage */
  STORAGEKEY: 'regexhelper-history'
};

/**
 * Конфигурация тестера regex
 * @type {Object}
 */
export const TESTER_CONFIG = {
  /** @type {number} Максимальное количество совпадений для отображения */
  MAXMATCHES: 100,
  
  /** @type {number} Максимальная длина одного совпадения (символов) */
  MAXMATCHLENGTH: 100,
  
  /** @type {string} Цвет подсветки совпадений (hex) */
  HIGHLIGHTCOLOR: '#ffeb3b',
  
  /** @type {number} Задержка debounce для автотестирования (мс) */
  DEBOUNCEDELAY: 300
};

/**
 * Конфигурация визуализатора regex
 * @type {Object}
 */
export const VISUALIZER_CONFIG = {
  /** @type {number} Максимальная длина regex для визуализации (символов) */
  MAXREGEXLENGTH: 500,
  
  /** @type {number} Zoom по умолчанию */
  DEFAULTZOOM: 1.0,
  
  /** @type {number} Минимальный zoom */
  MINZOOM: 0.5,
  
  /** @type {number} Максимальный zoom */
  MAXZOOM: 2.0,
  
  /** @type {number} Шаг изменения zoom */
  ZOOMSTEP: 0.1
};

/**
 * Конфигурация toast-уведомлений
 * @type {Object}
 */
export const TOAST_CONFIG = {
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
export const ERROR_MESSAGES = {
  /** @type {string} Превышен лимит триггеров */
  TOOMANYTRIGGERS: `Превышен лимит в ${SIMPLETRIGGERSCONFIG.MAXTRIGGERS} триггеров`,
  
  /** @type {string} Regex слишком длинный */
  REGEXTOOLONG: `Regex превышает ${APPCONFIG.MAXREGEXLENGTH} символов`,
  
  /** @type {string} Некорректный regex */
  INVALIDREGEX: 'Некорректный regex-паттерн',
  
  /** @type {string} Нет триггеров */
  NOTRIGGERS: 'Добавьте хотя бы один триггер',
  
  /** @type {string} Ошибка копирования */
  COPYFAILED: 'Не удалось скопировать в буфер обмена',
  
  /** @type {string} Ошибка сохранения */
  SAVEFAILED: 'Не удалось сохранить данные',
  
  /** @type {string} Слишком много групп */
  TOOMANYGROUPS: `Превышен лимит в ${LINKEDTRIGGERSCONFIG.MAXGROUPS} групп`,
  
  /** @type {string} Слишком много подгрупп */
  TOOMANYSUBGROUPS: `Превышен лимит в ${LINKEDTRIGGERSCONFIG.MAXSUBGROUPS} подгрупп`,
  
  /** @type {string} Слишком длинный триггер */
  TRIGGERTOOLONG: `Триггер превышает ${SIMPLETRIGGERSCONFIG.MAXTRIGGERLENGTH} символов`
};
