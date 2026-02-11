/* ============================================
   REGEXHELPER - EXPORT
   Экспорт результатов в файлы (TXT, JSON, CSV)
   
   ВЕРСИЯ: 3.0 FINAL
   ДАТА: 11.02.2026
   ИЗМЕНЕНИЯ v3.0:
   - ИСПРАВЛЕНО: Переносы строк (\n вместо \\n)
   - ИСПРАВЛЕНО: ID элементов (regexResult вместо resultRegex)
   - ДОБАВЛЕНО: Проверки существования функций
   - ДОБАВЛЕНО: Fallback для отсутствующих функций
   - УЛУЧШЕНО: Обработка ошибок
   
   ЗАВИСИМОСТИ:
   - utils.js (downloadFile, formatDate, getCurrentTimestamp)
   - converter.js (parseSimpleTriggers)
   - errors.js (showToast)
   ============================================ */

/* ============================================
   ЭКСПОРТ В TXT
   ============================================ */

/**
 * Экспорт regex в текстовый файл
 * @param {string} regex - Регулярное выражение
 * @param {Array} triggers - Массив триггеров (опционально)
 * @returns {boolean} - true если успешно
 */
function exportTXT(regex, triggers = null) {
    if (!regex) {
        showToast('error', 'Нет данных для экспорта');
        return false;
    }
    
    try {
        // ИСПРАВЛЕНО: правильные переносы строк
        let content = '# RegexHelper Export\n';
        content += `# Дата: ${formatDateSafe(new Date())}\n`;
        content += '\n';
        content += '# Регулярное выражение:\n';
        content += regex + '\n';
        
        if (triggers && triggers.length > 0) {
            content += '\n';
            content += '# Исходные триггеры:\n';
            content += triggers.join('\n') + '\n';
        }
        
        // Генерируем имя файла
        const filename = generateFilename('txt');
        
        // Скачиваем
        const success = downloadFileSafe(content, filename, 'text/plain');
        
        if (success) {
            showToast('success', '✓ Файл TXT успешно скачан');
            return true;
        } else {
            showToast('error', 'Ошибка при скачивании файла');
            return false;
        }
    } catch (error) {
        console.error('[Export] Ошибка экспорта TXT:', error);
        showToast('error', 'Ошибка при экспорте TXT');
        return false;
    }
}

/* ============================================
   ЭКСПОРТ В JSON
   ============================================ */

/**
 * Экспорт в JSON
 * @param {string} regex - Регулярное выражение
 * @param {Array} triggers - Массив триггеров
 * @param {Object} settings - Настройки оптимизаций
 * @param {Object} info - Дополнительная информация
 * @returns {boolean} - true если успешно
 */
function exportJSON(regex, triggers = [], settings = {}, info = {}) {
    if (!regex) {
        showToast('error', 'Нет данных для экспорта');
        return false;
    }
    
    try {
        // Валидация settings
        if (!settings || typeof settings !== 'object') {
            settings = {
                type1: false,
                type2: false,
                type4: false,
                type5: false
            };
        }
        
        const data = {
            regex: regex,
            triggers: triggers,
            triggerCount: triggers.length,
            regexLength: regex.length,
            timestamp: getCurrentTimestampSafe(),
            date: formatDateSafe(new Date()),
            settings: settings,
            info: info,
            version: '3.0',
            app: 'RegexHelper'
        };
        
        const json = JSON.stringify(data, null, 2);
        const filename = generateFilename('json');
        const success = downloadFileSafe(json, filename, 'application/json');
        
        if (success) {
            showToast('success', '✓ Файл JSON успешно скачан');
            return true;
        } else {
            showToast('error', 'Ошибка при скачивании файла');
            return false;
        }
    } catch (error) {
        console.error('[Export] Ошибка экспорта JSON:', error);
        showToast('error', 'Ошибка при экспорте JSON');
        return false;
    }
}

/* ============================================
   ЭКСПОРТ В CSV
   ============================================ */

/**
 * Экспорт в CSV для Excel
 * @param {string} regex - Регулярное выражение
 * @param {Array} triggers - Массив триггеров
 * @returns {boolean} - true если успешно
 */
