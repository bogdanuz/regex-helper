/* ============================================
   REGEXHELPER - CONVERTER
   Базовая конвертация триггеров в regex
   
   ВЕРСИЯ: 2.0 (CRIT-1 исправлен + anyOrder реализован)
   ДАТА: 10.02.2026
   ИЗМЕНЕНИЯ:
   - CRIT-1: Удален type3 из настроек триггеров
   - Задача 2.2: Реализован anyOrder (генерация перестановок)
   - Задача 2.3: Интеграция optimizeType3() для связанных групп
   - Исправлено двойное экранирование в getDistancePattern()
   ============================================ */

/* ============================================
   КОНСТАНТЫ И ЛИМИТЫ
   ============================================ */

const LIMITS = {
    MAX_TRIGGERS: 200,           // Максимум триггеров
    SOFT_LIMIT_TRIGGERS: 150,    // Мягкий лимит (предупреждение)
    MAX_REGEX_LENGTH: 10000,     // Максимум символов в regex
    SOFT_LIMIT_REGEX: 8000,      // Мягкий лимит regex (предупреждение)
    MIN_TRIGGER_LENGTH: 1,       // Минимум символов в триггере
    MAX_TRIGGER_LENGTH: 100      // Максимум символов в триггере
};

/* ============================================
   ПАРСИНГ ТРИГГЕРОВ
   ============================================ */

/**
 * Парсинг простых триггеров из textarea
 * @param {string} text - Текст из textarea
 * @returns {Array} - Массив триггеров
 */
function parseSimpleTriggers(text) {
    if (!text || isEmpty(text)) {
        return [];
    }
    
    // Разбиваем по строкам и очищаем
    const lines = splitLines(text);
    
    // Очищаем каждый триггер
    const triggers = lines.map(line => cleanTrigger(line)).filter(t => t);
    
    return triggers;
}

/**
 * Очистка триггера (trim + lowercase)
 * @param {string} trigger - Исходный триггер
 * @returns {string} - Очищенный триггер
 */
function cleanTrigger(trigger) {
    if (!trigger) return '';
    
    let cleaned = String(trigger).trim();
    
    // Переводим в lowercase
    cleaned = cleaned.toLowerCase();
    
    // Удаляем множественные пробелы
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    return cleaned;
}

/* ============================================
   ВАЛИДАЦИЯ
   ============================================ */

/**
 * Валидация массива триггеров
 * @param {Array} triggers - Массив триггеров
 * @returns {Object} - { valid: boolean, errors: [], warnings: [] }
 */
function validateTriggers(triggers) {
    const result = {
        valid: true,
        errors: [],
        warnings: []
    };
    
    // Проверка: пустой массив
    if (!triggers || triggers.length === 0) {
        result.valid = false;
        result.errors.push(ERROR_MESSAGES.EMPTY_TRIGGERS);
        return result;
    }
    
    // Проверка: превышен жесткий лимит
    if (triggers.length > LIMITS.MAX_TRIGGERS) {
        result.valid = false;
        result.errors.push(ERROR_MESSAGES.TRIGGERS_LIMIT_HARD);
        return result;
    }
    
    // Предупреждение: превышен мягкий лимит
    if (triggers.length > LIMITS.SOFT_LIMIT_TRIGGERS) {
        result.warnings.push(ERROR_MESSAGES.TRIGGERS_LIMIT_SOFT);
    }
    
    // Проверка длины каждого триггера
    for (let i = 0; i < triggers.length; i++) {
        const trigger = triggers[i];
        
        if (trigger.length < LIMITS.MIN_TRIGGER_LENGTH) {
            result.valid = false;
            result.errors.push(`Триггер №${i + 1} слишком короткий`);
            break;
        }
        
        if (trigger.length > LIMITS.MAX_TRIGGER_LENGTH) {
            result.valid = false;
            result.errors.push(`Триггер №${i + 1} слишком длинный (максимум ${LIMITS.MAX_TRIGGER_LENGTH} символов)`);
            break;
        }
    }
    
    return result;
}

/**
 * Валидация длины regex
 * @param {string} regex - Регулярное выражение
 * @returns {Object} - { valid: boolean, errors: [], warnings: [] }
 */
