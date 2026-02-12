/**
 * RegexHelper v4.0 - Validator
 * 
 * Модуль для валидации триггеров, regex и других входных данных.
 * Проверяет лимиты, длины, корректность форматов.
 * 
 * @version 1.0
 * @date 12.02.2026
 */

import { SIMPLETRIGGERSCONFIG, LINKEDTRIGGERSCONFIG, APPCONFIG, ERRORMESSAGES } from './config.js';
import { showInlineError } from './errors.js';

/**
 * Валидирует массив триггеров
 * Проверяет: лимит количества, длину каждого триггера, пустые триггеры
 * @param {string[]} triggers - Массив триггеров
 * @param {string} [fieldId] - ID поля для показа inline-ошибки (опционально)
 * @returns {boolean} - true, если валидация прошла успешно
 * @example
 * validateTriggers(['привет', 'мир']) // true
 * validateTriggers([]) // false
 */
export function validateTriggers(triggers, fieldId = null) {
  // Проверка на пустой массив
  if (!Array.isArray(triggers) || triggers.length === 0) {
    if (fieldId) {
      showInlineError(fieldId, ERRORMESSAGES.NOTRIGGERS);
    }
    return false;
  }

  // Проверка лимита количества триггеров
  if (triggers.length > SIMPLETRIGGERSCONFIG.MAXTRIGGERS) {
    if (fieldId) {
      showInlineError(fieldId, ERRORMESSAGES.TOOMANYTRIGGERS);
    }
    return false;
  }

  // Проверка длины каждого триггера
  for (const trigger of triggers) {
    if (!validateTriggerLength(trigger)) {
      if (fieldId) {
        showInlineError(fieldId, ERRORMESSAGES.TRIGGERTOOLONG);
      }
      return false;
    }
  }

  return true;
}

/**
 * Валидирует длину regex
 * @param {string} regex - Regex для проверки
 * @returns {boolean} - true, если длина в пределах лимита
 * @example
 * validateRegexLength('test') // true
 * validateRegexLength('a'.repeat(10001)) // false
 */
export function validateRegexLength(regex) {
  if (!regex || typeof regex !== 'string') return false;
  return regex.length <= APPCONFIG.MAXREGEXLENGTH;
}

/**
 * Валидирует длину одного триггера
 * @param {string} trigger - Триггер для проверки
 * @returns {boolean} - true, если длина в пределах лимита
 * @example
 * validateTriggerLength('test') // true
 * validateTriggerLength('a'.repeat(101)) // false
 */
export function validateTriggerLength(trigger) {
  if (!trigger || typeof trigger !== 'string') return false;
  
  const minLength = SIMPLETRIGGERSCONFIG.MINTRIGGERLENGTH;
  const maxLength = SIMPLETRIGGERSCONFIG.MAXTRIGGERLENGTH;
  
  return trigger.length >= minLength && trigger.length <= maxLength;
}

/**
 * Валидирует количество триггеров
 * @param {number} count - Количество триггеров
 * @returns {boolean} - true, если количество в пределах лимита
 * @example
 * validateTriggerCount(150) // true
 * validateTriggerCount(250) // false
 */
export function validateTriggerCount(count) {
  if (typeof count !== 'number' || count < 0) return false;
  return count <= SIMPLETRIGGERSCONFIG.MAXTRIGGERS;
}

/**
 * Валидирует regex на корректность синтаксиса
 * @param {string} regex - Regex для проверки
 * @returns {boolean} - true, если regex корректный
 * @example
 * validateRegexSyntax('test|hello') // true
 * validateRegexSyntax('(unclosed') // false
 */
