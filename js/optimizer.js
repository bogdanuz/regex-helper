/* ============================================
   REGEXHELPER - OPTIMIZER
   4 типа оптимизации regex
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
   test → [tт][eе][sѕ][tт]
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
                // Внутри [] не нужно экранировать большинство символов
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
   ТИП 4: ГРУППИРОВКА
   красный, синий → (красн|син)ий
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
 * Оптимизация Type 4: Группировка по суффиксу
 * @param {Array} triggers - Массив триггеров
 * @returns {Array} - Оптимизированный массив
 */
function optimizeType4(triggers) {
    if (!Array.isArray(triggers) || triggers.length < 2) {
        return triggers;
    }
    
    const optimized = [];
    const used = new Set();
    
    for (let i = 0; i < triggers.length; i++) {
        if (used.has(i)) continue;
        
        const current = triggers[i];
        const group = [current];
        
        // Ищем триггеры с общим суффиксом
        for (let j = i + 1; j < triggers.length; j++) {
            if (used.has(j)) continue;
            
            const other = triggers[j];
            const suffix = findCommonSuffix(current, other);
            
            // Если общий суффикс минимум 2 символа
            if (suffix.length >= 2) {
                const prefix1 = current.substring(0, current.length - suffix.length);
                const prefix2 = other.substring(0, other.length - suffix.length);
                
                // Если оба префикса не пустые
                if (prefix1.length > 0 && prefix2.length > 0) {
                    group.push(other);
                    used.add(j);
                }
            }
        }
        
        // Если нашли группу (2+ триггеров)
        if (group.length >= 2) {
            const suffix = findCommonSuffix(group[0], group[1]);
            const prefixes = group.map(t => t.substring(0, t.length - suffix.length));
            
            // Создаем паттерн: (красн|син)ий
            const pattern = '(' + prefixes.map(p => escapeRegex(p)).join('|') + ')' + escapeRegex(suffix);
            optimized.push(pattern);
        } else {
            optimized.push(current);
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
 * @param {Object} types - Объект с флагами { type1: true, type2: false, ... }
 * @returns {Array} - Оптимизированный массив
 */
function applyOptimizations(triggers, types) {
    if (!Array.isArray(triggers) || triggers.length === 0) {
        return [];
    }
    
    let result = [...triggers];
    
    // ВАЖНО: Type3 применяется ПЕРВЫМ (к исходным триггерам)
    // Остальные оптимизации работают с уже обработанными паттернами
    
    if (types.type3) {
        result = optimizeType3(result);
    }
    
    if (types.type1) {
        result = optimizeType1(result);
    }
    
    if (types.type2) {
        result = optimizeType2(result);
    }
    
    if (types.type4) {
        result = optimizeType4(result);
    }
    
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
        const hasOptimizations = types.type1 || types.type2 || types.type3 || types.type4;
        
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

// Экспортируем функции для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Карты
        LATIN_CYRILLIC_MAP,
        
        // Отдельные оптимизации
        optimizeType1,
        optimizeType2,
        optimizeType3,
        optimizeType4,
        
        // Применение оптимизаций
        applyOptimizations,
        convertToRegexWithOptimizations,
        performConversionWithOptimizations,
        
        // Вспомогательные
        findCommonPrefix,
        findCommonSuffix,
        hasReplaceableChars
    };
}
