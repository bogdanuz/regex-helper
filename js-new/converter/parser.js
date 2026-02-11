/**
 * RegexHelper v4.0 - Converter Parser
 * Парсинг и обработка триггеров
 * @version 1.0
 * @date 11.02.2026
 */

import { escapeRegex } from '../core/utils.js';
import { SIMPLETRIGGERSCONFIG } from '../core/config.js';

/**
 * Парсит текст с триггерами в массив
 * @param {string} text - Текст с триггерами (по одному на строку)
 * @returns {Array<string>} - Массив обработанных триггеров
 * @example
 * parseSimpleTriggers('яблоко\nгруша\n  банан  ') // => ['яблоко', 'груша', 'банан']
 */
export function parseSimpleTriggers(text) {
    if (!text || typeof text !== 'string') {
        return [];
    }

    text = replaceYo(text);

    const triggers = text
        .split('\n')
        .map(t => t.trim())
        .filter(t => t.length >= SIMPLETRIGGERSCONFIG.MINTRIGGERLENGTH);

    return removeDuplicatesFromTriggers(triggers);
}

/**
 * Удаляет дубликаты из массива триггеров
 * @param {Array<string>} triggers - Массив триггеров
 * @returns {Array<string>} - Массив уникальных триггеров
 * @example
 * removeDuplicatesFromTriggers(['яблоко', 'груша', 'яблоко']) // => ['яблоко', 'груша']
 */
export function removeDuplicatesFromTriggers(triggers) {
    if (!Array.isArray(triggers)) {
        return [];
    }

    return [...new Set(triggers.map(t => t.toLowerCase()))];
}

/**
 * Получает статистику по триггерам
 * @param {string} text - Текст с триггерами
 * @returns {Object} - Объект со статистикой
 * @example
 * getTriggerStats('яблоко\nгруша\nяблоко') 
 * // => { count: 3, uniqueCount: 2, duplicatesCount: 1, hasLimit: false, nearLimit: false }
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

    const allTriggers = text
        .split('\n')
        .map(t => t.trim())
        .filter(t => t.length > 0);

    const uniqueTriggers = [...new Set(allTriggers.map(t => t.toLowerCase()))];

    const count = allTriggers.length;
    const uniqueCount = uniqueTriggers.length;
    const duplicatesCount = count - uniqueCount;
    const hasLimit = uniqueCount > SIMPLETRIGGERSCONFIG.MAXTRIGGERS;
    const nearLimit = uniqueCount >= 150;

    return {
        count,
        uniqueCount,
        duplicatesCount,
        hasLimit,
        nearLimit
    };
}

/**
 * Проверяет наличие триггеров в тексте
 * @param {string} text - Текст для проверки
 * @returns {boolean} - true если есть хотя бы один триггер
 * @example
 * hasTriggersInText('яблоко\nгруша') // => true
 * hasTriggersInText('   \n   ') // => false
 */
export function hasTriggersInText(text) {
    if (!text || typeof text !== 'string') {
        return false;
    }

    const triggers = text
        .split('\n')
        .map(t => t.trim())
        .filter(t => t.length > 0);

    return triggers.length > 0;
}

/**
 * Экранирует спецсимволы в строке для regex (использует escapeRegex)
 * @param {string} str - Строка для экранирования
 * @returns {string} - Экранированная строка
 * @example
 * escapeSpecialChars('test.com') // => 'test\\.com'
 */
export function escapeSpecialChars(str) {
    return escapeRegex(str);
}

/**
 * Добавляет границы слова (\b) к триггеру
 * @param {string} trigger - Триггер
 * @returns {string} - Триггер с границами слова
 * @example
 * addWordBoundaries('test') // => '\\btest\\b'
 * addWordBoundaries('тест') // => '\\bтест\\b'
 */
export function addWordBoundaries(trigger) {
    if (!trigger || typeof trigger !== 'string') {
        return '';
    }

    const needsStart = /^[a-zA-Zа-яА-ЯёЁ0-9]/.test(trigger);
    const needsEnd = /[a-zA-Zа-яА-ЯёЁ0-9]$/.test(trigger);

    let result = trigger;

    if (needsStart) {
        result = '\\b' + result;
    }

    if (needsEnd) {
        result = result + '\\b';
    }

    return result;
}

/**
 * Заменяет букву "ё" на "е" во всём тексте
 * ВАЖНО: Это нормализация для русского языка
 * @param {string} text - Текст для обработки
 * @returns {string} - Текст с заменённой "ё"
 * @example
 * replaceYo('ёлка') // => 'елка'
 * replaceYo('ЁЖИК') // => 'ЕЖИК'
 * replaceYo('Берёза') // => 'Береза'
 */
export function replaceYo(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }

    return text.replace(/ё/gi, (match) => {
        return match === 'ё' ? 'е' : 'Е';
    });
}