function exportCSV(regex, triggers = []) {
    if (!regex) {
        showToast('error', 'Нет данных для экспорта');
        return false;
    }
    
    try {
        // BOM для корректного отображения в Excel
        let csv = '\uFEFF'; // UTF-8 BOM
        
        // ИСПРАВЛЕНО: правильные переносы строк
        csv += 'Тип,Значение\n';
        csv += `"Regex","${escapeCSV(regex)}"\n`;
        csv += `"Длина regex","${regex.length}"\n`;
        csv += `"Количество триггеров","${triggers.length}"\n`;
        csv += `"Дата экспорта","${formatDateSafe(new Date())}"\n`;
        csv += '\n';
        csv += 'Триггеры\n';
        
        triggers.forEach((trigger, index) => {
            csv += `"${index + 1}","${escapeCSV(trigger)}"\n`;
        });
        
        // Генерируем имя файла
        const filename = generateFilename('csv');
        
        // Скачиваем с правильным типом для Excel
        const success = downloadFileSafe(csv, filename, 'text/csv;charset=utf-8;');
        
        if (success) {
            showToast('success', '✓ Файл CSV успешно скачан');
            return true;
        } else {
            showToast('error', 'Ошибка при скачивании файла');
            return false;
        }
    } catch (error) {
        console.error('[Export] Ошибка экспорта CSV:', error);
        showToast('error', 'Ошибка при экспорте CSV');
        return false;
    }
}

/**
 * Экранирование CSV значений
 * @param {string} value - Значение
 * @returns {string} - Экранированное значение
 */
function escapeCSV(value) {
    if (!value) return '';
    
    // Заменяем двойные кавычки на две двойные кавычки
    return String(value).replace(/"/g, '""');
}

/* ============================================
   ГЕНЕРАЦИЯ ИМЕНИ ФАЙЛА
   ============================================ */

/**
 * Генерация имени файла с датой
 * @param {string} extension - Расширение файла (txt, json, csv)
 * @returns {string} - Имя файла
 */
function generateFilename(extension) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `regexhelper_${year}${month}${day}_${hours}${minutes}${seconds}.${extension}`;
}

/* ============================================
   SAFE ФУНКЦИИ (FALLBACK)
   ============================================ */

/**
 * Безопасная загрузка файла (с проверкой наличия функции)
 * @param {string} content - Содержимое файла
 * @param {string} filename - Имя файла
 * @param {string} mimeType - MIME тип
 * @returns {boolean}
 */
function downloadFileSafe(content, filename, mimeType) {
    // Проверяем наличие функции downloadFile из utils.js
    if (typeof downloadFile === 'function') {
        return downloadFile(content, filename, mimeType);
    }
    
    // Fallback: используем собственную реализацию
    try {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        console.error('[Export] Ошибка downloadFileSafe:', error);
        return false;
    }
}

/**
 * Безопасное форматирование даты (с fallback)
 * @param {Date} date - Дата
 * @returns {string}
 */
function formatDateSafe(date) {
    // Проверяем наличие функции formatDate из utils.js
    if (typeof formatDate === 'function') {
        return formatDate(date);
    }
    
    // Fallback: простое форматирование
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

/**
 * Безопасное получение timestamp (с fallback)
 * @returns {number}
 */
function getCurrentTimestampSafe() {
    // Проверяем наличие функции getCurrentTimestamp из utils.js
    if (typeof getCurrentTimestamp === 'function') {
        return getCurrentTimestamp();
    }
    
    // Fallback: используем Date.now()
    return Date.now();
}

/**
 * Безопасное получение состояний оптимизаций (с fallback)
 * @returns {Object}
 */
function getGlobalOptimizationStatesSafe() {
    // Проверяем наличие функции из optimizations.js
    if (typeof getGlobalOptimizationStates === 'function') {
        return getGlobalOptimizationStates();
    }
    
    // Fallback: пытаемся прочитать из чекбоксов
    const states = {
        type1: false,
        type2: false,
        type4: false,
        type5: false
    };
    
    try {
        const type1 = document.getElementById('type1');
        const type2 = document.getElementById('type2');
        const type4 = document.getElementById('type4');
        const type5 = document.getElementById('type5');
        
        if (type1) states.type1 = type1.checked;
        if (type2) states.type2 = type2.checked;
        if (type4) states.type4 = type4.checked;
        if (type5) states.type5 = type5.checked;
    } catch (error) {
        console.warn('[Export] Не удалось получить состояния оптимизаций');
    }
    
    return states;
}

/* ============================================
   МОДАЛЬНОЕ ОКНО ЭКСПОРТА
   ============================================ */

/**
 * Открыть модальное окно выбора формата экспорта
 */
function openExportModal() {
    // ИСПРАВЛЕНО: правильный ID элемента
    const resultTextarea = document.getElementById('regexResult');
    
    if (!resultTextarea || !resultTextarea.value.trim()) {
        showToast('warning', 'Сначала создайте regex для экспорта');
        return;
    }
    
    showModal('exportModal');
}

/**
 * Закрыть модальное окно экспорта
 */
function closeExportModal() {
    closeModal('exportModal');
}

/**
 * Инициализация модуля экспорта
 */
function initExport() {
    console.log('[Export] Инициализация модуля...');
    
    // Устанавливаем event listeners для кнопок экспорта
    const exportTxtBtn = document.getElementById('exportTxtBtn');
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    
    if (exportTxtBtn) {
        exportTxtBtn.addEventListener('click', handleExportTxt);
        console.log('[Export] Кнопка TXT подключена');
    } else {
        console.warn('[Export] Кнопка exportTxtBtn не найдена');
    }
    
    if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', handleExportJson);
        console.log('[Export] Кнопка JSON подключена');
    } else {
        console.warn('[Export] Кнопка exportJsonBtn не найдена');
    }
    
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', handleExportCsv);
        console.log('[Export] Кнопка CSV подключена');
    } else {
        console.warn('[Export] Кнопка exportCsvBtn не найдена');
    }
    
    console.log('[Export] Модуль инициализирован');
}

