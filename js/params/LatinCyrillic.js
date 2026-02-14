/**
 * ═══════════════════════════════════════════════════════════════════
 * REGEXHELPER v4.0 - LatinCyrillic.js (FINAL VERSION)
 * Type 1: Латиница/Кириллица (18 символов замены)
 * ✅ ДОБАВЛЕНО: applyAutoReplacements() для ё→[её], ь→[ьъ], ъ→[ъь]
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Замена визуально одинаковых символов латиницы и кириллицы
 * 
 * 18 СИМВОЛОВ ЗАМЕНЫ:
 * 
 * LOWERCASE (7 символов):
 * a ↔ а (U+0061 ↔ U+0430)
 * c ↔ с (U+0063 ↔ U+0441)
 * e ↔ е (U+0065 ↔ U+0435)
 * o ↔ о (U+006F ↔ U+043E)
 * p ↔ р (U+0070 ↔ U+0440)
 * x ↔ х (U+0078 ↔ U+0445)
 * y ↔ у (U+0079 ↔ U+0443)
 * 
 * UPPERCASE (11 символов):
 * A ↔ А (U+0041 ↔ U+0410)
 * B ↔ В (U+0042 ↔ U+0412)
 * C ↔ С (U+0043 ↔ U+0421)
 * E ↔ Е (U+0045 ↔ U+0415)
 * H ↔ Н (U+0048 ↔ U+041D)
 * K ↔ К (U+004B ↔ U+041A)
 * M ↔ М (U+004D ↔ U+041C)
 * O ↔ О (U+004F ↔ U+041E)
 * P ↔ Р (U+0050 ↔ U+0420)
 * T ↔ Т (U+0054 ↔ U+0422)
 * X ↔ Х (U+0058 ↔ U+0425)
 */

/**
 * ✅ НОВОЕ: Автозамены (применяются ПЕРВЫМИ перед всеми параметрами)
 * @param {string} text - Текст для автозамен
 * @returns {string} Текст с автозаменами
 * 
 * @example
 * applyAutoReplacements("актёр") → "акт[её]р"
 * applyAutoReplacements("медь") → "мед[ьъ]"
 * applyAutoReplacements("съезд") → "с[ъь]езд"
 */
export function applyAutoReplacements(text) {
    if (!text || typeof text !== 'string') {
        return text;
    }

    let result = text;

    // 1. ё → [её]
    result = result.replace(/ё/g, '[её]');
    result = result.replace(/Ё/g, '[ЁЕ]');

    // 2. ь → [ьъ]
    result = result.replace(/ь/g, '[ьъ]');

    // 3. ъ → [ъь]
    result = result.replace(/ъ/g, '[ъь]');

    return result;
}

/**
 * ✅ ИСПРАВЛЕНО: Применить замену латиницы/кириллицы
 * Теперь СНАЧАЛА применяются автозамены
 * @param {string} text - Текст триггера
 * @returns {string} Regex паттерн с альтернацией [a|а]
 * 
 * @example
 * applyLatinCyrillic('actor') → '[аa][сc][тt][оo][рr]'
 * applyLatinCyrillic('Actor') → '[АA][сc][тt][оo][рr]'
 * applyLatinCyrillic('актёр') → '[аa][кk][тt][её][рr]' (с автозаменой ё)
 * applyLatinCyrillic('дом') → '[дd][оo][мm]'
 */
export function applyLatinCyrillic(text) {
    if (!text || typeof text !== 'string') {
        return text;
    }

    // ✅ ШАГ 1: АВТОЗАМЕНЫ (ПЕРВЫМИ!)
    let result = applyAutoReplacements(text);

    // ✅ ШАГ 2: Латинско-кирилличная замена
    // Карта замен: символ → [латиница|кириллица]
    const pairs = {
        // Lowercase
        'a': '[аa]', 'A': '[АA]',
        'c': '[сc]', 'C': '[СC]',
        'e': '[еe]', 'E': '[ЕE]',
        'o': '[оo]', 'O': '[ОO]',
        'p': '[рp]', 'P': '[РP]',
        'x': '[хx]', 'X': '[ХX]',
        'y': '[уy]', 'Y': '[УY]',
        // Только Uppercase (нет lowercase пары)
        'B': '[ВB]',
        'H': '[НH]',
        'K': '[КK]',
        'M': '[МM]',
        'T': '[ТT]',
        // Кириллица → [кириллица|латиница]
        'а': '[аa]', 'А': '[АA]',
        'с': '[сc]', 'С': '[СC]',
        'е': '[еe]', 'Е': '[ЕE]',
        'о': '[оo]', 'О': '[ОO]',
        'р': '[рp]', 'Р': '[РP]',
        'х': '[хx]', 'Х': '[ХX]',
        'у': '[уy]', 'У': '[УY]',
        'В': '[ВB]',
        'Н': '[НH]',
        'К': '[КK]',
        'М': '[МM]',
        'Т': '[ТT]'
    };

    // Обработка каждого символа
    let output = '';
    for (let i = 0; i < result.length; i++) {
        const char = result[i];

        // Проверка: не находимся ли мы внутри [ ]
        // (например, после автозамены [её])
        if (char === '[') {
            // Найти закрывающую скобку
            const closingBracket = result.indexOf(']', i);
            if (closingBracket !== -1) {
                // Скопировать блок [xxx] как есть
                output += result.substring(i, closingBracket + 1);
                i = closingBracket;
                continue;
            }
        }

        // Проверить, есть ли замена для этого символа
        if (pairs.hasOwnProperty(char)) {
            output += pairs[char];
        } else {
            // Оставить символ как есть
            output += char;
        }
    }

    return output;
}

