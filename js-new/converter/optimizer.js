/**
 * RegexHelper v4.0 - Converter Optimizer
 * Оптимизация regex (6 типов)
 * @version 1.0
 * @date 11.02.2026
 */

import { escapeRegex } from '../core/utils.js';
import { OPTIMIZERCONFIG } from '../core/config.js';

/**
 * Применяет оптимизации к массиву триггеров
 * @param {Array<string>} triggers - Массив триггеров
 * @param {Array<number>} types - Массив типов оптимизаций [1,2,4,5,6]
 * @returns {string} - Оптимизированный regex
 * @example
 * applyOptimizations(['дом', 'дома'], [1, 2]) // => '[дd][оo]м[аa]?'
 */
export function applyOptimizations(triggers, types = []) {
    if (!Array.isArray(triggers) || triggers.length === 0) {
        return '';
    }

    if (!Array.isArray(types) || types.length === 0) {
        return triggers.map(t => escapeRegex(t)).join('|');
    }

    let result = [...triggers];

    if (types.includes(1)) {
        result = result.map(t => applyType1(t));
    }

    if (types.includes(2)) {
        result = [applyType2(result)];
    }

    if (types.includes(4)) {
        result = result.map(t => applyType4(t));
    }

    if (types.includes(5)) {
        result = result.map(t => applyType5(t));
    }

    if (types.includes(6)) {
        result = result.map(t => applyType6(t));
    }

    return result.join('|');
}

/**
 * Type 1: Латиница/кириллица (д/d, о/o, а/a, т/t...)
 * @param {string} trigger - Триггер
 * @returns {string} - Триггер с вариациями
 * @example
 * applyType1('дом') // => '[дd][оo][мm]'
 */
export function applyType1(trigger) {
    if (!trigger || typeof trigger !== 'string') {
        return '';
    }

    const map = {
        'а': '[аa]', 'a': '[аa]',
        'в': '[вb]', 'b': '[вb]',
        'д': '[дd]', 'd': '[дd]',  // ← ДОБАВИЛ!
        'е': '[еe]', 'e': '[еe]',
        'к': '[кk]', 'k': '[кk]',
        'м': '[мm]', 'm': '[мm]',
        'н': '[нh]', 'h': '[нh]',
        'о': '[оo]', 'o': '[оo]',
        'р': '[рp]', 'p': '[рp]',
        'с': '[сc]', 'c': '[сc]',
        'т': '[тt]', 't': '[тt]',
        'у': '[уy]', 'y': '[уy]',
        'х': '[хx]', 'x': '[хx]'
    };

    let result = '';
    for (const char of trigger.toLowerCase()) {
        result += map[char] || escapeRegex(char);
    }

    return result;
}

/**
 * Type 2: Общие корни (тест, тестер, тестирование → тест(ер|ирование)?)
 * @param {Array<string>} triggers - Массив триггеров
 * @returns {string} - Regex с общим корнем
 * @example
 * applyType2(['тест', 'тестер']) // => 'тест(ер)?'
 */
export function applyType2(triggers) {
    if (!Array.isArray(triggers) || triggers.length === 0) {
        return '';
    }

    if (triggers.length === 1) {
        return escapeRegex(triggers[0]);
    }

    const commonPrefix = findCommonPrefix(triggers);

    if (commonPrefix.length < 2) {
        return triggers.map(t => escapeRegex(t)).join('|');
    }

    const suffixes = triggers
        .map(t => t.substring(commonPrefix.length))
        .filter(s => s.length > 0);

    if (suffixes.length === 0) {
        return escapeRegex(commonPrefix);
    }

    const escapedPrefix = escapeRegex(commonPrefix);

    if (suffixes.length === 1) {
        return `${escapedPrefix}(${escapeRegex(suffixes[0])})?`;
    }

    const maxSuffixLength = Math.max(...suffixes.map(s => s.length));

    if (maxSuffixLength > 10) {
        const escapedSuffixes = suffixes.map(s => escapeRegex(s)).join('|');
        return `${escapedPrefix}(${escapedSuffixes})?`;
    }

    const escapedSuffixes = suffixes.map(s => escapeRegex(s)).join('|');
    return `${escapedPrefix}(${escapedSuffixes})?`;
}

/**
 * Type 3: Расстояние между словами (.{min,max})
 * ВАЖНО: Используется ТОЛЬКО в linked-triggers!
 * @param {Array<string>} triggers - Массив триггеров
 * @param {Object} distance - Объект {min, max}
 * @returns {string} - Regex с расстоянием
 * @example
 * applyType3(['купить', 'айфон'], {min: 1, max: 7}) // => 'купить.{1,7}айфон'
 */
