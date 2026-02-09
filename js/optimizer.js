/* ============================================
   REGEXHELPER - OPTIMIZER
   5 типов оптимизации regex
   ============================================ */

/* ============================================
   ТИП 1: ОПТИМИЗАЦИЯ ПОВТОРОВ
   джефф, джеффри → джефф(ри)?
   ============================================ */

/**
 * Оптимизация Type 1: Повторяющиеся символы
 * @param {Array} triggers - Массив триггеров
 * @returns {Array} - Оптимизированный массив
 */
function optimizeType1(triggers) {
    if (!Array.isArray(triggers) || triggers.length < 2) {
        return triggers;
    }
    
    const optimized = [];
    const used = new Set();
    
    for (let i = 0; i < triggers.length; i++) {
        if (used.has(i)) continue;
        
        const current = triggers[i];
        const grouped = [current];
        
        // Ищем триггеры, где current - префикс
        for (let j = i + 1; j < triggers.length; j++) {
            if (used.has(j)) continue;
            
            const other = triggers[j];
            
            // Проверяем: other начинается с current?
            if (other.startsWith(current) && other.length > current.length) {
                grouped.push(other);
                used.add(j);
            }
        }
        
        // Если нашли группу (2+ триггеров)
        if (grouped.length >= 2) {
            // Сортируем по длине
            grouped.sort((a, b) => a.length - b.length);
            
            const base = grouped[0];
            const suffixes = grouped.slice(1).map(t => t.substring(base.length));
            
            // Создаем паттерн: джефф(ри|ффри)?
            if (suffixes.length === 1) {
                const pattern = escapeRegex(base) + '(' + escapeRegex(suffixes[0]) + ')?';
                optimized.push(pattern);
            } else {
                const pattern = escapeRegex(base) + '(' + suffixes.map(s => escapeRegex(s)).join('|') + ')?';
                optimized.push(pattern);
            }
        } else {
            optimized.push(current);
        }
    }
    
    return optimized;
}

/* ============================================
   ТИП 2: ОБЩИЙ КОРЕНЬ
   книга, книги → книг[аи]
   ============================================ */

/**
 * Поиск общего префикса
 * @param {string} str1 - Первая строка
 * @param {string} str2 - Вторая строка
 * @returns {string} - Общий префикс
 */
function findCommonPrefix(str1, str2) {
    let i = 0;
    while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
        i++;
    }
    return str1.substring(0, i);
}

/**
 * Оптимизация Type 2: Общий корень
 * @param {Array} triggers - Массив триггеров
 * @returns {Array} - Оптимизированный массив
 */
function optimizeType2(triggers) {
    if (!Array.isArray(triggers) || triggers.length < 2) {
        return triggers;
    }
    
    const optimized = [];
    const used = new Set();
    
    for (let i = 0; i < triggers.length; i++) {
        if (used.has(i)) continue;
        
        const current = triggers[i];
        const group = [current];
        
        // Ищем триггеры с общим корнем
        for (let j = i + 1; j < triggers.length; j++) {
            if (used.has(j)) continue;
            
            const other = triggers[j];
            const prefix = findCommonPrefix(current, other);
            
            // Если общий префикс минимум 3 символа
            if (prefix.length >= 3) {
                const suffix1 = current.substring(prefix.length);
                const suffix2 = other.substring(prefix.length);
                
                // Если оба суффикса короткие (1-2 символа)
                if (suffix1.length > 0 && suffix1.length <= 2 && 
                    suffix2.length > 0 && suffix2.length <= 2) {
                    group.push(other);
                    used.add(j);
                }
            }
        }
        
        // Если нашли группу (2+ триггеров)
        if (group.length >= 2) {
            const prefix = findCommonPrefix(group[0], group[1]);
            const suffixes = group.map(t => t.substring(prefix.length));
            
            // Создаем паттерн: книг[аи]
            const pattern = escapeRegex(prefix) + '[' + suffixes.map(s => escapeRegex(s)).join('') + ']';
            optimized.push(pattern);
        } else {
            optimized.push(current);
        }
    }
    
    return optimized;
}

/* ============================================
   ТИП 3: ЛАТИНИЦА ↔ КИРИЛЛИЦА
   дрон → [dд][rр][oо][nп]
   ============================================ */