/**
 * Проверить, содержит ли текст символы латиницы/кириллицы
 * @param {string} text - Текст триггера
 * @returns {boolean} true если содержит
 * 
 * @example
 * hasLatinCyrillic('actor') → true
 * hasLatinCyrillic('дом') → true
 * hasLatinCyrillic('привет') → false (нет совпадающих символов)
 */
export function hasLatinCyrillic(text) {
    if (!text || typeof text !== 'string') {
        return false;
    }

    // Символы латиницы/кириллицы (18 символов)
    const latinCyrillicChars = [
        'a', 'c', 'e', 'o', 'p', 'x', 'y',
        'A', 'B', 'C', 'E', 'H', 'K', 'M', 'O', 'P', 'T', 'X',
        'а', 'с', 'е', 'о', 'р', 'х', 'у',
        'А', 'В', 'С', 'Е', 'Н', 'К', 'М', 'О', 'Р', 'Т', 'Х'
    ];

    for (const char of latinCyrillicChars) {
        if (text.includes(char)) {
            return true;
        }
    }

    return false;
}

/**
 * Получить список замен для триггера
 * @param {string} text - Текст триггера
 * @returns {Array} Массив объектов {char, replacement, position}
 * 
 * @example
 * getReplacements('actor') → [
 *   {char: 'a', replacement: 'а', position: 0},
 *   {char: 'c', replacement: 'с', position: 1},
 *   {char: 't', replacement: 'т', position: 2},
 *   {char: 'o', replacement: 'о', position: 3},
 *   {char: 'r', replacement: 'р', position: 4}
 * ]
 */
export function getReplacements(text) {
    if (!text || typeof text !== 'string') {
        return [];
    }

    const pairs = {
        'a': 'а', 'c': 'с', 'e': 'е', 'o': 'о', 'p': 'р', 'x': 'х', 'y': 'у',
        'A': 'А', 'B': 'В', 'C': 'С', 'E': 'Е', 'H': 'Н', 'K': 'К', 'M': 'М', 'O': 'О', 'P': 'Р', 'T': 'Т', 'X': 'Х',
        'а': 'a', 'с': 'c', 'е': 'e', 'о': 'o', 'р': 'p', 'х': 'x', 'у': 'y',
        'А': 'A', 'В': 'B', 'С': 'C', 'Е': 'E', 'Н': 'H', 'К': 'K', 'М': 'M', 'О': 'O', 'Р': 'P', 'Т': 'T', 'Х': 'X'
    };

    const replacements = [];

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (pairs.hasOwnProperty(char)) {
            replacements.push({
                char,
                replacement: pairs[char],
                position: i
            });
        }
    }

    return replacements;
}

/**
 * Автоопределение: нужна ли замена латиница/кириллица?
 * @param {Array<string>} triggers - Массив триггеров
 * @returns {boolean} true если рекомендуется включить параметр
 * 
 * @example
 * detectLatinCyrillic(['actor', 'актёр']) → true
 * detectLatinCyrillic(['привет', 'пока']) → false
 */
export function detectLatinCyrillic(triggers) {
    if (!Array.isArray(triggers) || triggers.length === 0) {
        return false;
    }

    // Проверяем каждый триггер
    for (const trigger of triggers) {
        if (hasLatinCyrillic(trigger)) {
            return true;
        }
    }

    return false;
}

/**
 * Получить статистику замен для массива триггеров
 * @param {Array<string>} triggers - Массив триггеров
 * @returns {Object} {totalReplacements, triggersWithReplacements, details}
 * 
 * @example
 * getStatistics(['actor', 'дом', 'привет']) → {
 *   totalReplacements: 7,
 *   triggersWithReplacements: 2,
 *   details: [
 *     {trigger: 'actor', count: 5},
 *     {trigger: 'дом', count: 2},
 *     {trigger: 'привет', count: 0}
 *   ]
 * }
 */
export function getStatistics(triggers) {
    if (!Array.isArray(triggers)) {
        return {
            totalReplacements: 0,
            triggersWithReplacements: 0,
            details: []
        };
    }

    let totalReplacements = 0;
    let triggersWithReplacements = 0;
    const details = [];

    for (const trigger of triggers) {
        const replacements = getReplacements(trigger);
        const count = replacements.length;

        if (count > 0) {
            triggersWithReplacements++;
        }

        totalReplacements += count;

        details.push({
            trigger,
            count,
            replacements
        });
    }

    return {
        totalReplacements,
        triggersWithReplacements,
        details
    };
}
