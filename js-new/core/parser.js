/**
 * RegexHelper v4.0 - Trigger Parser
 * 
 * Модуль для парсинга, обработки и валидации триггеров.
 * Включает автозамену "ё" на "[её]" и удаление дубликатов.
 * 
 * @version 1.0
 * @date 12.02.2026
 */

import { escapeRegex } from './utils.js';
import { SIMPLETRIGGERSCONFIG } from './config.js';

/**
 * Парсит текст и возвращает массив уникальных триггеров
 * @param {string} text - Текст с триггерами (разделитель: перенос строки)
 * @returns {string[]} - Массив триггеров
 * @example
 * parseSimpleTriggers('привет\nмир\nпривет') // ['привет', 'мир']
 */
export function parseSimpleTriggers(text) {
  if (!text || typeof text !== 'string') return [];

  // Автозамена ё → [её]
  text = replaceYo(text);

  // Разбиваем по переносам строк
  const triggers = text
    .split('\n')
    .map(t => t.trim())
    .filter(t => t.length >= SIMPLETRIGGERSCONFIG.MINTRIGGERLENGTH);

  // Удаляем дубликаты
  return removeDuplicatesFromTriggers(triggers);
}

/**
 * Заменяет букву "ё" на "[её]" (автозамена для regex)
 * Применяется к строчным и заглавным: ё → [её], Ё → [ЁЕ]
 * @param {string} text - Текст для обработки
 * @returns {string} - Обработанный текст
 * @example
 * replaceYo('ёлка') // '[её]лка'
 * replaceYo('Ёжик') // '[ЁЕ]жик'
 * replaceYo('всё') // 'вс[её]'
 */
export function replaceYo(text) {
  if (!text || typeof text !== 'string') return '';

  return text.replace(/[ёЁ]/g, (match) => {
    return match === 'ё' ? '[её]' : '[ЁЕ]';
  });
}

/**
 * Добавляет границы слова (\b) к триггеру, если нужно
 * Проверяет первый и последний символы: если буква/цифра - добавляет \b
 * @param {string} trigger - Триггер
 * @returns {string} - Триггер с границами слова
 * @example
 * addWordBoundaries('test') // '\\btest\\b'
 * addWordBoundaries('.test') // '.test\\b'
 * addWordBoundaries('test!') // '\\btest!'
 */
export function addWordBoundaries(trigger) {
  if (!trigger || typeof trigger !== 'string') return '';

  // Проверяем, нужна ли граница в начале (если первый символ - буква/цифра/underscore)
  const needsStart = /^[a-zA-Zа-яА-ЯёЁ0-9_]/.test(trigger);
  
  // Проверяем, нужна ли граница в конце
  const needsEnd = /[a-zA-Zа-яА-ЯёЁ0-9_]$/.test(trigger);

  let result = trigger;
  if (needsStart) result = '\\b' + result;
  if (needsEnd) result = result + '\\b';

  return result;
}

/**
 * Удаляет дубликаты из массива триггеров (case-insensitive)
 * @param {string[]} triggers - Массив триггеров
 * @returns {string[]} - Массив уникальных триггеров
 * @example
 * removeDuplicatesFromTriggers(['Привет', 'привет', 'мир']) // ['Привет', 'мир']
 */
export function removeDuplicatesFromTriggers(triggers) {
  if (!Array.isArray(triggers)) return [];

  const seen = new Set();
  const unique = [];

  for (const trigger of triggers) {
    const lowerCaseTrigger = trigger.toLowerCase();
    if (!seen.has(lowerCaseTrigger)) {
      seen.add(lowerCaseTrigger);
      unique.push(trigger); // Сохраняем оригинальный регистр
    }
  }

  return unique;
}

/**
 * Возвращает статистику по триггерам
 * @param {string} text - Текст с триггерами
 * @returns {Object} - Объект со статистикой
 * @property {number} count - Общее количество триггеров (с дубликатами)
 * @property {number} uniqueCount - Количество уникальных триггеров
 * @property {number} duplicatesCount - Количество дубликатов
 * @property {boolean} hasLimit - Превышен ли лимит триггеров
 * @property {boolean} nearLimit - Близок ли к лимиту (>= 150)
 * @example
 * getTriggerStats('привет\nмир\nпривет')
 * // { count: 3, uniqueCount: 2, duplicatesCount: 1, hasLimit: false, nearLimit: false }
 */