/* ============================================
   ОБРАБОТЧИКИ ЭКСПОРТА
   ============================================ */

/**
 * Обработчик экспорта TXT
 */
function handleExportTxt() {
    const regex = getResultRegex();
    const triggers = getOriginalTriggers();
    
    if (exportTXT(regex, triggers)) {
        closeExportModal();
    }
}

/**
 * Обработчик экспорта JSON
 */
function handleExportJson() {
    const regex = getResultRegex();
    const triggers = getOriginalTriggers();
    const settings = getGlobalOptimizationStatesSafe();
    
    const info = {
        triggerCount: triggers.length,
        regexLength: regex.length,
        hasLinkedTriggers: hasLinkedTriggersSafe()
    };
    
    if (exportJSON(regex, triggers, settings, info)) {
        closeExportModal();
    }
}

/**
 * Обработчик экспорта CSV
 */
function handleExportCsv() {
    const regex = getResultRegex();
    const triggers = getOriginalTriggers();
    
    if (exportCSV(regex, triggers)) {
        closeExportModal();
    }
}

/* ============================================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
   ============================================ */

/**
 * Получить результирующий regex
 * @returns {string}
 */
function getResultRegex() {
    // ИСПРАВЛЕНО: правильный ID
    const resultTextarea = document.getElementById('regexResult');
    return resultTextarea ? resultTextarea.value.trim() : '';
}

/**
 * Получить исходные триггеры
 * @returns {Array}
 */
function getOriginalTriggers() {
    const simpleTextarea = document.getElementById('simpleTriggers');
    
    if (!simpleTextarea || !simpleTextarea.value.trim()) {
        return [];
    }
    
    // Проверяем наличие функции parseSimpleTriggers
    let triggers = [];
    
    if (typeof parseSimpleTriggers === 'function') {
        triggers = parseSimpleTriggers(simpleTextarea.value);
    } else {
        // Fallback: простой парсинг
        triggers = simpleTextarea.value
            .split('\n')
            .map(t => t.trim())
            .filter(t => t);
    }
    
    // Добавляем триггеры из связанных групп если есть
    if (typeof getAllLinkedTriggers === 'function') {
        const linkedTriggers = getAllLinkedTriggers();
        triggers.push(...linkedTriggers);
    }
    
    return triggers;
}

/**
 * Безопасная проверка наличия связанных триггеров
 * @returns {boolean}
 */
function hasLinkedTriggersSafe() {
    if (typeof hasLinkedTriggers === 'function') {
        return hasLinkedTriggers();
    }
    
    // Fallback: проверяем DOM
    const container = document.getElementById('linkedTriggersContainer');
    if (container) {
        const groups = container.querySelectorAll('.linked-group');
        return groups.length > 0;
    }
    
    return false;
}

/**
 * Быстрый экспорт (без модального окна)
 * @param {string} format - Формат экспорта (txt, json, csv)
 */
function quickExport(format) {
    const regex = getResultRegex();
    
    if (!regex) {
        showToast('warning', 'Сначала создайте regex для экспорта');
        return;
    }
    
    const triggers = getOriginalTriggers();
    const settings = getGlobalOptimizationStatesSafe();
    
    const info = {
        triggerCount: triggers.length,
        regexLength: regex.length,
        hasLinkedTriggers: hasLinkedTriggersSafe()
    };
    
    switch (format.toLowerCase()) {
        case 'txt':
            exportTXT(regex, triggers);
            break;
        case 'json':
            exportJSON(regex, triggers, settings, info);
            break;
        case 'csv':
            exportCSV(regex, triggers);
            break;
        default:
            showToast('error', `Неизвестный формат: ${format}`);
    }
}

/* ============================================
   ЭКСПОРТ
   ============================================ */

// Делаем функции глобальными для HTML
window.openExportModal = openExportModal;
window.closeExportModal = closeExportModal;
window.quickExport = quickExport;
window.initExport = initExport;
window.exportTXT = exportTXT;
window.exportJSON = exportJSON;
window.exportCSV = exportCSV;

console.log('✅ Модуль export.js загружен (v3.0 FINAL)');