/**
 * Карта замены латиница ↔ кириллица
 */
const LATIN_CYRILLIC_MAP = {
    // Латиница → Кириллица
    'a': 'а', 'e': 'е', 'o': 'о', 'p': 'р', 'c': 'с', 'y': 'у', 'x': 'х',
    'A': 'А', 'E': 'Е', 'O': 'О', 'P': 'Р', 'C': 'С', 'Y': 'У', 'X': 'Х',
    'B': 'В', 'H': 'Н', 'K': 'К', 'M': 'М', 'T': 'Т',
    
    // Кириллица → Латиница (обратная карта)
    'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x',
    'А': 'A', 'Е': 'E', 'О': 'O', 'Р': 'P', 'С': 'C', 'У': 'Y', 'Х': 'X',
    'В': 'B', 'Н': 'H', 'К': 'K', 'М': 'M', 'Т': 'T'
};

/**
 * Проверка: имеет ли строка символы из карты замены
 * @param {string} str - Строка
 * @returns {boolean} - true если есть заменяемые символы
 */
function hasReplaceableChars(str) {
    for (let char of str) {
        if (LATIN_CYRILLIC_MAP[char]) {
            return true;
        }
    }
    return false;
}

/**
 * Оптимизация Type 3: Замена латиница ↔ кириллица
 * @param {Array} triggers - Массив триггеров
 * @returns {Array} - Оптимизированный массив
 */
function optimizeType3(triggers) {
    if (!Array.isArray(triggers) || triggers.length === 0) {
        return triggers;
    }
    
    const optimized = [];
    
    for (let trigger of triggers) {
        // Проверяем есть ли заменяемые символы
        if (!hasReplaceableChars(trigger)) {
            optimized.push(escapeRegex(trigger));
            continue;
        }
        
        // Создаем паттерн с заменой символов
        let pattern = '';
        
        for (let char of trigger) {
            const replacement = LATIN_CYRILLIC_MAP[char];
            
            if (replacement) {
                // Символ есть в карте - создаем группу [латиница|кириллица]
                pattern += '[' + char + replacement + ']';
            } else {
                // Обычный символ - экранируем
                pattern += escapeRegex(char);
            }
        }
        
        optimized.push(pattern);
    }
    
    return optimized;
}

/* ============================================
   ТИП 4: СКЛОНЕНИЯ
   дрон → дрон(а|у|ом|е|ов|ам|ами|ах)
   ============================================ */

/**
 * Определение рода русского слова по окончанию
 * @param {string} word - Слово (в нижнем регистре)
 * @returns {string} - Род ('MASCULINE', 'FEMININE', 'NEUTER')
 */
function detectGender(word) {
    const lastChar = word[word.length - 1];
    const lastTwo = word.substring(word.length - 2);
    
    // Женский род: -а, -я, -ь (большинство)
    if (lastChar === 'а' || lastChar === 'я') {
        return 'FEMININE';
    }
    
    // Средний род: -о, -е, -ё, -мя
    if (lastChar === 'о' || lastChar === 'е' || lastChar === 'ё') {
        return 'NEUTER';
    }
    
    if (lastTwo === 'мя') {
        return 'NEUTER';
    }
    
    // Женский род: слова на -ь с определенными окончаниями
    if (lastChar === 'ь') {
        // Типичные женские окончания на -ь
        const feminineSuffixes = ['ость', 'есть', 'знь', 'ань', 'ынь', 'рь', 'вь'];
        for (let suffix of feminineSuffixes) {
            if (word.endsWith(suffix)) {
                return 'FEMININE';
            }
        }
        // По умолчанию -ь = мужской род (день, конь, гость)
        return 'MASCULINE';
    }
    
    // По умолчанию: мужской род (согласная на конце)
    return 'MASCULINE';
}

/**
 * Поиск общего суффикса
 * @param {string} str1 - Первая строка
 * @param {string} str2 - Вторая строка
 * @returns {string} - Общий суффикс
 */
function findCommonSuffix(str1, str2) {
    let i = 0;
    while (i < str1.length && i < str2.length && 
           str1[str1.length - 1 - i] === str2[str2.length - 1 - i]) {
        i++;
    }
    return str1.substring(str1.length - i);
}

/**
 * Найти общую основу слов
 * @param {Array} words - Массив слов
 * @returns {string} - Общая основа
 */
