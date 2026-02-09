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
 * Генерация склонений русского слова
 * @param {string} word - Исходное слово
 * @returns {Array} - Массив склонений
 */
function generateDeclensions(word) {
    // Проверка: доступна ли библиотека russian-nouns-js
    if (typeof RussianNouns !== 'undefined' && RussianNouns.decline) {
        try {
            // Используем библиотеку для генерации склонений
            const declensions = [];
            const cases = ['nominative', 'genitive', 'dative', 'accusative', 'instrumental', 'prepositional'];
            
            for (let caseType of cases) {
                try {
                    const declined = RussianNouns.decline(word, caseType);
                    if (declined && declined !== word) {
                        declensions.push(declined);
                    }
                } catch (e) {
                    // Игнорируем ошибки для отдельных падежей
                }
            }
            
            // Добавляем исходное слово
            if (!declensions.includes(word)) {
                declensions.push(word);
            }
            
            // Удаляем дубликаты
            return [...new Set(declensions)];
        } catch (error) {
            console.warn('[Optimizer] Ошибка генерации склонений:', error);
            return [word];
        }
    }
    
    // FALLBACK: Если библиотека недоступна, возвращаем только исходное слово
    console.warn('[Optimizer] Библиотека russian-nouns-js недоступна. Type 4 работает в ограниченном режиме.');
    return [word];
}

/**
 * Оптимизация Type 4: Склонения русских слов
 * Генерирует regex с круглыми скобками и альтернацией для многобуквенных окончаний
 * 
 * @example
 * // Input: ["дрон"]
 * // Output: ["дрон(а|у|ом|е|ов|ам|ами|ах)"]
 * 
 * @param {Array} triggers - Массив триггеров
 * @returns {Array} - Оптимизированный массив
 */
function optimizeType4(triggers) {
    if (!Array.isArray(triggers) || triggers.length === 0) {
        return triggers;
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
                const suffixes = declensions.map(word => word.slice(base.length)).filter(s => s.length > 0);
                
                // ВАЖНО: используем круглые скобки (...|...) для многобуквенных окончаний
                // Квадратные скобки [...] НЕ работают для окончаний типа "ом" (2+ буквы)!
                if (suffixes.length > 0) {
                    const pattern = escapeRegex(base) + '(' + suffixes.map(s => escapeRegex(s)).join('|') + ')';
                    result.push(pattern);
                } else {
                    // Если нет окончаний (все слова одинаковые), используем исходное
                    result.push(escapeRegex(trigger));
                }
            } else {
                result.push(escapeRegex(trigger));
            }
        } catch (error) {
            console.warn('[Optimizer] Ошибка Type 4 для триггера:', trigger, error);
            result.push(escapeRegex(trigger));
        }
    }
    
    return result;
}

/* ============================================
   ТИП 5: ОПЦИОНАЛЬНЫЙ СИМВОЛ ?
   пассивный, пасивный → пасс?ивный
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
 * Объединяет слова, отличающиеся на одну букву в любой позиции
 * 
 * ВАЖНО: Type 5 должен применяться ДО Type 4 (склонений)!
 * Причина: Type 5 работает с простыми триггерами. Если сначала применить Type 4,
 * триггер "дрон" превратится в "дрон(а|у|ом)", и Type 5 не сможет его обработать.
 * 
 * @example
 * // Input: ["пассивный", "пасивный"]
 * // Output: ["пасс?ивный"]
 * 
 * @example
 * // Input: ["алкоголь", "алкголь"]
 * // Output: ["алко?голь"]
 * 
 * @example
 * // Input: ["товар", "товарр"]
 * // Output: ["товарр?"] // последний символ опциональный
 * 
 * @param {Array} triggers - Массив триггеров
 * @returns {Array} - Оптимизированный массив
 */
function optimizeType5(triggers) {
    if (!Array.isArray(triggers) || triggers.length < 2) {
        return triggers;
    }

    const optimized = [];
    const used = new Set();

    for (let i = 0; i < triggers.length; i++) {
        if (used.has(i)) continue;

        const current = triggers[i];
        let foundPair = false;

        // Ищем пару (отличие на 1 букву)
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

                    optimized.push(pattern);
                    used.add(j);
                    foundPair = true;
                    break;
                }
            }
        }

        // Если не нашли пару, добавляем как есть
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
 * 
 * ВАЖНО: Порядок применения оптимизаций критичен!
 * 
 * 1. Type 3 (латиница ↔ кириллица) - применяется к исходным триггерам посимвольно
 * 2. Type 5 (опциональный ?) - ищет триггеры, отличающиеся на 1 букву
 * 3. Type 1 (повторы) - группирует триггеры с общим началом
 * 4. Type 2 (общий корень) - группирует триггеры с общим корнем и короткими окончаниями
 * 5. Type 4 (склонения) - генерирует все падежные формы (создает сложные паттерны)
 * 
 * Type 5 ДОЛЖЕН быть ДО Type 4, иначе он будет пытаться оптимизировать уже обработанные паттерны!
 * 
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
            showMessage('warning', 'DUPLICATES_REMOVED', deduped.duplicatesCount);
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