function validateRegexLength(regex) {
    const result = {
        valid: true,
        errors: [],
        warnings: []
    };
    
    const length = countChars(regex);
    
    // Проверка: превышен жесткий лимит
    if (length > LIMITS.MAX_REGEX_LENGTH) {
        result.valid = false;
        result.errors.push(ERROR_MESSAGES.REGEX_LENGTH_LIMIT);
        return result;
    }
    
    // Предупреждение: приближаемся к лимиту
    if (length > LIMITS.SOFT_LIMIT_REGEX) {
        result.warnings.push(`Regex близок к лимиту (${length} из ${LIMITS.MAX_REGEX_LENGTH} символов)`);
    }
    
    return result;
}

/* ============================================
   УДАЛЕНИЕ ДУБЛИКАТОВ
   ============================================ */

/**
 * Удаление дубликатов из массива триггеров
 * @param {Array} triggers - Массив триггеров
 * @returns {Object} - { triggers: [], duplicatesCount: number }
 */
function removeDuplicatesFromTriggers(triggers) {
    if (!Array.isArray(triggers)) {
        return { triggers: [], duplicatesCount: 0 };
    }
    
    const result = removeDuplicates(triggers);
    
    return {
        triggers: result.cleaned,
        duplicatesCount: result.duplicates
    };
}

/* ============================================
   КОНВЕРТАЦИЯ В REGEX (БАЗОВАЯ)
   ============================================ */

/**
 * Конвертация триггеров в regex (базовая, без оптимизаций)
 * @param {Array} triggers - Массив триггеров
 * @returns {string} - Регулярное выражение
 */
function convertToRegex(triggers) {
    if (!triggers || triggers.length === 0) {
        return '';
    }
    
    // Экранируем спецсимволы regex в каждом триггере
    const escapedTriggers = triggers.map(trigger => escapeRegex(trigger));
    
    // Сортируем по длине (длинные первыми) для корректного матчинга
    const sorted = escapedTriggers.sort((a, b) => b.length - a.length);
    
    // Объединяем через |
    const regex = sorted.join('|');
    
    return regex;
}

/* ============================================
   КОНВЕРТАЦИЯ СВЯЗАННЫХ ТРИГГЕРОВ (НОВОЕ - Группа 6)
   ============================================ */

/**
 * Конвертация всех связанных групп
 * @param {Array} groups - Массив групп [{id, triggers, settings}]
 * @returns {string} - Regex для всех групп
 */
function convertLinkedGroups(groups) {
    if (!groups || groups.length === 0) {
        return '';
    }
    
    const regexParts = [];
    
    groups.forEach((group, index) => {
        try {
            const groupRegex = convertLinkedGroup(group);
            if (groupRegex) {
                regexParts.push(groupRegex);
            }
        } catch (error) {
            console.error(`[Converter] Ошибка конвертации группы ${index + 1}:`, error);
        }
    });
    
    return regexParts.join('|');
}

/**
 * Конвертация одной связанной группы
 * 
 * ОБНОВЛЕНО v2.0:
 * - Применяем оптимизации (type1, 2, 4, 5) к каждому триггеру
 * - Используем optimizeType3() для ВСЕЙ группы (расстояние)
 * - Генерируем anyOrder перестановки если включено
 * 
 * @param {Object} group - {id, triggers, settings}
 * @returns {string} - Regex для группы
 */