function findCommonBase(words) {
    if (!words || words.length === 0) return '';
    if (words.length === 1) return words[0];
    
    // Начинаем с первого слова
    let base = words[0];
    
    // Сокращаем базу, сравнивая с остальными словами
    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        let j = 0;
        
        // Находим общий префикс
        while (j < base.length && j < word.length && base[j] === word[j]) {
            j++;
        }
        
        base = base.substring(0, j);
        
        // Если база стала пустой, прекращаем
        if (base.length === 0) break;
    }
    
    return base;
}

/**
 * Генерация склонений русского слова с использованием RussianNounsJS
 * @param {string} word - Исходное слово
 * @returns {Array} - Массив склонений
 */
function generateDeclensions(word) {
    // Проверка: доступна ли библиотека RussianNouns
    if (typeof RussianNouns === 'undefined' || 
        typeof RussianNouns.Engine !== 'function' ||
        typeof RussianNouns.Gender === 'undefined' ||
        typeof RussianNouns.Case === 'undefined') {
        console.warn('[Optimizer Type 4] Библиотека RussianNouns недоступна. Возвращаем исходное слово:', word);
        return [word];
    }
    
    try {
        console.log('[Optimizer Type 4] Генерация склонений для:', word);
        
        const engine = new RussianNouns.Engine();
        const declensions = new Set();
        
        // Добавляем исходное слово
        declensions.add(word);
        
        // Определяем род слова
        const genderStr = detectGender(word.toLowerCase());
        const gender = RussianNouns.Gender[genderStr];
        
        console.log('[Optimizer Type 4] Определен род:', genderStr);
        
        // Создаем объект леммы
        const lemma = {
            text: word,
            gender: gender
        };
        
        // Генерируем все падежи ЕДИНСТВЕННОГО числа
        const cases = [
            'NOMINATIVE',    // именительный (дрон)
            'GENITIVE',      // родительный (дрона)
            'DATIVE',        // дательный (дрону)
            'ACCUSATIVE',    // винительный (дрон/дрона)
            'INSTRUMENTAL',  // творительный (дроном)
            'PREPOSITIONAL'  // предложный (дроне)
        ];
        
        for (let caseName of cases) {
            try {
                const caseValue = RussianNouns.Case[caseName];
                
                // Склоняем в единственном числе
                const singular = engine.decline(lemma, caseValue);
                if (Array.isArray(singular)) {
                    singular.forEach(form => {
                        if (form && typeof form === 'string') {
                            declensions.add(form);
                        }
                    });
                } else if (singular && typeof singular === 'string') {
                    declensions.add(singular);
                }
                
            } catch (e) {
                console.warn(`[Optimizer Type 4] Ошибка склонения "${word}" в ${caseName}:`, e.message);
            }
        }
        
        // Генерируем МНОЖЕСТВЕННОЕ число
        try {
            const pluralForms = engine.pluralize(lemma);
            
            if (Array.isArray(pluralForms) && pluralForms.length > 0) {
                // Получили формы множественного числа (именительный падеж)
                pluralForms.forEach(pluralForm => {
                    if (pluralForm && typeof pluralForm === 'string') {
                        declensions.add(pluralForm);
                        
                        // Теперь склоняем каждую форму множественного числа по падежам
                        const pluralLemma = {
                            text: pluralForm,
                            gender: gender,
                            pluraleTantum: true // Указываем что это множественное число
                        };
                        
                        for (let caseName of cases) {
                            try {
                                const caseValue = RussianNouns.Case[caseName];
                                const pluralCase = engine.decline(pluralLemma, caseValue);
                                
                                if (Array.isArray(pluralCase)) {
                                    pluralCase.forEach(form => {
                                        if (form && typeof form === 'string') {
                                            declensions.add(form);
                                        }
                                    });
                                } else if (pluralCase && typeof pluralCase === 'string') {
                                    declensions.add(pluralCase);
                                }
                            } catch (e) {
                                // Игнорируем ошибки склонения множественного числа
                            }
                        }
                    }
                });
            }
        } catch (e) {
            console.warn(`[Optimizer Type 4] Ошибка генерации множественного числа для "${word}":`, e.message);
        }
        
        const result = Array.from(declensions);
        console.log(`[Optimizer Type 4] Получено ${result.length} форм для "${word}":`, result);
        
        return result;
        
    } catch (error) {
        console.error('[Optimizer Type 4] Критическая ошибка генерации склонений для', word, ':', error);
        return [word];
    }
}

