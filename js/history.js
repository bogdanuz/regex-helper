/**
 * ============================================
 * ИСТОРИЯ КОНВЕРТАЦИЙ
 * ============================================
 * 
 * ВЕРСИЯ: 2.1
 * ДАТА: 10.02.2026
 * ИЗМЕНЕНИЯ:
 * - ИСПРАВЛЕНО: Переносы строк (\n вместо \\n)
 * - ИСПРАВЛЕНО: renderHistory() теперь работает на странице
 * - ИСПРАВЛЕНО: loadFromHistory() исправлен
 * 
 * Управление историей конвертаций:
 * - Сохранение в localStorage (последние 10)
 * - Отображение списка
 * - Загрузка конвертации
 * - Удаление записей
 * 
 * Зависимости: utils.js, errors.js, converter.js
 */

// ============================================
// КОНСТАНТЫ
// ============================================

const HISTORY_CONFIG = {
    STORAGE_KEY: 'regexhelper_history',
    MAX_ITEMS: 10,
    DATE_FORMAT: 'ru-RU'
};

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

/**
 * Инициализация модуля истории
 */
function initHistory() {
    try {
        // Проверка поддержки localStorage
        if (!window.localStorage) {
            console.warn('localStorage не поддерживается');
            return;
        }

        // Event listeners
        const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');

        if (refreshHistoryBtn) {
            refreshHistoryBtn.addEventListener('click', renderHistory);
        }

        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', handleClearHistory);
        }

        // НОВОЕ: Рендерим историю при загрузке
        renderHistory();

        console.log('✓ История инициализирована');
    } catch (error) {
        console.error('Ошибка инициализации истории:', error);
    }
}

// ============================================
// РАБОТА С LOCALSTORAGE
// ============================================

/**
 * Загрузка истории из localStorage
 * @returns {Array} Массив записей истории
 */
