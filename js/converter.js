/* ============================================
   REGEXHELPER - CONVERTER
   Базовая конвертация триггеров в regex
   
   ВЕРСИЯ: 3.0 (Автозамена ё + Confirm с отложением)
   ДАТА: 11.02.2026
   ИЗМЕНЕНИЯ:
   - БЛОК 5: Автозамена ё → [её] в каждом триггере
   - БЛОК 6: Confirm с отложением (5 минут)
   - Поддержка подгрупп из linked-triggers v3.0
   - Интеграция с 3 режимами связи
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

// Ключ для sessionStorage (confirm с отложением)
const SKIP_CONFIRM_KEY = 'regexhelper_skip_confirm_until';

/* ============================================
   АВТОЗАМЕНА Ё → [ЕЁ] (НОВОЕ v3.0 - БЛОК 5)
   ============================================ */

/**
 * Автозамена ё → [её], Ё → [ЕЁ]
 * 
 * БЛОК 5: Применяется ко ВСЕМ триггерам автоматически
 * 
 * @param {string} text - Исходный текст
 * @returns {string} - Текст с заменой ё
 * 
 * @example
 * replaceYo('ёж') // => '[её]ж'
 * replaceYo('актёр') // => 'акт[её]р'
 * replaceYo('Ёлка') // => '[ЕЁ]лка'
 */
function replaceYo(text) {
    if (!text || typeof text !== 'string') {
        return text;
    }
    
    // Заменяем ё/Ё на [её]/[ЕЁ]
    return text.replace(/ё/gi, (match) => {
        return match === 'ё' ? '[её]' : '[ЕЁ]';
    });
}

/* ============================================
   ПАРСИНГ ТРИГГЕРОВ (ОБНОВЛЕНО v3.0)
   ============================================ */

/**
 * Парсинг простых триггеров из textarea
 * 
 * ОБНОВЛЕНО v3.0: Применяем replaceYo() к каждому триггеру
 * 
 * @param {string} text - Текст из textarea
 * @returns {Array} - Массив триггеров
 */