export function validateRegexSyntax(regex) {
  if (!regex || typeof regex !== 'string') return false;
  
  try {
    new RegExp(regex);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Валидирует расстояние (distance) для Type 3
 * @param {Object} distance - Объект с min и max
 * @returns {boolean} - true, если distance корректное
 * @example
 * validateDistance({ min: 1, max: 7 }) // true
 * validateDistance({ min: 10, max: 5 }) // false (min > max)
 */
export function validateDistance(distance) {
  if (!distance || typeof distance !== 'object') return false;
  
  const { min, max } = distance;
  
  if (typeof min !== 'number' || typeof max !== 'number') return false;
  if (min < 0 || max < 0) return false;
  if (min > max) return false;
  
  return true;
}

/**
 * Валидирует количество групп в связанных триггерах
 * @param {number} groupCount - Количество групп
 * @returns {boolean} - true, если количество в пределах лимита
 * @example
 * validateGroupCount(10) // true
 * validateGroupCount(20) // false
 */
export function validateGroupCount(groupCount) {
  if (typeof groupCount !== 'number' || groupCount < 0) return false;
  return groupCount <= LINKEDTRIGGERSCONFIG.MAXGROUPS;
}

/**
 * Валидирует количество подгрупп в группе
 * @param {number} subgroupCount - Количество подгрупп
 * @returns {boolean} - true, если количество в пределах лимита
 * @example
 * validateSubgroupCount(10) // true
 * validateSubgroupCount(20) // false
 */
export function validateSubgroupCount(subgroupCount) {
  if (typeof subgroupCount !== 'number' || subgroupCount < 0) return false;
  return subgroupCount <= LINKEDTRIGGERSCONFIG.MAXSUBGROUPS;
}

/**
 * Валидирует количество триггеров в подгруппе
 * @param {number} triggerCount - Количество триггеров
 * @returns {boolean} - true, если количество в пределах лимита
 * @example
 * validateTriggersPerSubgroup(10) // true
 * validateTriggersPerSubgroup(20) // false
 */
export function validateTriggersPerSubgroup(triggerCount) {
  if (typeof triggerCount !== 'number' || triggerCount < 0) return false;
  return triggerCount <= LINKEDTRIGGERSCONFIG.MAXTRIGGERSPERSUBGROUP;
}

/**
 * Валидирует режим связи триггеров
 * @param {string} mode - Режим: 'individual', 'common', 'alternation'
 * @returns {boolean} - true, если режим корректный
 * @example
 * validateConnectionMode('individual') // true
 * validateConnectionMode('invalid') // false
 */
export function validateConnectionMode(mode) {
  if (!mode || typeof mode !== 'string') return false;
  const validModes = ['individual', 'common', 'alternation'];
  return validModes.includes(mode.toLowerCase());
}

/**
 * Валидирует тип оптимизации (Type 1-6)
 * @param {number|string} type - Тип оптимизации
 * @returns {boolean} - true, если тип корректный
 * @example
 * validateOptimizationType(1) // true
 * validateOptimizationType(7) // false
 */
export function validateOptimizationType(type) {
  const typeNum = typeof type === 'string' ? parseInt(type, 10) : type;
  if (isNaN(typeNum)) return false;
  return typeNum >= 1 && typeNum <= 6;
}

/**
 * Валидирует префикс для Type 6 (exact mode)
 * @param {string} prefix - Префикс
 * @returns {boolean} - true, если префикс корректный
 * @example
 * validateType6Prefix('test') // true
 * validateType6Prefix('') // false
 */
export function validateType6Prefix(prefix) {
  if (!prefix || typeof prefix !== 'string') return false;
  return prefix.trim().length > 0;
}

/**
 * Валидирует окончания для Type 6 (exact mode)
 * @param {string} endings - Окончания (разделитель: перенос строки)
 * @returns {boolean} - true, если окончания корректные
 * @example
 * validateType6Endings('ing\ned\ner') // true
 * validateType6Endings('') // false
 */
export function validateType6Endings(endings) {
  if (!endings || typeof endings !== 'string') return false;
  
  const lines = endings.split('\n').filter(line => line.trim().length > 0);
  return lines.length > 0;
}

/**
 * Валидирует опции для Type 6 (wildcard mode)
 * @param {Object} options - Опции: { cyrillic, latin, digits, any }
 * @returns {boolean} - true, если хотя бы одна опция включена
 * @example
 * validateType6Options({ cyrillic: true, latin: false }) // true
 * validateType6Options({ cyrillic: false, latin: false, digits: false, any: false }) // false
 */
export function validateType6Options(options) {
  if (!options || typeof options !== 'object') return false;
  
  const { cyrillic, latin, digits, any } = options;
  
  // Хотя бы одна опция должна быть включена
  return cyrillic || latin || digits || any;
}

/**
 * Валидирует формат экспорта
 * @param {string} format - Формат: 'txt', 'csv', 'json'
 * @returns {boolean} - true, если формат корректный
 * @example
 * validateExportFormat('json') // true
 * validateExportFormat('xml') // false
 */
export function validateExportFormat(format) {
  if (!format || typeof format !== 'string') return false;
  const validFormats = ['txt', 'csv', 'json'];
  return validFormats.includes(format.toLowerCase());
}

/**
 * Валидирует ID элемента (не пустая строка)
 * @param {string} id - ID элемента
 * @returns {boolean} - true, если ID корректный
 * @example
 * validateId('group-123') // true
 * validateId('') // false
 */
export function validateId(id) {
  if (!id || typeof id !== 'string') return false;
  return id.trim().length > 0;
}

/**
 * Валидирует email (простая проверка)
 * @param {string} email - Email
 * @returns {boolean} - true, если email корректный
 * @example
 * validateEmail('test@example.com') // true
 * validateEmail('invalid') // false
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Валидирует число в диапазоне
 * @param {number} value - Значение
 * @param {number} min - Минимум
 * @param {number} max - Максимум
 * @returns {boolean} - true, если значение в диапазоне
 * @example
 * validateNumberInRange(5, 1, 10) // true
 * validateNumberInRange(15, 1, 10) // false
 */
export function validateNumberInRange(value, min, max) {
  if (typeof value !== 'number' || isNaN(value)) return false;
  return value >= min && value <= max;
}

/**
 * Валидирует массив (не пустой)
 * @param {Array} array - Массив
 * @returns {boolean} - true, если массив не пустой
 * @example
 * validateNonEmptyArray([1, 2, 3]) // true
 * validateNonEmptyArray([]) // false
 */
export function validateNonEmptyArray(array) {
  return Array.isArray(array) && array.length > 0;
}

/**
 * Валидирует объект (не пустой)
 * @param {Object} obj - Объект
 * @returns {boolean} - true, если объект не пустой
 * @example
 * validateNonEmptyObject({ a: 1 }) // true
 * validateNonEmptyObject({}) // false
 */
export function validateNonEmptyObject(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  return Object.keys(obj).length > 0;
}
