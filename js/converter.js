/* ============================================
   REGEXHELPER - CONVERTER
   Базовая конвертация триггеров в regex
   Версия: 2.0 (Группа 6 - конвертация связанных триггеров)
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
    
    // 1. Применяем оптимизации к каждому триггеру
    const optimizedTriggers = triggers.map(trigger => {
        return applyOptimizationsToTrigger(trigger, settings);
    });
    
    console.log('[Converter] Триггеры после оптимизаций:', optimizedTriggers);
    
    // 2. Получаем паттерн расстояния
    const distance = getDistancePattern(settings);
    
    console.log('[Converter] Паттерн расстояния:', distance);
    
    // 3. Если anyOrder = true → генерируем перестановки
    if (settings.anyOrder) {
        const result = generateAnyOrderPattern(optimizedTriggers, distance);
        console.log('[Converter] anyOrder включен, результат:', result);
        return result;
    }
    
    // 4. Обычное объединение (порядок важен)
    const result = optimizedTriggers.join(distance);
    console.log('[Converter] Обычное объединение (порядок важен):', result);
    
    return result;
}

/**
 * Получить паттерн расстояния из настроек группы
 * @param {Object} settings - Настройки группы
 * @returns {string} - Паттерн расстояния (например: .{1,7})
 */
function getDistancePattern(settings) {
    const distanceType = settings.distanceType || 'fixed';
    
    switch (distanceType) {
        case 'fixed':
            const min = settings.distanceMin || 1;
            const max = settings.distanceMax || 7;
            return `.{${min},${max}}`;
        
        case 'any':
            return `[\\s\\S]+`;
        
        case 'paragraph':
            return `.+`;
        
        case 'line':
            return `[^\\n]+`;
        
        default:
            console.warn(`[Converter] Неизвестный тип расстояния: ${distanceType}, используем fixed`);
            return `.{1,7}`;
    }
}

/**
 * Генерация паттерна с любой последовательностью (A+B)|(B+A)
 * @param {Array} triggers - Массив оптимизированных триггеров
 * @param {string} distance - Паттерн расстояния
 * @returns {string} - Regex с перестановками
 */
function generateAnyOrderPattern(triggers, distance) {
    if (triggers.length < 2) {
        return triggers[0] || '';
    }
    
    // Получаем все перестановки
    const permutations = getPermutations(triggers);
    
    console.log(`[Converter] Генерация ${permutations.length} перестановок`);
    
    // Предупреждение если слишком много
    if (permutations.length > 720) {
        console.warn(`[Converter] ВНИМАНИЕ! ${permutations.length} перестановок - это ОЧЕНЬ много!`);
    }
    
    // Объединяем каждую перестановку через distance
    const patterns = permutations.map(perm => perm.join(distance));
    
    // Оборачиваем в группу с альтернацией
    return `(${patterns.join('|')})`;
}

/**
 * Применить оптимизации к триггеру (используя настройки группы)
 * ИСПРАВЛЕНО: applyOptimizations работает с массивом!
 * @param {string} trigger - Исходный триггер
 * @param {Object} settings - Настройки группы (type1, type2, type3, type4, type5)
 * @returns {string} - Оптимизированный триггер
 */
function applyOptimizationsToTrigger(trigger, settings) {
    if (!trigger) return '';
    
    let result = cleanTrigger(trigger);
    
    // Применяем только включенные оптимизации
    const types = {
        type1: settings.type1 || false,
        type2: settings.type2 || false,
        type3: settings.type3 || false,
        type4: settings.type4 || false,
        type5: settings.type5 || false
    };
    
    console.log(`[Converter] Применяем оптимизации к "${trigger}":`, types);
    
    // ИСПРАВЛЕНО: applyOptimizations работает с массивом!
    if (typeof applyOptimizations === 'function') {
        // Оборачиваем триггер в массив
        const optimizedArray = applyOptimizations([result], types);
        
        // Берем первый элемент (или исходный триггер если массив пустой)
        result = (optimizedArray && optimizedArray.length > 0) ? optimizedArray[0] : result;
    } else {
        // Fallback: базовая обработка (если optimizer.js не загружен)
        console.warn('[Converter] Функция applyOptimizations не найдена, используем базовую обработку');
        
        // Type 3: Вариации букв (латиница/кириллица)
        if (types.type3) {
            if (typeof applyType3Optimization === 'function') {
                result = applyType3Optimization(result);
            }
        }
        
        // Type 4: Склонения
        if (types.type4) {
            if (typeof applyType4Optimization === 'function') {
                result = applyType4Optimization(result);
            }
        }
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

console.log('✓ Модуль converter.js загружен (v2.0 - конвертация связанных триггеров)');