function convertLinkedGroup(group) {
    if (!group || !group.triggers || group.triggers.length < 2) {
        console.warn('[Converter] Группа пропущена: недостаточно триггеров');
        return '';
    }
    
    const { triggers, settings } = group;
    
    console.log(`[Converter] Конвертация группы: ${triggers.length} триггеров`, settings);
    
    // 1. Применяем оптимизации (type1, 2, 4, 5) к каждому триггеру
    const optimizedTriggers = triggers.map(trigger => {
        return applyOptimizationsToTrigger(trigger, settings);
    });
    
    console.log('[Converter] Триггеры после оптимизаций:', optimizedTriggers);
    
    // 2. НОВОЕ: Применяем Type 3 (расстояние) через optimizeType3()
    // ВАЖНО: Type 3 применяется к ВСЕЙ группе, а не к отдельным триггерам!
    let finalPattern;
    
    if (typeof optimizeType3 === 'function') {
        console.log('[Converter] Вызываем optimizeType3() для группы');
        
        // Создаем объект для optimizeType3
        const linkedGroupForType3 = {
            triggers: optimizedTriggers,
            settings: settings
        };
        
        finalPattern = optimizeType3(linkedGroupForType3, settings);
        console.log('[Converter] Результат optimizeType3():', finalPattern);
    } else {
        console.warn('[Converter] optimizeType3() не найден, используем fallback');
        
        // Fallback: ручное создание паттерна
        const distance = getDistancePattern(settings);
        finalPattern = optimizedTriggers.join(distance);
    }
    
    // 3. Если anyOrder = true → генерируем перестановки
    if (settings.anyOrder) {
        const distance = getDistancePattern(settings);
        finalPattern = generateAnyOrderPattern(optimizedTriggers, distance);
        console.log('[Converter] anyOrder включен, результат:', finalPattern);
    }
    
    return finalPattern;
}

/**
 * Получить паттерн расстояния из настроек группы
 * 
 * ИСПРАВЛЕНО v2.0: Убрано двойное экранирование
 * 
 * @param {Object} settings - Настройки группы
 * @returns {string} - Паттерн расстояния (например: .{1,7})
 */
function getDistancePattern(settings) {
    const distanceType = settings.distanceType || 'fixed';
    
    switch (distanceType) {
        case 'fixed':
            const min = settings.distanceMin !== undefined ? settings.distanceMin : 1;
            const max = settings.distanceMax !== undefined ? settings.distanceMax : 7;
            
            // Валидация min/max
            if (min < 0 || max < 1 || min > max) {
                console.warn(`[Converter] Некорректные min/max: ${min}, ${max}. Используем default: 1-7`);
                return '.{1,7}';
            }
            
            return `.{${min},${max}}`;
        
        case 'any':
            // ИСПРАВЛЕНО: Одинарное экранирование (не \\\\s)
            return '[\\s\\S]+';
        
        case 'paragraph':
            return '.+';
        
        case 'line':
            // ИСПРАВЛЕНО: Одинарное экранирование
            return '[^\\n]+';
        
        default:
            console.warn(`[Converter] Неизвестный тип расстояния: ${distanceType}, используем fixed`);
            return '.{1,7}';
    }
}

/**
 * Генерация паттерна с любой последовательностью (A+B)|(B+A)
 * 
 * РЕАЛИЗОВАНО v2.0: Задача 2.2 (anyOrder)
 * 
 * @param {Array} triggers - Массив оптимизированных триггеров
 * @param {string} distance - Паттерн расстояния
 * @returns {string} - Regex с перестановками
 * 
 * @example
 * // Input: ['военный', 'дрон'], '.{1,7}'
 * // Output: '(военный.{1,7}дрон|дрон.{1,7}военный)'
 */
function generateAnyOrderPattern(triggers, distance) {
    if (triggers.length < 2) {
        return triggers[0] || '';
    }
    
    // Получаем все перестановки
    const permutations = getPermutations(triggers);
    
    console.log(`[Converter] Генерация ${permutations.length} перестановок для anyOrder`);
    
    // Предупреждение если слишком много
    if (permutations.length > 720) {
        console.warn(`[Converter] ВНИМАНИЕ! ${permutations.length} перестановок - это ОЧЕНЬ много!`);
        showToast('warning', `Внимание: ${permutations.length} перестановок! Regex может быть очень длинным.`);
    }
    
    // Объединяем каждую перестановку через distance
    const patterns = permutations.map(perm => perm.join(distance));
    
    // Оборачиваем в группу с альтернацией
    return `(${patterns.join('|')})`;
}

/**
 * Применить оптимизации к триггеру (используя настройки группы)
 * 
 * ИСПРАВЛЕНО v2.0: CRIT-1 - убран type3 из types
 * Type 3 НЕ применяется к отдельным триггерам!
 * 
 * @param {string} trigger - Исходный триггер
 * @param {Object} settings - Настройки группы (type1, type2, type4, type5)
 * @returns {string} - Оптимизированный триггер
 */
