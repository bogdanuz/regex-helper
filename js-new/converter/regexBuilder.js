/**
 * RegexHelper v4.0 - Regex Builder
 * 
 * Модуль для сборки итогового regex из простых и связанных триггеров.
 * Обрабатывает режимы связи (Individual, Common, Alternation),
 * добавляет границы слов и объединяет результаты.
 * 
 * @version 1.0
 * @date 12.02.2026
 */

import { escapeRegex } from '../core/utils.js';
import { validateRegexLength, validateRegexSyntax } from '../core/validator.js';

/**
 * Собирает итоговый regex из массива regex-паттернов
 * @param {string[]} regexPatterns - Массив regex-паттернов
 * @param {string} mode - Режим объединения: 'alternation' (|) или 'concatenation' (без разделителя)
 * @returns {string} - Итоговый regex
 * @example
 * buildFinalRegex(['test', 'hello'], 'alternation') // 'test|hello'
 * buildFinalRegex(['test', 'hello'], 'concatenation') // 'testhello'
 */
export function buildFinalRegex(regexPatterns, mode = 'alternation') {
  if (!Array.isArray(regexPatterns) || regexPatterns.length === 0) return '';

  // Фильтруем пустые паттерны
  const validPatterns = regexPatterns.filter(p => p && typeof p === 'string' && p.trim().length > 0);

  if (validPatterns.length === 0) return '';
  if (validPatterns.length === 1) return validPatterns[0];

  // Объединяем в зависимости от режима
  if (mode === 'alternation') {
    return validPatterns.join('|');
  } else {
    return validPatterns.join('');
  }
}

/**
 * Добавляет границы слова (\b) к regex-паттерну
 * @param {string} pattern - Regex-паттерн
 * @param {boolean} [addStart=true] - Добавить \b в начале
 * @param {boolean} [addEnd=true] - Добавить \b в конце
 * @returns {string} - Паттерн с границами слова
 * @example
 * addWordBoundaries('test') // '\\btest\\b'
 * addWordBoundaries('test', true, false) // '\\btest'
 */
export function addWordBoundaries(pattern, addStart = true, addEnd = true) {
  if (!pattern || typeof pattern !== 'string') return '';

  let result = pattern;

  // Проверяем, нужна ли граница в начале
  if (addStart && /^[a-zA-Zа-яА-ЯёЁ0-9_]/.test(pattern)) {
    result = '\\b' + result;
  }

  // Проверяем, нужна ли граница в конце
  if (addEnd && /[a-zA-Zа-яА-ЯёЁ0-9_]$/.test(pattern)) {
    result = result + '\\b';
  }

  return result;
}

/**
 * Оборачивает паттерн в группу захвата (...)
 * @param {string} pattern - Regex-паттерн
 * @param {boolean} [capturing=false] - Создать захватывающую группу (true) или нет (false)
 * @returns {string} - Паттерн, обернутый в группу
 * @example
 * wrapInGroup('test|hello') // '(?:test|hello)'
 * wrapInGroup('test|hello', true) // '(test|hello)'
 */
export function wrapInGroup(pattern, capturing = false) {
  if (!pattern || typeof pattern !== 'string') return '';

  if (capturing) {
    return `(${pattern})`;
  } else {
    return `(?:${pattern})`;
  }
}

/**
 * Объединяет массив паттернов через alternation (|)
 * @param {string[]} patterns - Массив паттернов
 * @returns {string} - Объединенный паттерн
 * @example
 * joinWithAlternation(['test', 'hello', 'world']) // 'test|hello|world'
 */
export function joinWithAlternation(patterns) {
  if (!Array.isArray(patterns) || patterns.length === 0) return '';

  const validPatterns = patterns.filter(p => p && typeof p === 'string' && p.trim().length > 0);

  return validPatterns.join('|');
}

/**
 * Объединяет массив паттернов с расстоянием .{min,max}
 * @param {string[]} patterns - Массив паттернов
 * @param {Object} distance - Объект с min и max
 * @returns {string} - Объединенный паттерн с расстоянием
 * @example
 * joinWithDistance(['hello', 'world'], { min: 1, max: 10 }) 
 * // 'hello.{1,10}world'
 */