/**
 * Оптимизация Type 4: Склонения русских слов
 * @param {Array} triggers - Массив триггеров
 * @returns {Array} - Оптимизированный массив
 */
function optimizeType4(triggers) {
    if (!Array.isArray(triggers) || triggers.length === 0) {
        return triggers;
    }
    
    // Проверка доступности библиотеки
    if (typeof RussianNouns === 'undefined' || 
        typeof RussianNouns.Engine !== 'function') {
        console.warn('[Optimizer Type 4] Библиотека RussianNouns недоступна. Type 4 пропущен.');
        return triggers.map(t => escapeRegex(t));
    }
    
    const result = [];
    
    for (let trigger of triggers) {
        // Проверка: только русские слова
        if (!/^[а-яё]+$/i.test(trigger)) {
            result.push(escapeRegex(trigger));
            continue;
        }
        
        try {
            // Генерация всех падежных форм
            const declensions = generateDeclensions(trigger);
            
            if (declensions && declensions.length > 1) {
                // Найти общий корень
                const base = findCommonBase(declensions);
                
                // Извлечь окончания
                const suffixes = declensions
                    .map(word => word.slice(base.length))
                    .filter(s => s.length > 0);
                
                if (suffixes.length > 0) {
                    // Удаляем дубликаты и сортируем по длине (длинные первыми)
                    const uniqueSuffixes = Array.from(new Set(suffixes))
                        .sort((a, b) => b.length - a.length);
                    
                    const pattern = escapeRegex(base) + '(' + uniqueSuffixes.map(s => escapeRegex(s)).join('|') + ')';
                    result.push(pattern);
                } else {
                    result.push(escapeRegex(trigger));
                }
            } else {
                result.push(escapeRegex(trigger));
            }
        } catch (error) {
            console.warn('[Optimizer Type 4] Ошибка для триггера:', trigger, error);
            result.push(escapeRegex(trigger));
        }
    }
    
    return result;
}

/* ============================================
   ТИП 5: ОПЦИОНАЛЬНЫЙ СИМВОЛ ?
   пассивный → пасс?ивный (автоматически)
   ============================================ */

/**
 * Вычисление расстояния Левенштейна между двумя строками
 * @param {string} str1 - Первая строка
 * @param {string} str2 - Вторая строка
 * @returns {number} - Расстояние Левенштейна
 */
function levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = [];

    // Инициализация матрицы
    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }

    // Заполнение матрицы
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // удаление
                matrix[i][j - 1] + 1,      // вставка
                matrix[i - 1][j - 1] + cost // замена
            );
        }
    }

    return matrix[len1][len2];
}

/**
 * Поиск позиции различия между двумя строками (одна буква)
 * @param {string} str1 - Первая строка
 * @param {string} str2 - Вторая строка (короче на 1 символ)
 * @returns {number|null} - Позиция опциональной буквы или null
 */
function findOptionalCharPosition(str1, str2) {
    if (Math.abs(str1.length - str2.length) !== 1) {
        return null;
    }

    // str1 должна быть длиннее
    if (str1.length < str2.length) {
        [str1, str2] = [str2, str1];
    }

    // Ищем позицию, где строки расходятся
    for (let i = 0; i < str2.length; i++) {
        if (str1[i] !== str2[i]) {
            // Проверяем, совпадает ли остаток
            const remainder1 = str1.substring(i + 1);
            const remainder2 = str2.substring(i);
            
            if (remainder1 === remainder2) {
                return i; // Найдена позиция опциональной буквы
            }
            
            return null;
        }
    }

    // Различие в последнем символе
    return str2.length;
}

/**
 * Оптимизация Type 5: Опциональный символ ?
 * 
 * НОВАЯ ЛОГИКА (v2.0):
 * 1. Автоматически находит удвоенные буквы в словах (сс, мм, нн и т.д.)
 * 2. Делает одну из букв опциональной: пассивный → пасс?ивный
 * 3. Также находит пары слов, отличающиеся на одну букву (старая логика)
 * 
 * @example
 * // Input: ["пассивный"]
 * // Output: ["пасс?ивный"]
 * 
 * @example
 * // Input: ["алкоголь", "алкголь"]
 * // Output: ["алко?голь"]
 * 
 * @param {Array} triggers - Массив триггеров
 * @returns {Array} - Оптимизированный массив
 */