function applyOptimizationsToTrigger(trigger, settings) {
    if (!trigger) return '';
    
    let result = cleanTrigger(trigger);
    
    // ИСПРАВЛЕНО CRIT-1: type3 УДАЛЕН!
    // Type 3 применяется к ВСЕЙ группе через optimizeType3()
    const types = {
        type1: settings.type1 || false,
        type2: settings.type2 || false,
        // type3: УДАЛЕН! (применяется к группе)
        type4: settings.type4 || false,
        type5: settings.type5 || false
    };
    
    console.log(`[Converter] Применяем оптимизации к "${trigger}":`, types);
    
    // applyOptimizations работает с массивом!
    if (typeof applyOptimizations === 'function') {
        // Оборачиваем триггер в массив
        const optimizedArray = applyOptimizations([result], types);
        
        // Берем первый элемент (или исходный триггер если массив пустой)
        result = (optimizedArray && optimizedArray.length > 0) ? optimizedArray[0] : result;
    } else {
        // Fallback: если optimizer.js не загружен
        console.warn('[Converter] Функция applyOptimizations не найдена, используем escapeRegex');
        result = escapeRegex(result);
    }
    
    console.log(`[Converter] Результат оптимизации: "${result}"`);
    
    return result;
}

/* ============================================
   ОСНОВНАЯ ФУНКЦИЯ КОНВЕРТАЦИИ
   ============================================ */

/**
 * Полная конвертация с валидацией и обработкой ошибок
 * @param {string} text - Текст из textarea
 * @param {boolean} showWarnings - Показывать ли предупреждения (по умолчанию true)
 * @returns {Object} - { success: boolean, regex: string, info: {} }
 */
function performConversion(text, showWarnings = true) {
    try {
        // Очистка всех inline ошибок
        clearAllInlineErrors();
        
        // 1. Парсинг триггеров
        let triggers = parseSimpleTriggers(text);
        
        // 2. Валидация исходных триггеров
        const validation = validateTriggers(triggers);
        
        if (!validation.valid) {
            // Показываем первую ошибку
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
        
        // 4. Конвертация в regex
        const regex = convertToRegex(triggers);
        
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
        
        // Предупреждения о длине
        if (lengthValidation.warnings.length > 0 && showWarnings) {
            showToast('warning', lengthValidation.warnings[0]);
        }
        
        // Предупреждения из валидации триггеров
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
                regexLength: countChars(regex)
            }
        };
        
    } catch (error) {
        logError('performConversion', error);
        showToast('error', ERROR_MESSAGES.UNKNOWN_ERROR);
        
        return {
            success: false,
            regex: '',
            info: { errors: [error.message] }
        };
    }
}

/* ============================================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
   ============================================ */

/**
 * Подсчет триггеров в textarea
 * @param {string} text - Текст из textarea
 * @returns {number} - Количество триггеров
 */
function countTriggersInText(text) {
    const triggers = parseSimpleTriggers(text);
    return triggers.length;
}

/**
 * Проверка, есть ли триггеры
 * @param {string} text - Текст из textarea
 * @returns {boolean} - true если есть триггеры
 */
function hasTriggersInText(text) {
    return countTriggersInText(text) > 0;
}

/**
 * Получение статистики по триггерам
 * @param {string} text - Текст из textarea
 * @returns {Object} - { count: number, hasLimit: boolean, hasDuplicates: boolean }
 */
function getTriggerStats(text) {
    const triggers = parseSimpleTriggers(text);
    const deduped = removeDuplicatesFromTriggers(triggers);
    
    return {
        count: triggers.length,
        uniqueCount: deduped.triggers.length,
        duplicatesCount: deduped.duplicatesCount,
        hasLimit: triggers.length >= LIMITS.MAX_TRIGGERS,
        nearLimit: triggers.length >= LIMITS.SOFT_LIMIT_TRIGGERS
    };
}

console.log('✓ Модуль converter.js загружен (v2.0 - CRIT-1 исправлен, anyOrder реализован)');