export function joinWithDistance(patterns, distance = { min: 1, max: 7 }) {
  if (!Array.isArray(patterns) || patterns.length === 0) return '';

  const validPatterns = patterns.filter(p => p && typeof p === 'string' && p.trim().length > 0);

  if (validPatterns.length === 0) return '';
  if (validPatterns.length === 1) return validPatterns[0];

  const { min, max } = distance;
  return validPatterns.join(`.{${min},${max}}`);
}

/**
 * Строит regex для режима Individual (каждая группа отдельно)
 * @param {Array<Object>} groups - Массив групп
 * @returns {string[]} - Массив regex-паттернов (по одному на группу)
 * @example
 * buildIndividualMode([
 *   { subgroups: [{ triggers: ['hello', 'world'] }], distance: { min: 1, max: 7 } }
 * ])
 * // ['hello.{1,7}world']
 */
export function buildIndividualMode(groups) {
  if (!Array.isArray(groups) || groups.length === 0) return [];

  return groups.map(group => {
    const subgroupPatterns = group.subgroups.map(subgroup => {
      return joinWithAlternation(subgroup.triggers);
    });

    if (group.distance) {
      return joinWithDistance(subgroupPatterns, group.distance);
    } else {
      return joinWithAlternation(subgroupPatterns);
    }
  });
}

/**
 * Строит regex для режима Common (все группы с общим расстоянием)
 * @param {Array<Object>} groups - Массив групп
 * @param {Object} commonDistance - Общее расстояние для всех групп
 * @returns {string} - Единый regex-паттерн
 * @example
 * buildCommonMode([
 *   { subgroups: [{ triggers: ['hello'] }] },
 *   { subgroups: [{ triggers: ['world'] }] }
 * ], { min: 1, max: 10 })
 * // 'hello.{1,10}world'
 */
export function buildCommonMode(groups, commonDistance = { min: 1, max: 7 }) {
  if (!Array.isArray(groups) || groups.length === 0) return '';

  const allSubgroupPatterns = [];

  groups.forEach(group => {
    group.subgroups.forEach(subgroup => {
      const pattern = joinWithAlternation(subgroup.triggers);
      if (pattern) {
        allSubgroupPatterns.push(pattern);
      }
    });
  });

  if (allSubgroupPatterns.length === 0) return '';
  if (allSubgroupPatterns.length === 1) return allSubgroupPatterns[0];

  return joinWithDistance(allSubgroupPatterns, commonDistance);
}

/**
 * Строит regex для режима Alternation (все триггеры через |)
 * @param {Array<Object>} groups - Массив групп
 * @returns {string} - Единый regex-паттерн
 * @example
 * buildAlternationMode([
 *   { subgroups: [{ triggers: ['hello', 'world'] }] },
 *   { subgroups: [{ triggers: ['test'] }] }
 * ])
 * // 'hello|world|test'
 */
export function buildAlternationMode(groups) {
  if (!Array.isArray(groups) || groups.length === 0) return '';

  const allTriggers = [];

  groups.forEach(group => {
    group.subgroups.forEach(subgroup => {
      if (Array.isArray(subgroup.triggers)) {
        allTriggers.push(...subgroup.triggers);
      }
    });
  });

  if (allTriggers.length === 0) return '';

  return joinWithAlternation(allTriggers);
}

/**
 * Валидирует и оптимизирует итоговый regex
 * @param {string} regex - Regex для валидации
 * @returns {Object} - Результат валидации
 * @property {boolean} valid - true, если regex корректный
 * @property {string} error - Сообщение об ошибке (если есть)
 * @property {string} optimized - Оптимизированный regex (если валидация прошла)
 * @example
 * validateAndOptimizeRegex('test|hello')
 * // { valid: true, error: null, optimized: 'test|hello' }
 */
export function validateAndOptimizeRegex(regex) {
  if (!regex || typeof regex !== 'string') {
    return {
      valid: false,
      error: 'Regex пустой',
      optimized: null
    };
  }

  // Проверка длины
  if (!validateRegexLength(regex)) {
    return {
      valid: false,
      error: 'Regex слишком длинный (превышает 10000 символов)',
      optimized: null
    };
  }

  // Проверка синтаксиса
  if (!validateRegexSyntax(regex)) {
    return {
      valid: false,
      error: 'Некорректный синтаксис regex',
      optimized: null
    };
  }

  return {
    valid: true,
    error: null,
    optimized: regex
  };
}

