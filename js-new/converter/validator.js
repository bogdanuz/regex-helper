/**
 * RegexHelper v4.0 - Converter Validator
 * Валидация триггеров и regex
 * @version 1.0
 * @date 11.02.2026
 */

import { SIMPLETRIGGERSCONFIG, APPCONFIG } from '../core/config.js';
import { showToast } from '../core/errors.js';

/**
 * Валидирует массив триггеров
 * @param {Array<string>} triggers - Массив триггеров для проверки
 * @returns {boolean} - true если валидация пройдена
 * @example
 * validateTriggers(['яблоко', 'груша']) // => true
 * validateTriggers([]) // => false (показывает Toast)
 */
export function validateTriggers(triggers) {
    if (!Array.isArray(triggers)) {
        showToast('error', 'Триггеры должны быть массивом');
        return false;
    }

    if (triggers.length === 0) {
        showToast('error', 'Нет триггеров для конвертации');
        return false;
    }

    if (triggers.length > SIMPLETRIGGERSCONFIG.MAXTRIGGERS) {
        showToast('error', `Слишком много триггеров (максимум ${SIMPLETRIGGERSCONFIG.MAXTRIGGERS})`);
        return false;
    }

    for (const trigger of triggers) {
        if (!validateTriggerLength(trigger)) {
            return false;
        }
    }

    return true;
}

/**
 * Валидирует длину regex
 * @param {string} regex - Regex для проверки
 * @returns {boolean} - true если длина допустима
 * @example
 * validateRegexLength('test') // => true
 * validateRegexLength('a'.repeat(10001)) // => false
 */
export function validateRegexLength(regex) {
    if (!regex || typeof regex !== 'string') {
        return false;
    }

    if (regex.length > APPCONFIG.MAXREGEXLENGTH) {
        showToast('error', `Regex слишком длинный (максимум ${APPCONFIG.MAXREGEXLENGTH} символов)`);
        return false;
    }

    if (regex.length > 8000) {
        showToast('warning', `Regex очень длинный (${regex.length} символов). Может работать медленно.`);
    }

    return true;
}

/**
 * Валидирует длину одного триггера
 * @param {string} trigger - Триггер для проверки
 * @returns {boolean} - true если длина допустима
 * @example
 * validateTriggerLength('яблоко') // => true
 * validateTriggerLength('a'.repeat(101)) // => false
 */
export function validateTriggerLength(trigger) {
    if (!trigger || typeof trigger !== 'string') {
        return false;
    }

    if (trigger.length < SIMPLETRIGGERSCONFIG.MINTRIGGERLENGTH) {
        showToast('error', `Триггер слишком короткий (минимум ${SIMPLETRIGGERSCONFIG.MINTRIGGERLENGTH} символ)`);
        return false;
    }

    if (trigger.length > SIMPLETRIGGERSCONFIG.MAXTRIGGERLENGTH) {
        showToast('error', `Триггер слишком длинный (максимум ${SIMPLETRIGGERSCONFIG.MAXTRIGGERLENGTH} символов)`);
        return false;
    }

    return true;
}

/**
 * Валидирует количество триггеров
 * @param {number} count - Количество триггеров
 * @returns {boolean} - true если количество допустимо
 * @example
 * validateTriggerCount(150) // => true
 * validateTriggerCount(250) // => false
 */
export function validateTriggerCount(count) {
    if (typeof count !== 'number' || count < 0) {
        return false;
    }

    if (count === 0) {
        showToast('error', 'Нет триггеров для конвертации');
        return false;
    }

    if (count > SIMPLETRIGGERSCONFIG.MAXTRIGGERS) {
        showToast('error', `Слишком много триггеров (максимум ${SIMPLETRIGGERSCONFIG.MAXTRIGGERS})`);
        return false;
    }

    if (count >= 150) {
        showToast('warning', `Много триггеров (${count}). Приближается лимит ${SIMPLETRIGGERSCONFIG.MAXTRIGGERS}.`);
    }

    return true;
}
