/* ============================================
   REGEXHELPER - EXPORT
   Экспорт результатов в файлы (TXT, JSON, CSV)
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
    
    // ИСПРАВЛЕНО: Формируем содержимое файла (\\n → \n)
    let content = '# RegexHelper Export\n';
    content += `# Дата: ${formatDate(new Date())}\n`;
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
    const success = downloadFile(content, filename, 'text/plain');
    
    if (success) {
        showMessage('success', 'EXPORTED_TXT');
        return true;
    } else {
        showToast('error', 'Ошибка при скачивании файла');
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
    
    // ИСПРАВЛЕНО: Добавлена валидация settings
    if (!settings || typeof settings !== 'object') {
        settings = {
            type1: false,
            type2: false,
            type3: false,
            type4: false
        };
    }
    
    const data = {
        regex: regex,
        triggers: triggers,
        triggerCount: triggers.length,
        regexLength: countChars(regex),
        timestamp: getCurrentTimestamp(),
        settings: settings,
        info: info,
        version: '1.0'
    };
    
    const json = JSON.stringify(data, null, 2);
    const filename = generateFilename('json');
    const success = downloadFile(json, filename, 'application/json');
    
    if (success) {
        showMessage('success', 'EXPORTED_JSON');
        return true;
    } else {
        showToast('error', 'Ошибка при скачивании файла');
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
    
    // ИСПРАВЛЕНО: Формируем CSV структуру (\\n → \n)
    let csv = 'Тип,Значение\n';
    csv += `"Regex","${escapeCSV(regex)}"\n`;
    csv += `"Длина regex","${countChars(regex)}"\n`;
    csv += `"Количество триггеров","${triggers.length}"\n`;
    csv += `"Дата экспорта","${formatDate(new Date())}"\n`;
    csv += '\n';
    csv += 'Триггеры\n';
    
    triggers.forEach((trigger, index) => {
        csv += `"${escapeCSV(trigger)}"\n`;
    });
    
    // Генерируем имя файла
    const filename = generateFilename('csv');
    
    // Скачиваем
    const success = downloadFile(csv, filename, 'text/csv');
    
    if (success) {
        showMessage('success', 'EXPORTED_CSV');
        return true;
    } else {
        showToast('error', 'Ошибка при скачивании файла');
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
    
    return `regexhelper_${year}${month}${day}_${hours}${minutes}.${extension}`;
}

/* ============================================
   МОДАЛЬНОЕ ОКНО ЭКСПОРТА
   ============================================ */

/**
 * Открыть модальное окно выбора формата экспорта
 */
function openExportModal() {
    // Проверяем наличие regex
    const resultTextarea = document.getElementById('resultRegex');
    
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
    // Устанавливаем event listeners для кнопок экспорта
    const exportTxtBtn = document.getElementById('exportTxtBtn');
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    
    if (exportTxtBtn) {
        exportTxtBtn.addEventListener('click', handleExportTxt);
    }
    
    if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', handleExportJson);
    }
    
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', handleExportCsv);
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
    const settings = getSelectedOptimizations();
    
    const info = {
        triggerCount: triggers.length,
        regexLength: countChars(regex),
        hasLinkedTriggers: hasLinkedTriggers(),
        linkedPermutations: countLinkedPermutations()
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
    const resultTextarea = document.getElementById('resultRegex');
    return resultTextarea ? resultTextarea.value.trim() : '';
}

/**
 * Получить исходные триггеры
 * @returns {Array}
 */
function getOriginalTriggers() {
    const simpleTextarea = document.getElementById('simpleTriggers');
    
    if (!simpleTextarea) {
        return [];
    }
    
    const triggers = parseSimpleTriggers(simpleTextarea.value);
    
    // Добавляем перестановки связанных триггеров если есть
    if (hasLinkedTriggers()) {
        const linkedPermutations = generateLinkedPermutations();
        return [...triggers, ...linkedPermutations];
    }
    
    return triggers;
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
    const settings = getSelectedOptimizations();
    
    const info = {
        triggerCount: triggers.length,
        regexLength: countChars(regex),
        hasLinkedTriggers: hasLinkedTriggers ? hasLinkedTriggers() : false,
        linkedPermutations: countLinkedPermutations ? countLinkedPermutations() : 0
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

// Делаем функции глобальными для HTML
window.openExportModal = openExportModal;
window.closeExportModal = closeExportModal;
window.quickExport = quickExport;

console.log('✓ Модуль export.js загружен');