function optimizeType5(triggers) {
    if (!Array.isArray(triggers) || triggers.length === 0) {
        return triggers;
    }

    const optimized = [];
    const used = new Set();

    for (let i = 0; i < triggers.length; i++) {
        if (used.has(i)) continue;

        const current = triggers[i];
        let foundPair = false;

        // ========================================
        // НОВАЯ ЛОГИКА: Поиск удвоенных букв внутри слова
        // ========================================
        const doubleLetterMatch = current.match(/(.)\1/);
        
        if (doubleLetterMatch) {
            // Найдена удвоенная буква
            const doubleLetter = doubleLetterMatch[0]; // например "сс"
            const singleLetter = doubleLetterMatch[1]; // например "с"
            const position = current.indexOf(doubleLetter);
            
            // Создаем паттерн: делаем вторую букву опциональной
            const before = escapeRegex(current.substring(0, position + 1));
            const optionalChar = escapeRegex(singleLetter);
            const after = escapeRegex(current.substring(position + 2));
            
            const pattern = before + optionalChar + '?' + after;
            
            console.log(`[Optimizer Type 5] Удвоенная буква найдена: "${current}" → "${pattern}"`);
            
            optimized.push(pattern);
            foundPair = true;
            continue;
        }

        // ========================================
        // СТАРАЯ ЛОГИКА: Поиск пар слов (отличие на 1 букву)
        // ========================================
        for (let j = i + 1; j < triggers.length; j++) {
            if (used.has(j)) continue;

            const other = triggers[j];

            // Проверяем расстояние Левенштейна = 1 (одно изменение)
            if (levenshteinDistance(current, other) === 1) {
                // Проверяем, что это именно вставка/удаление одной буквы
                const position = findOptionalCharPosition(current, other);

                if (position !== null) {
                    // Определяем, какая строка длиннее
                    const longer = current.length > other.length ? current : other;
                    const shorter = current.length > other.length ? other : current;

                    // Создаем паттерн с опциональной буквой
                    const before = escapeRegex(longer.substring(0, position));
                    const optionalChar = escapeRegex(longer[position]);
                    const after = escapeRegex(longer.substring(position + 1));

                    const pattern = before + optionalChar + '?' + after;

                    console.log(`[Optimizer Type 5] Пара найдена: "${current}", "${other}" → "${pattern}"`);

                    optimized.push(pattern);
                    used.add(j);
                    foundPair = true;
                    break;
                }
            }
        }

        // Если не нашли ни пару, ни удвоенную букву, добавляем как есть
        if (!foundPair) {
            optimized.push(escapeRegex(current));
        }
    }

    return optimized;
}

/* ============================================
   ПРИМЕНЕНИЕ ОПТИМИЗАЦИЙ
   ============================================ */

/**
 * Применить выбранные оптимизации
 * @param {Array} triggers - Массив триггеров
 * @param {Object} types - Объект с флагами { type1: bool, type2: bool, type3: bool, type4: bool, type5: bool }
 * @returns {Array} - Оптимизированный массив
 */
function applyOptimizations(triggers, types) {
    if (!Array.isArray(triggers) || triggers.length === 0) {
        return [];
    }
    
    let result = [...triggers];
    
    console.log('[Optimizer] Исходные триггеры:', result.length);
    
    // ШАГ 1: Type 3 - Латиница ↔ Кириллица (посимвольная замена)
    if (types.type3) {
        result = optimizeType3(result);
        console.log('[Optimizer] После Type 3 (латиница↔кириллица):', result.length);
    }
    
    // ШАГ 2: Type 5 - Опциональный символ ? (работает с простыми триггерами)
    if (types.type5) {
        result = optimizeType5(result);
        console.log('[Optimizer] После Type 5 (опциональный ?):', result.length);
    }
    
    // ШАГ 3: Type 1 - Повторы (группирует префиксы)
    if (types.type1) {
        result = optimizeType1(result);
        console.log('[Optimizer] После Type 1 (повторы):', result.length);
    }
    
    // ШАГ 4: Type 2 - Общий корень (группирует суффиксы)
    if (types.type2) {
        result = optimizeType2(result);
        console.log('[Optimizer] После Type 2 (общий корень):', result.length);
    }
    
    // ШАГ 5: Type 4 - Склонения (создает сложные паттерны)
    if (types.type4) {
        result = optimizeType4(result);
        console.log('[Optimizer] После Type 4 (склонения):', result.length);
    }
    
    console.log('[Optimizer] Финальный результат:', result.length, 'паттернов');
    
    return result;
}

