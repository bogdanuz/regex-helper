/**
 * ═══════════════════════════════════════════════════════════════════
 * REGEXHELPER v4.0 - OptionalChars.js
 * Type 5: Опциональные символы (символ?)
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Применить опциональные символы к триггеру
 * @param {string} text - Текст триггера
 * @param {Array<number>} optionalIndices - Массив индексов опциональных символов
 * @returns {string} Regex паттерн с символ?
 * 
 * @example
 * applyOptionalChars('актёр', [0, 2]) → 'а?кт?ёр'
 * applyOptionalChars('дом', [1, 2]) → 'до?м?'
 * applyOptionalChars('кот', []) → 'кот'
 * 
 * @throws {Error} Если индексы выходят за пределы текста
 */
export function applyOptionalChars(text, optionalIndices) {
    if (!text || typeof text !== 'string') {
        return text;
    }

    // Если нет индексов, вернуть оригинал
    if (!Array.isArray(optionalIndices) || optionalIndices.length === 0) {
        return text;
    }

    // Валидация: индексы не должны выходить за пределы текста
    const maxIndex = text.length - 1;
    for (const index of optionalIndices) {
        if (index < 0 || index > maxIndex) {
            throw new Error(
                `OptionalChars: индекс ${index} выходит за пределы текста (длина ${text.length})`
            );
        }
    }

    // Создать Set для быстрого поиска
    const optionalSet = new Set(optionalIndices);

    let result = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (optionalSet.has(i)) {
            // Символ опционален
            result += `${char}?`;
        } else {
            // Обычный символ
            result += char;
        }
    }

    return result;
}

/**
 * Валидация индексов опциональных символов
 * @param {string} text - Текст триггера
 * @param {Array<number>} optionalIndices - Массив индексов
 * @returns {Object} {valid: boolean, errors: Array<string>}
 */
export function validateOptionalIndices(text, optionalIndices) {
    const errors = [];

    if (!text || typeof text !== 'string') {
        errors.push('Текст должен быть строкой');
        return { valid: false, errors };
    }

    if (!Array.isArray(optionalIndices)) {
        errors.push('optionalIndices должен быть массивом');
        return { valid: false, errors };
    }

    const maxIndex = text.length - 1;

    for (const index of optionalIndices) {
        // Проверка: индекс должен быть числом
        if (!Number.isInteger(index)) {
            errors.push(`Индекс ${index} не является целым числом`);
            continue;
        }

        // Проверка: индекс не должен быть отрицательным
        if (index < 0) {
            errors.push(`Индекс ${index} не может быть отрицательным`);
            continue;
        }

        // Проверка: индекс не должен выходить за пределы
        if (index > maxIndex) {
            errors.push(`Индекс ${index} выходит за пределы текста (макс ${maxIndex})`);
            continue;
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Получить символы по индексам
 * @param {string} text - Текст триггера
 * @param {Array<number>} indices - Массив индексов
 * @returns {Array<Object>} Массив {index, char}
 * 
 * @example
 * getCharsByIndices('актёр', [0, 2, 4]) → [
 *   {index: 0, char: 'а'},
 *   {index: 2, char: 'т'},
 *   {index: 4, char: 'р'}
 * ]
 */
export function getCharsByIndices(text, indices) {
    if (!text || !Array.isArray(indices)) {
        return [];
    }

    return indices
        .filter(i => i >= 0 && i < text.length)
        .map(i => ({
            index: i,
            char: text[i]
        }));
}

/**
 * Создать preview опциональных символов
 * @param {string} text - Текст триггера
 * @param {Array<number>} optionalIndices - Массив индексов
 * @returns {string} Preview с выделением опциональных символов
 * 
 * @example
 * createPreview('актёр', [0, 2]) → 'а̲кт̲ёр' (подчёркнуты опциональные)
 */
export function createPreview(text, optionalIndices) {
    if (!text || !Array.isArray(optionalIndices) || optionalIndices.length === 0) {
        return text;
    }

    const optionalSet = new Set(optionalIndices);
    let result = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (optionalSet.has(i)) {
            // Выделить опциональный символ (можно использовать HTML или Unicode)
            result += `[${char}?]`;
        } else {
            result += char;
        }
    }

    return result;
}

/**
 * Парсинг строки индексов (например, из input)
 * @param {string} indicesString - Строка вида "0,2,4" или "0, 2, 4"
 * @returns {Array<number>} Массив индексов
 * 
 * @example
 * parseIndicesString('0, 2, 4') → [0, 2, 4]
 * parseIndicesString('1-3') → [1, 2, 3] (диапазон)
 */
export function parseIndicesString(indicesString) {
    if (!indicesString || typeof indicesString !== 'string') {
        return [];
    }

    const indices = [];

    // Разделить по запятым
    const parts = indicesString.split(',').map(s => s.trim());

    for (const part of parts) {
        // Проверить, является ли диапазоном (например, "1-3")
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(s => parseInt(s.trim()));

            if (!isNaN(start) && !isNaN(end) && start <= end) {
                for (let i = start; i <= end; i++) {
                    indices.push(i);
                }
            }
        } else {
            // Обычное число
            const num = parseInt(part);
            if (!isNaN(num)) {
                indices.push(num);
            }
        }
    }

    // Удалить дубликаты и отсортировать
    return [...new Set(indices)].sort((a, b) => a - b);
}