export function applyType3(triggers, distance = { min: 1, max: 7 }) {
    if (!Array.isArray(triggers) || triggers.length < 2) {
        return triggers.map(t => escapeRegex(t)).join('|');
    }

    const { min, max } = distance;
    const escapedTriggers = triggers.map(t => escapeRegex(t));

    return escapedTriggers.join(`.{${min},${max}}`);
}

/**
 * Type 4: Склонения (дом → дом(а|у|ом|е)?)
 * @param {string} trigger - Триггер (русское слово)
 * @returns {string} - Regex со склонениями
 * @example
 * applyType4('дом') // => 'дом(а|у|ом|е|ы|ами|ах|ой|ою)?'
 */
export function applyType4(trigger) {
    if (!trigger || typeof trigger !== 'string') {
        return '';
    }

    if (!/[а-яё]/i.test(trigger)) {
        return escapeRegex(trigger);
    }

    const endings = OPTIMIZERCONFIG.DECLENSIONENDINGS;
    const escapedTrigger = escapeRegex(trigger);
    const escapedEndings = endings.map(e => escapeRegex(e)).join('|');

    return `${escapedTrigger}(${escapedEndings})?`;
}

/**
 * Type 5: Удвоенные буквы (аллея → ал?лея)
 * @param {string} trigger - Триггер
 * @returns {string} - Regex с опциональными удвоениями
 * @example
 * applyType5('аллея') // => 'ал?лея'
 * applyType5('группа') // => 'груп?па'
 */
export function applyType5(trigger) {
    if (!trigger || typeof trigger !== 'string') {
        return '';
    }

    let result = '';
    let i = 0;

    while (i < trigger.length) {
        const char = trigger[i];
        const nextChar = trigger[i + 1];

        if (char === nextChar && /[a-zа-яё]/i.test(char)) {
            result += escapeRegex(char) + escapeRegex(char) + '?';
            i += 2;
        } else {
            result += escapeRegex(char);
            i += 1;
        }
    }

    return result;
}

/**
 * Type 6: Вариации через точку (test → t.e.s.t)
 * @param {string} trigger - Триггер
 * @returns {string} - Regex с точками между буквами
 * @example
 * applyType6('test') // => 't.e.s.t'
 * applyType6('тест') // => 'т.е.с.т'
 */
export function applyType6(trigger) {
    if (!trigger || typeof trigger !== 'string') {
        return '';
    }

    const chars = trigger.split('').map(c => escapeRegex(c));
    return chars.join('.');
}

/**
 * Находит общий префикс в массиве строк
 * @param {Array<string>} strings - Массив строк
 * @returns {string} - Общий префикс
 * @example
 * findCommonPrefix(['тест', 'тестер', 'тестирование']) // => 'тест'
 */
export function findCommonPrefix(strings) {
    if (!Array.isArray(strings) || strings.length === 0) {
        return '';
    }

    if (strings.length === 1) {
        return strings[0];
    }

    const sorted = strings.slice().sort();
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    let i = 0;

    while (i < first.length && first[i] === last[i]) {
        i++;
    }

    return first.substring(0, i);
}

/**
 * Генерирует склонения существительного (заглушка для RussianNouns)
 * @param {string} noun - Существительное
 * @returns {Array<string>} - Массив склонений
 * @example
 * generateDeclensions('дом') // => ['дом', 'дома', 'дому', 'домом', 'доме']
 */
export function generateDeclensions(noun) {
    if (!noun || typeof noun !== 'string') {
        return [noun];
    }

    if (typeof window !== 'undefined' && window.RussianNouns) {
        try {
            const declined = window.RussianNouns.decline(noun);
            return Object.values(declined).flat();
        } catch (error) {
            console.warn('RussianNouns error:', error);
        }
    }

    const endings = OPTIMIZERCONFIG.DECLENSIONENDINGS;
    return [noun, ...endings.map(e => noun + e)];
}

/**
 * Извлекает общий корень из массива триггеров (алиас для findCommonPrefix)
 * @param {Array<string>} triggers - Массив триггеров
 * @returns {string} - Общий корень
 * @example
 * extractCommonRoot(['тест', 'тестер']) // => 'тест'
 */
export function extractCommonRoot(triggers) {
    return findCommonPrefix(triggers);
}