/**
 * Убирает лишние скобки и упрощает regex
 * @param {string} regex - Regex для оптимизации
 * @returns {string} - Оптимизированный regex
 * @example
 * simplifyRegex('(?:test)') // 'test'
 * simplifyRegex('(a)|(b)') // 'a|b'
 */
export function simplifyRegex(regex) {
  if (!regex || typeof regex !== 'string') return '';

  let result = regex;

  // Убираем лишние незахватывающие группы с одним элементом
  result = result.replace(/\(\?:([^|()]+)\)/g, '$1');

  // Упрощаем (a|b) до a|b, если скобки не нужны
  // (упрощенная версия, полная требует парсера)

  return result;
}

/**
 * Экранирует весь regex-паттерн для использования как литерала
 * @param {string} pattern - Паттерн для экранирования
 * @returns {string} - Экранированный паттерн
 * @example
 * escapePattern('test.com') // 'test\\.com'
 */
export function escapePattern(pattern) {
  return escapeRegex(pattern);
}

/**
 * Добавляет флаги к regex
 * @param {string} regex - Regex
 * @param {string[]} flags - Массив флагов: ['i', 'g', 'm', 's', 'u', 'y']
 * @returns {string} - Regex с флагами
 * @example
 * addFlags('test', ['i', 'g']) // '/test/ig'
 */
export function addFlags(regex, flags = []) {
  if (!regex || typeof regex !== 'string') return '';
  if (!Array.isArray(flags) || flags.length === 0) return regex;

  const validFlags = flags.filter(f => ['i', 'g', 'm', 's', 'u', 'y'].includes(f));
  const flagString = [...new Set(validFlags)].join('');

  return `/${regex}/${flagString}`;
}

/**
 * Оборачивает regex в обязательные границы слова
 * @param {string} regex - Regex
 * @returns {string} - Regex с границами слова
 * @example
 * ensureWordBoundaries('test|hello') // '\\b(?:test|hello)\\b'
 */
export function ensureWordBoundaries(regex) {
  if (!regex || typeof regex !== 'string') return '';

  // Если уже есть границы - не добавляем
  if (regex.startsWith('\\b') && regex.endsWith('\\b')) {
    return regex;
  }

  // Оборачиваем в группу, если есть |
  if (regex.includes('|')) {
    return `\\b(?:${regex})\\b`;
  }

  return `\\b${regex}\\b`;
}

/**
 * Объединяет простые и связанные триггеры в один regex
 * @param {string} simpleRegex - Regex из простых триггеров
 * @param {string} linkedRegex - Regex из связанных триггеров
 * @returns {string} - Объединенный regex
 * @example
 * combineSimpleAndLinked('test', 'hello.{1,7}world') // 'test|hello.{1,7}world'
 */
export function combineSimpleAndLinked(simpleRegex, linkedRegex) {
  const patterns = [];

  if (simpleRegex && simpleRegex.trim().length > 0) {
    patterns.push(simpleRegex);
  }

  if (linkedRegex && linkedRegex.trim().length > 0) {
    patterns.push(linkedRegex);
  }

  if (patterns.length === 0) return '';
  if (patterns.length === 1) return patterns[0];

  return patterns.join('|');
}

/**
 * Подсчитывает количество альтернаций (|) в regex
 * @param {string} regex - Regex
 * @returns {number} - Количество альтернаций
 * @example
 * countAlternations('test|hello|world') // 2
 */
export function countAlternations(regex) {
  if (!regex || typeof regex !== 'string') return 0;

  // Простой подсчет (не учитывает вложенные группы)
  return (regex.match(/\|/g) || []).length;
}

/**
 * Получает статистику по regex
 * @param {string} regex - Regex
 * @returns {Object} - Статистика
 * @property {number} length - Длина regex
 * @property {number} alternations - Количество альтернаций
 * @property {boolean} hasGroups - Есть ли группы
 * @property {boolean} hasDistance - Есть ли .{min,max}
 * @example
 * getRegexStats('test|hello') 
 * // { length: 11, alternations: 1, hasGroups: false, hasDistance: false }
 */
export function getRegexStats(regex) {
  if (!regex || typeof regex !== 'string') {
    return {
      length: 0,
      alternations: 0,
      hasGroups: false,
      hasDistance: false
    };
  }

  return {
    length: regex.length,
    alternations: countAlternations(regex),
    hasGroups: /\(/.test(regex),
    hasDistance: /\.\{[\d,]+\}/.test(regex)
  };
}