function parseSimpleTriggers(text) {
    if (!text || isEmpty(text)) {
        return [];
    }
    
    // Разбиваем по строкам и очищаем
    const lines = splitLines(text);
    
    // Очищаем каждый триггер + применяем replaceYo()
    const triggers = lines
        .map(line => cleanTrigger(line))
        .filter(t => t)
        .map(t => replaceYo(t)); // НОВОЕ v3.0!
    
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
   CONFIRM С ОТЛОЖЕНИЕМ (НОВОЕ v3.0 - БЛОК 6)
   ============================================ */

/**
 * Проверить, нужно ли показывать confirm перед конвертацией
 * @returns {boolean} - true если нужно показать confirm
 */
function shouldShowConversionConfirm() {
    const regexField = document.getElementById('regexResult');
    
    if (!regexField) {
        return false;
    }
    
    // Если поле пустое - confirm не нужен
    if (!regexField.value || regexField.value.trim() === '') {
        return false;
    }
    
    // Проверяем, не отложен ли confirm
    const skipUntil = sessionStorage.getItem(SKIP_CONFIRM_KEY);
    
    if (skipUntil) {
        const skipUntilTime = parseInt(skipUntil);
        const now = Date.now();
        
        if (now < skipUntilTime) {
            // Confirm отложен
            console.log('[Converter] Confirm отложен до:', new Date(skipUntilTime));
            return false;
        } else {
            // Время истекло, удаляем ключ
            sessionStorage.removeItem(SKIP_CONFIRM_KEY);
        }
    }
    
    // Нужно показать confirm
    return true;
}

/**
 * Показать confirm перед конвертацией
 * @param {Function} onConfirm - Callback если пользователь нажал "Да"
 * @param {Function} onCancel - Callback если пользователь нажал "Нет"
 */
function showConversionConfirm(onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'conversionConfirmModal';
    modal.innerHTML = `
        <div class="modal-content modal-sm">
            <div class="modal-header">
                <h3 class="modal-title">⚠️ Заменить существующий regex?</h3>
            </div>
            <div class="modal-body">
                <p>В панели 3 уже есть regex. Заменить его новым результатом?</p>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" id="confirmNo">Нет</button>
                <button class="btn-primary" id="confirmYes">Да</button>
                <button class="btn-link" id="confirmSkip5min">Да, не спрашивать 5 минут</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработчики кнопок
    const btnYes = modal.querySelector('#confirmYes');
    const btnNo = modal.querySelector('#confirmNo');
    const btnSkip = modal.querySelector('#confirmSkip5min');
    
    // Функция закрытия модального окна
    const closeModal = () => {
        document.body.removeChild(modal);
    };
    
    // Кнопка "Да"
    btnYes.addEventListener('click', () => {
        closeModal();
        if (onConfirm) onConfirm();
    });
    
    // Кнопка "Нет"
    btnNo.addEventListener('click', () => {
        closeModal();
        if (onCancel) onCancel();
    });
    
    // Кнопка "Да, не спрашивать 5 минут"
    btnSkip.addEventListener('click', () => {
        // Устанавливаем время отложения (5 минут)
        const skipUntil = Date.now() + 5 * 60 * 1000;
        sessionStorage.setItem(SKIP_CONFIRM_KEY, skipUntil.toString());
        
        console.log('[Converter] Confirm отложен на 5 минут');
        
        closeModal();
        if (onConfirm) onConfirm();
    });
    
    // Закрытие по клику вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
            if (onCancel) onCancel();
        }
    });
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
   КОНВЕРТАЦИЯ СВЯЗАННЫХ ТРИГГЕРОВ (ОБНОВЛЕНО v3.0)
   ============================================ */

/**
 * Конвертация всех связанных групп с подгруппами
 * 
 * ОБНОВЛЕНО v3.0: Поддержка подгрупп и 3 режимов связи
 * 
 * @param {Array} groups - Массив групп с подгруппами
 * @returns {string} - Regex для всех групп
 */
function convertLinkedGroups(groups) {
    if (!groups || groups.length === 0) {
        return '';
    }
    
    const linkMode = getLinkMode(); // Получаем режим связи
    console.log(`[Converter] Режим связи: ${linkMode}`);
    
    const regexParts = [];
    
    groups.forEach((group, index) => {
        try {
            const groupRegex = convertLinkedGroup(group, linkMode);
            if (groupRegex) {
                regexParts.push(groupRegex);
            }
        } catch (error) {
            console.error(`[Converter] Ошибка конвертации группы ${index + 1}:`, error);
        }
    });
    
    // Объединяем группы в зависимости от режима связи
    if (linkMode === 'alternation') {
        // Режим 3: Альтернация (A|B|C)
        return regexParts.join('|');
    } else {
        // Режимы 1 и 2: Каждая группа - отдельный паттерн
        return regexParts.join('|');
    }
}

/**
 * Конвертация одной связанной группы (с подгруппами)
 * 
 * ОБНОВЛЕНО v3.0:
 * - Поддержка подгрупп (2 уровня вложенности)
 * - Применяем replaceYo() к каждому триггеру
 * - 3 режима связи
 * 
 * @param {Object} group - {id, subgroups: [{triggers, connection}], settings}
 * @param {string} linkMode - Режим связи ('individual', 'common', 'alternation')
 * @returns {string} - Regex для группы
 */
function convertLinkedGroup(group, linkMode) {
    if (!group || !group.subgroups || group.subgroups.length === 0) {
        console.warn('[Converter] Группа пропущена: нет подгрупп');
        return '';
    }
    
    const { subgroups, settings } = group;
    
    console.log(`[Converter] Конвертация группы: ${subgroups.length} подгрупп, режим: ${linkMode}`);
    
    // Обрабатываем каждую подгруппу
    const processedSubgroups = subgroups.map((subgroup, index) => {
        // Применяем replaceYo() к каждому триггеру
        const triggersWithYo = subgroup.triggers.map(t => replaceYo(t));
        
        // Применяем оптимизации
        const optimizedTriggers = triggersWithYo.map(trigger => {
            return applyOptimizationsToTrigger(trigger, settings);
        });
        
        // Объединяем триггеры подгруппы через |
        const subgroupPattern = optimizedTriggers.length > 1 
            ? `(${optimizedTriggers.join('|')})`
            : optimizedTriggers[0];
        
        return {
            pattern: subgroupPattern,
            connection: subgroup.connection // null для последней подгруппы
        };
    });
    
    console.log('[Converter] Обработано подгрупп:', processedSubgroups);
    
    // Соединяем подгруппы в зависимости от режима
    let finalPattern;
    
    if (linkMode === 'alternation') {
        // Режим 3: Альтернация (объединить через |, игнорируя связи)
        const patterns = processedSubgroups.map(sg => sg.pattern);
        finalPattern = patterns.join('|');
        
    } else if (linkMode === 'common') {
        // Режим 2: Общий параметр (одинаковое расстояние между всеми)
        const commonDistance = getDistancePattern(settings);
        const patterns = processedSubgroups.map(sg => sg.pattern);
        finalPattern = patterns.join(commonDistance);
        
    } else {
        // Режим 1: Индивидуальные параметры (каждая связь своя)
        const parts = [];
        
        for (let i = 0; i < processedSubgroups.length; i++) {
            const subgroup = processedSubgroups[i];
            parts.push(subgroup.pattern);
            
            // Добавляем связь, если это не последняя подгруппа
            if (subgroup.connection) {
                const distance = getDistancePatternFromConnection(subgroup.connection);
                parts.push(distance);
            }
        }
        
        finalPattern = parts.join('');
    }
    
    // Если anyOrder = true → генерируем перестановки
    if (settings.anyOrder) {
        const allTriggers = processedSubgroups.map(sg => sg.pattern);
        const distance = getDistancePattern(settings);
        finalPattern = generateAnyOrderPattern(allTriggers, distance);
        console.log('[Converter] anyOrder включен, результат:', finalPattern);
    }
    
    return finalPattern;
}

/**
 * Получить паттерн расстояния из объекта connection
 * @param {Object} connection - {distanceType, distanceMin, distanceMax}
 * @returns {string}
 */
function getDistancePatternFromConnection(connection) {
    if (!connection) {
        return '.{1,7}'; // default
    }
    
    return getDistancePattern(connection);
}

/**
 * Получить паттерн расстояния из настроек
 * @param {Object} settings - Настройки группы
 * @returns {string} - Паттерн расстояния
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
            return '[\\\\s\\\\S]+';
        
        case 'paragraph':
            return '.+';
        
        case 'line':
            return '[^\\\\n]+';
        
        default:
            console.warn(`[Converter] Неизвестный тип расстояния: ${distanceType}, используем fixed`);
            return '.{1,7}';
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
 * Применить оптимизации к триггеру
 * @param {string} trigger - Исходный триггер
 * @param {Object} settings - Настройки группы
 * @returns {string} - Оптимизированный триггер
 */
function applyOptimizationsToTrigger(trigger, settings) {
    if (!trigger) return '';
    
    let result = cleanTrigger(trigger);
    
    const types = {
        type1: settings.type1 || false,
        type2: settings.type2 || false,
        type4: settings.type4 || false,
        type5: settings.type5 || false
    };
    
    console.log(`[Converter] Применяем оптимизации к "${trigger}":`, types);
    
    // applyOptimizations работает с массивом!
    if (typeof applyOptimizations === 'function') {
        const optimizedArray = applyOptimizations([result], types);
        result = (optimizedArray && optimizedArray.length > 0) ? optimizedArray[0] : result;
    } else {
        console.warn('[Converter] Функция applyOptimizations не найдена, используем escapeRegex');
        result = escapeRegex(result);
    }
    
    console.log(`[Converter] Результат оптимизации: "${result}"`);
    
    return result;
}

/* ============================================
   ОСНОВНАЯ ФУНКЦИЯ КОНВЕРТАЦИИ (ОБНОВЛЕНО v3.0)
   ============================================ */

/**
 * Полная конвертация с валидацией и confirm
 * 
 * ОБНОВЛЕНО v3.0: Добавлен confirm перед заменой
 * 
 * @param {string} text - Текст из textarea
 * @param {boolean} showWarnings - Показывать ли предупреждения
 * @param {boolean} skipConfirm - Пропустить confirm (для программной конвертации)
 * @returns {Object} - { success: boolean, regex: string, info: {} }
 */
function performConversion(text, showWarnings = true, skipConfirm = false) {
    // Проверяем нужен ли confirm (если не skipConfirm)
    if (!skipConfirm && shouldShowConversionConfirm()) {
        console.log('[Converter] Показываем confirm перед конвертацией');
        
        // Показываем confirm
        showConversionConfirm(
            // onConfirm - продолжаем конвертацию
            () => {
                const result = performConversionInternal(text, showWarnings);
                if (result.success) {
                    writeResultToPanel(result.regex);
                }
            },
            // onCancel - отменяем
            () => {
                console.log('[Converter] Конвертация отменена пользователем');
            }
        );
        
        // Возвращаем "pending" состояние
        return {
            success: false,
            regex: '',
            info: { pending: true }
        };
    }
    
    // Confirm не нужен или пропущен - выполняем конвертацию
    return performConversionInternal(text, showWarnings);
}

/**
 * Внутренняя функция конвертации (без confirm)
 * @param {string} text - Текст из textarea
 * @param {boolean} showWarnings - Показывать ли предупреждения
 * @returns {Object} - { success: boolean, regex: string, info: {} }
 */
function performConversionInternal(text, showWarnings = true) {
    try {
        // Очистка всех inline ошибок
        clearAllInlineErrors();
        
        // 1. Парсинг триггеров (с replaceYo внутри)
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

/**
 * Записать результат в панель 3
 * @param {string} regex - Regex для записи
 */
function writeResultToPanel(regex) {
    const regexField = document.getElementById('regexResult');
    if (regexField) {
        regexField.value = regex;
        console.log('[Converter] Результат записан в панель 3');
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
 * @returns {Object} - { count, uniqueCount, duplicatesCount, hasLimit, nearLimit }
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

console.log('✓ Модуль converter.js загружен (v3.0 - автозамена ё + confirm с отложением)');