/**
 * Конвертация триггеров в regex с оптимизациями
 * @param {Array} triggers - Массив триггеров
 * @param {Object} types - Объект с флагами оптимизаций
 * @returns {string} - Оптимизированный regex
 */
function convertToRegexWithOptimizations(triggers, types) {
    if (!Array.isArray(triggers) || triggers.length === 0) {
        return '';
    }
    
    // Применяем оптимизации
    const optimized = applyOptimizations(triggers, types);
    
    // Сортируем по длине (длинные первыми)
    const sorted = optimized.sort((a, b) => b.length - a.length);
    
    // Объединяем через |
    const regex = sorted.join('|');
    
    return regex;
}

/* ============================================
   ПОЛНАЯ КОНВЕРТАЦИЯ С ОПТИМИЗАЦИЯМИ
   ============================================ */

/**
 * Полная конвертация с оптимизациями и валидацией
 * @param {string} text - Текст из textarea
 * @param {Object} types - Объект с флагами оптимизаций
 * @param {boolean} showWarnings - Показывать ли предупреждения
 * @returns {Object} - { success: boolean, regex: string, info: {} }
 */
function performConversionWithOptimizations(text, types, showWarnings = true) {
    try {
        // Очистка всех inline ошибок
        clearAllInlineErrors();
        
        // Проверка: выбрана ли хотя бы одна оптимизация
        const hasOptimizations = types.type1 || types.type2 || types.type3 || types.type4 || types.type5;
        
        if (!hasOptimizations && showWarnings) {
            showToast('warning', WARNING_MESSAGES.NO_OPTIMIZATIONS);
        }
        
        // 1. Парсинг триггеров
        let triggers = parseSimpleTriggers(text);
        
        // 2. Валидация исходных триггеров
        const validation = validateTriggers(triggers);
        
        if (!validation.valid) {
            showInlineError('simpleTriggers', validation.errors[0]);
            return {
                success: false,
                regex: '',
                info: { errors: validation.errors }
            };
        }
        
        // 3. Удаление дубликатов
        const deduped = removeDuplicatesFromTriggers(triggers);
        triggers = deduped.triggers;
        
        // Предупреждение о дубликатах
        if (deduped.duplicatesCount > 0 && showWarnings) {
            showMessage('warning', 'DUPLICATES_FOUND', deduped.duplicatesCount);
        }
        
        // 4. Конвертация в regex с оптимизациями
        const regex = convertToRegexWithOptimizations(triggers, types);
        
        // 5. Валидация длины regex
        const lengthValidation = validateRegexLength(regex);
        
        if (!lengthValidation.valid) {
            showToast('error', lengthValidation.errors[0]);
            return {
                success: false,
                regex: '',
                info: { errors: lengthValidation.errors }
            };
        }
        
        // Предупреждения
        if (lengthValidation.warnings.length > 0 && showWarnings) {
            showToast('warning', lengthValidation.warnings[0]);
        }
        
        if (validation.warnings.length > 0 && showWarnings) {
            showToast('warning', validation.warnings[0]);
        }
        
        // Успех!
        return {
            success: true,
            regex: regex,
            info: {
                originalCount: triggers.length + deduped.duplicatesCount,
                finalCount: triggers.length,
                duplicatesRemoved: deduped.duplicatesCount,
                regexLength: countChars(regex),
                optimizationsApplied: hasOptimizations
            }
        };
        
    } catch (error) {
        logError('performConversionWithOptimizations', error);
        showToast('error', ERROR_MESSAGES.UNKNOWN_ERROR);
        
        return {
            success: false,
            regex: '',
            info: { errors: [error.message] }
        };
    }
}

/* ============================================
   ЭКСПОРТ
   ============================================ */

console.log('✓ Модуль optimizer.js загружен (5 типов оптимизаций)');