function loadHistory() {
    try {
        const data = localStorage.getItem(HISTORY_CONFIG.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        logError('loadHistory', error);
        return [];
    }
}

/**
 * Сохранение истории в localStorage
 * @param {Array} history - Массив записей
 */
function saveHistoryToStorage(history) {
    try {
        localStorage.setItem(HISTORY_CONFIG.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
        console.error('Ошибка saveHistoryToStorage:', error);
        showToast('error', ERROR_MESSAGES.STORAGE_ERROR || 'Ошибка сохранения истории');
    }
}

/**
 * Сохранение конвертации в историю
 * @param {string} regex - Результат конвертации
 * @param {Array} triggers - Исходные триггеры
 * @param {Object} settings - Настройки оптимизаций
 * @param {Object} info - Дополнительная информация
 */
function saveToHistory(regex, triggers, settings, info) {
    try {
        if (!regex || !triggers || triggers.length === 0) {
            return;
        }

        const history = loadHistory();
        
        // Создание новой записи
        const entry = {
            id: Date.now(),
            date: formatDate(new Date()),
            regex: regex,
            triggers: triggers,
            triggerCount: triggers.length,
            regexLength: regex.length,
            settings: settings || {}
        };

        // Добавление в начало массива
        history.unshift(entry);

        // Ограничение количества записей
        if (history.length > HISTORY_CONFIG.MAX_ITEMS) {
            history.splice(HISTORY_CONFIG.MAX_ITEMS);
        }

        // Сохранение
        saveHistoryToStorage(history);

        // НОВОЕ: Автоматически обновляем UI
        renderHistory();

        console.log('✓ Конвертация сохранена в историю');
    } catch (error) {
        console.error('Ошибка saveToHistory:', error);
    }
}

/**
 * Удаление записи из истории
 * @param {number} id - ID записи
 */
function deleteFromHistory(id) {
    try {
        let history = loadHistory();
        history = history.filter(item => item.id !== id);
        saveHistoryToStorage(history);
        
        // Обновление UI
        renderHistory();
        
        showToast('success', SUCCESS_MESSAGES.HISTORY_DELETED || 'Запись удалена');
    } catch (error) {
        console.error('Ошибка deleteFromHistory:', error);
        showToast('error', ERROR_MESSAGES.UNKNOWN_ERROR || 'Ошибка удаления');
    }
}

/**
 * Очистка всей истории
 */
function clearHistory() {
    try {
        localStorage.removeItem(HISTORY_CONFIG.STORAGE_KEY);
        renderHistory();
        showToast('success', SUCCESS_MESSAGES.HISTORY_CLEARED || 'История очищена');
    } catch (error) {
        logError('clearHistory', error);
        showToast('error', ERROR_MESSAGES.UNKNOWN_ERROR || 'Ошибка очистки');
    }
}

// ============================================
// UI ФУНКЦИИ
// ============================================

/**
 * Отрисовка списка истории
 * 
 * ИСПРАВЛЕНО v2.1: Теперь рендерит в секции на странице, а не в модалке
 */
function renderHistory() {
    const historyList = document.getElementById('historyList');
    const historyEmpty = document.getElementById('historyEmpty');
    
    if (!historyList || !historyEmpty) {
        console.error('[History] Элементы истории не найдены');
        return;
    }

    const history = loadHistory();

    console.log('[History] Рендеринг истории:', history.length, 'записей');

    // Если история пуста
    if (history.length === 0) {
        historyList.innerHTML = '';
        historyList.style.display = 'none';
        historyEmpty.style.display = 'block';
        return;
    }

    // Отображение записей
    historyList.style.display = 'flex';
    historyEmpty.style.display = 'none';

    historyList.innerHTML = history.map(item => `
        <div class="history-item" data-id="${item.id}">
            <div class="history-item-header">
                <span class="history-item-date">🕒 ${escapeHTML(item.date)}</span>
                <div class="history-item-actions">
                    <button 
                        class="btn-icon" 
                        onclick="loadFromHistory(${item.id})"
                        title="Загрузить конвертацию"
                    >
                        📥
                    </button>
                    <button 
                        class="btn-icon" 
                        onclick="deleteFromHistory(${item.id})"
                        title="Удалить запись"
                    >
                        🗑️
                    </button>
                </div>
            </div>
            
            <div class="history-item-regex" title="${escapeHTML(item.regex)}">
                ${escapeHTML(truncateRegex(item.regex, 80))}
            </div>
            
            <div class="history-item-meta">
                <span title="Количество триггеров">
                    📝 ${item.triggerCount} ${pluralize(item.triggerCount, ['триггер', 'триггера', 'триггеров'])}
                </span>
                <span title="Длина регулярного выражения">
                    📏 ${item.regexLength} символов
                </span>
            </div>
        </div>
    `).join('');
    
    console.log('[History] ✓ История отрисована:', history.length, 'записей');
}

/**
 * Загрузить запись из истории
 * @param {number} id - ID записи
 */
function loadFromHistory(id) {
    try {
        const history = loadHistory();
        
        // Ищем по ID
        const entry = history.find(item => item.id === id);
        
        if (!entry) {
            showToast('error', 'Запись не найдена');
            return;
        }

        const resultTextarea = document.getElementById('resultRegex');
        const simpleTextarea = document.getElementById('simpleTriggers');

        // ИСПРАВЛЕНО: '\n' вместо '\\n'
        if (simpleTextarea) {
            simpleTextarea.value = entry.triggers.join('\n');
            
            // Обновление счетчика
            if (typeof updateSimpleTriggerCount === 'function') {
                updateSimpleTriggerCount();
            }
        }

        // Загрузка настроек оптимизаций
        if (entry.settings) {
            Object.keys(entry.settings).forEach(key => {
                const checkbox = document.getElementById(key);
                if (checkbox) {
                    checkbox.checked = entry.settings[key];
                }
            });
        }

        // Загрузка результата
        if (resultTextarea) {
            resultTextarea.value = entry.regex;
            
            // Обновляем счетчик длины
            const regexLengthSpan = document.getElementById('regexLength');
            if (regexLengthSpan) {
                const length = entry.regex.length;
                regexLengthSpan.textContent = `Длина: ${length} ${pluralize(length, ['символ', 'символа', 'символов'])}`;
            }
        }

        // Скроллим к началу страницы
        window.scrollTo({ top: 0, behavior: 'smooth' });

        showToast('success', '✓ Конвертация загружена из истории');
        
        console.log('[History] ✓ Запись загружена:', id);
    } catch (error) {
        console.error('Ошибка loadFromHistory:', error);
        showToast('error', 'Ошибка загрузки');
    }
}

/**
 * Обработчик очистки истории (с подтверждением)
 */
function handleClearHistory() {
    const history = loadHistory();
    
    if (history.length === 0) {
        showToast('info', 'История уже пуста');
        return;
    }

    confirmAction(
        'Подтверждение',
        `Очистить всю историю (${history.length} записей)? Это действие нельзя отменить.`,
        () => clearHistory(),
        null
    );
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

/**
 * Форматирование даты
 * @param {Date} date - Объект Date
 * @returns {string} Форматированная строка
 */
function formatDate(date) {
    return date.toLocaleString(HISTORY_CONFIG.DATE_FORMAT, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Обрезка regex для превью
 * @param {string} regex - Регулярное выражение
 * @param {number} maxLength - Максимальная длина
 * @returns {string} Обрезанная строка
 */
function truncateRegex(regex, maxLength = 80) {
    if (regex.length <= maxLength) {
        return regex;
    }
    return regex.substring(0, maxLength) + '...';
}

// ============================================
// ЭКСПОРТ
// ============================================

window.initHistory = initHistory;
window.saveToHistory = saveToHistory;
window.loadHistory = loadHistory;
window.renderHistory = renderHistory;
window.loadFromHistory = loadFromHistory;
window.deleteFromHistory = deleteFromHistory;
window.clearHistory = clearHistory;

console.log('✓ Модуль history.js загружен (v2.1 - исправлено отображение)');