export function getTriggerStats(text) {
  if (!text || typeof text !== 'string') {
    return {
      count: 0,
      uniqueCount: 0,
      duplicatesCount: 0,
      hasLimit: false,
      nearLimit: false
    };
  }

  // Все триггеры (с дубликатами)
  const allTriggers = text
    .split('\n')
    .map(t => t.trim())
    .filter(t => t.length > 0);

  // Уникальные триггеры (case-insensitive)
  const uniqueTriggers = [...new Set(allTriggers.map(t => t.toLowerCase()))];

  const count = allTriggers.length;
  const uniqueCount = uniqueTriggers.length;
  const duplicatesCount = count - uniqueCount;
  const hasLimit = uniqueCount > SIMPLETRIGGERSCONFIG.MAXTRIGGERS;
  const nearLimit = uniqueCount >= 150; // Предупреждение при >= 150

  return {
    count,
    uniqueCount,
    duplicatesCount,
    hasLimit,
    nearLimit
  };
}

/**
 * Проверяет, есть ли триггеры в тексте
 * @param {string} text - Текст для проверки
 * @returns {boolean} - true, если есть хотя бы один триггер
 * @example
 * hasTriggersInText('привет\nмир') // true
 * hasTriggersInText('   \n  \n  ') // false
 */
export function hasTriggersInText(text) {
  if (!text || typeof text !== 'string') return false;

  const triggers = text
    .split('\n')
    .map(t => t.trim())
    .filter(t => t.length > 0);

  return triggers.length > 0;
}

/**
 * Экранирует спецсимволы regex (алиас для utils.escapeRegex)
 * @param {string} str - Строка для экранирования
 * @returns {string} - Экранированная строка
 * @example
 * escapeSpecialChars('test.com') // 'test\\.com'
 */
export function escapeSpecialChars(str) {
  return escapeRegex(str);
}

/**
 * Парсит и очищает триггеры (полный pipeline)
 * Применяет: trim → replaceYo → удаление коротких → удаление дубликатов
 * @param {string} text - Текст с триггерами
 * @returns {string[]} - Массив обработанных триггеров
 * @example
 * parseAndCleanTriggers('ёлка\n  мир  \nёлка\na') // ['[её]лка', 'мир']
 */
export function parseAndCleanTriggers(text) {
  if (!text || typeof text !== 'string') return [];

  // Автозамена ё → [её]
  text = replaceYo(text);

  // Парсинг
  const triggers = text
    .split('\n')
    .map(t => t.trim())
    .filter(t => t.length >= SIMPLETRIGGERSCONFIG.MINTRIGGERLENGTH);

  // Удаление дубликатов
  return removeDuplicatesFromTriggers(triggers);
}

/**
 * Нормализует триггер (trim + toLowerCase)
 * @param {string} trigger - Триггер
 * @returns {string} - Нормализованный триггер
 * @example
 * normalizeTrigger('  Привет  ') // 'привет'
 */
export function normalizeTrigger(trigger) {
  if (!trigger || typeof trigger !== 'string') return '';
  return trigger.trim().toLowerCase();
}

/**
 * Разбивает текст на строки и возвращает массив непустых строк
 * @param {string} text - Текст
 * @returns {string[]} - Массив строк
 * @example
 * splitIntoLines('line1\nline2\n\nline3') // ['line1', 'line2', 'line3']
 */
export function splitIntoLines(text) {
  if (!text || typeof text !== 'string') return [];
  
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

/**
 * Подсчитывает количество строк в тексте
 * @param {string} text - Текст
 * @returns {number} - Количество непустых строк
 * @example
 * countLines('line1\nline2\n\nline3') // 3
 */
export function countLines(text) {
  if (!text || typeof text !== 'string') return 0;
  return splitIntoLines(text).length;
}

/**
 * Проверяет, является ли триггер коротким (< SHORTTRIGGERLENGTH)
 * @param {string} trigger - Триггер
 * @returns {boolean} - true, если триггер короткий
 * @example
 * isShortTrigger('ok') // true (< 3 символов)
 * isShortTrigger('test') // false
 */
export function isShortTrigger(trigger) {
  if (!trigger || typeof trigger !== 'string') return false;
  return trigger.length < SIMPLETRIGGERSCONFIG.SHORTTRIGGERLENGTH;
}

/**
 * Фильтрует короткие триггеры из массива
 * @param {string[]} triggers - Массив триггеров
 * @returns {string[]} - Массив без коротких триггеров
 * @example
 * filterShortTriggers(['ok', 'test', 'hi']) // ['test']
 */
export function filterShortTriggers(triggers) {
  if (!Array.isArray(triggers)) return [];
  return triggers.filter(t => !isShortTrigger(t));
}

/**
 * Возвращает короткие триггеры из массива (для предупреждений)
 * @param {string[]} triggers - Массив триггеров
 * @returns {string[]} - Массив коротких триггеров
 * @example
 * getShortTriggers(['ok', 'test', 'hi']) // ['ok', 'hi']
 */
export function getShortTriggers(triggers) {
  if (!Array.isArray(triggers)) return [];
  return triggers.filter(t => isShortTrigger(t));
}
