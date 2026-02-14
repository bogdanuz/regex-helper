/**
 * ═══════════════════════════════════════════════════════════════════
 * REGEXHELPER v4.0 - Prefix.js
 * Type 6: Префикс (Wildcard и Exact)
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * ПРЕФИКС — ДВА РЕЖИМА:
 * 
 * 1. WILDCARD — префикс-.*
 *    Пример: 'актёр' с префиксом 'мега' → 'мега-.*актёр'
 * 
 * 2. EXACT — префикс(?:окончание1|окончание2|...)
 *    Пример: 'актёр' с префиксами 'мега', 'супер', 'ультра' → '(?:мега|супер|ультра)актёр'
 */

/**
 * Применить префикс в режиме Wildcard
 * @param {string} prefix - Префикс
 * @param {string} separator - Разделитель (по умолчанию '-')
 * @returns {string} Regex паттерн префикс-.*
 * 
 * @example
 * applyPrefixWildcard('мега') → 'мега-.*'
 * applyPrefixWildcard('супер', '') → 'супер.*'
 */
export function applyPrefixWildcard(prefix, separator = '-') {
    if (!prefix || typeof prefix !== 'string') {
        throw new Error('Prefix: префикс должен быть строкой');
    }

    // Экранировать спецсимволы regex в префиксе
    const escapedPrefix = escapeRegex(prefix);
    const escapedSeparator = separator ? escapeRegex(separator) : '';

    return `${escapedPrefix}${escapedSeparator}.*`;
}

/**
 * Применить префикс в режиме Exact
 * @param {Array<string>} prefixes - Массив префиксов
 * @param {string} separator - Разделитель (по умолчанию '-')
 * @returns {string} Regex паттерн (?:префикс1|префикс2|...)
 * 
 * @example
 * applyPrefixExact(['мега', 'супер', 'ультра']) → '(?:мега|супер|ультра)-'
 * applyPrefixExact(['мега', 'супер'], '') → '(?:мега|супер)'
 */
export function applyPrefixExact(prefixes, separator = '-') {
    if (!Array.isArray(prefixes) || prefixes.length === 0) {
        throw new Error('Prefix: prefixes должен быть непустым массивом');
    }

    // Отфильтровать пустые префиксы
    const validPrefixes = prefixes.filter(p => p && p.trim().length > 0);

    if (validPrefixes.length === 0) {
        throw new Error('Prefix: нет валидных префиксов');
    }

    // Экранировать спецсимволы regex в каждом префиксе
    const escapedPrefixes = validPrefixes.map(p => escapeRegex(p.trim()));
    const escapedSeparator = separator ? escapeRegex(separator) : '';

    // Если один префикс, не нужна группа
    if (escapedPrefixes.length === 1) {
        return `${escapedPrefixes[0]}${escapedSeparator}`;
    }

    return `(?:${escapedPrefixes.join('|')})${escapedSeparator}`;
}

/**
 * Комбинировать префикс с триггером
 * @param {string} prefix - Префикс (regex паттерн)
 * @param {string} trigger - Триггер (regex паттерн)
 * @returns {string} Полный regex паттерн
 * 
 * @example
 * combineWithTrigger('мега-.*', 'актёр') → 'мега-.*актёр'
 * combineWithTrigger('(?:мега|супер)-', '(?:актёр|актриса)') → '(?:мега|супер)-(?:актёр|актриса)'
 */
export function combineWithTrigger(prefix, trigger) {
    if (!prefix || !trigger) {
        throw new Error('Prefix: префикс и триггер обязательны');
    }

    return `${prefix}${trigger}`;
}

/**
 * Валидация префикса
 * @param {string|Array<string>} prefix - Префикс или массив префиксов
 * @param {string} mode - Режим ('wildcard' или 'exact')
 * @returns {Object} {valid: boolean, errors: Array<string>}
 */
export function validatePrefix(prefix, mode) {
    const errors = [];

    if (mode === 'wildcard') {
        if (!prefix || typeof prefix !== 'string') {
            errors.push('Режим Wildcard: префикс должен быть строкой');
        } else if (prefix.trim().length === 0) {
            errors.push('Режим Wildcard: префикс не может быть пустым');
        }
    } else if (mode === 'exact') {
        if (!Array.isArray(prefix)) {
            errors.push('Режим Exact: префикс должен быть массивом');
        } else if (prefix.length === 0) {
            errors.push('Режим Exact: массив префиксов не может быть пустым');
        } else {
            const validPrefixes = prefix.filter(p => p && p.trim().length > 0);
            if (validPrefixes.length === 0) {
                errors.push('Режим Exact: нет валидных префиксов');
            }
        }
    } else {
        errors.push(`Неизвестный режим: ${mode}`);
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Парсинг префиксов из textarea (режим Exact)
 * @param {string} text - Текст из textarea (каждая строка — префикс)
 * @returns {Array<string>} Массив префиксов
 * 
 * @example
 * parsePrefixes('мега\nсупер\nультра') → ['мега', 'супер', 'ультра']
 */
export function parsePrefixes(text) {
    if (!text || typeof text !== 'string') {
        return [];
    }

    // Разделить по переносу строки
    const lines = text.split('\n').map(line => line.trim());

    // Отфильтровать пустые строки
    return lines.filter(line => line.length > 0);
}

/**
 * Экранировать спецсимволы regex
 * @param {string} text - Текст
 * @returns {string} Экранированный текст
 * 
 * @example
 * escapeRegex('мега-актёр.') → 'мега\-актёр\.'
 */
function escapeRegex(text) {
    // Экранировать спецсимволы: . * + ? ^ $ { } ( ) | [ ] \ /
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Создать preview для префикса
 * @param {string|Array<string>} prefix - Префикс или массив префиксов
 * @param {string} mode - Режим ('wildcard' или 'exact')
 * @param {string} separator - Разделитель
 * @param {string} sampleTrigger - Триггер для примера (опционально)
 * @returns {string} Preview regex паттерна
 * 
 * @example
 * createPrefixPreview('мега', 'wildcard', '-', 'актёр') → 'мега-.*актёр'
 * createPrefixPreview(['мега', 'супер'], 'exact', '-', 'актёр') → '(?:мега|супер)-актёр'
 */
export function createPrefixPreview(prefix, mode, separator = '-', sampleTrigger = 'триггер') {
    try {
        let prefixPattern;

        if (mode === 'wildcard') {
            prefixPattern = applyPrefixWildcard(prefix, separator);
        } else if (mode === 'exact') {
            prefixPattern = applyPrefixExact(Array.isArray(prefix) ? prefix : [prefix], separator);
        } else {
            return 'Неизвестный режим';
        }

        return combineWithTrigger(prefixPattern, sampleTrigger);

    } catch (error) {
        return `Ошибка: ${error.message}`;
    }
}

export { escapeRegex };
