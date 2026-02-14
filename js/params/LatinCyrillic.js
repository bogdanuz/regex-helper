/**
 * ═══════════════════════════════════════════════════════════════════
 * REGEXHELPER v4.0 - LatinCyrillic.js
 * Type 1: Латиница/Кириллица (18 символов замены)
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
 * Применить замену латиницы/кириллицы
 * @param {string} text - Текст триггера
 * @returns {string} Regex паттерн с альтернацией (a|а)
 * 
 * @example
 * applyLatinCyrillic('actor') → '(a|а)(c|с)(t|т)(o|о)(r|р)'
 * applyLatinCyrillic('Actor') → '(A|А)(c|с)(t|т)(o|о)(r|р)'
 * applyLatinCyrillic('дом') → 'дом' (нет замен)
 */
export function applyLatinCyrillic(text) {
    if (!text || typeof text !== 'string') {
        return text;
    }

    // Карта замен: латиница → кириллица
    const pairs = {
        // Lowercase
        'a': 'а', // U+0061 → U+0430
        'c': 'с', // U+0063 → U+0441
        'e': 'е', // U+0065 → U+0435
        'o': 'о', // U+006F → U+043E
        'p': 'р', // U+0070 → U+0440
        'x': 'х', // U+0078 → U+0445
        'y': 'у', // U+0079 → U+0443

        // Uppercase
        'A': 'А', // U+0041 → U+0410
        'B': 'В', // U+0042 → U+0412
        'C': 'С', // U+0043 → U+0421
        'E': 'Е', // U+0045 → U+0415
        'H': 'Н', // U+0048 → U+041D
        'K': 'К', // U+004B → U+041A
        'M': 'М', // U+004D → U+041C
        'O': 'О', // U+004F → U+041E
        'P': 'Р', // U+0050 → U+0420
        'T': 'Т', // U+0054 → U+0422
        'X': 'Х', // U+0058 → U+0425

        // Обратные замены (кириллица → латиница)
        'а': 'a',
        'с': 'c',
        'е': 'e',
        'о': 'o',
        'р': 'p',
        'х': 'x',
        'у': 'y',
        'А': 'A',
        'В': 'B',
        'С': 'C',
        'Е': 'E',
        'Н': 'H',
        'К': 'K',
        'М': 'M',
        'О': 'O',
        'Р': 'P',
        'Т': 'T',
        'Х': 'X'
    };

    let result = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        // Проверить, есть ли замена для этого символа
        if (pairs.hasOwnProperty(char)) {
            const replacement = pairs[char];
            // Создать альтернацию (a|а)
            result += `(${char}|${replacement})`;
        } else {
            // Оставить символ как есть
            result += char;
        }
    }

    return result;
}

/**
 * Проверить, содержит ли текст символы латиницы/кириллицы
 * @param {string} text - Текст триггера
 * @returns {boolean} true если содержит
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

