/**
 * ============================================
 * ИСТОРИЯ КОНВЕРТАЦИЙ
 * ============================================
 * 
 * ВЕРСИЯ: 3.0 FINAL
 * ДАТА: 11.02.2026
 * ИЗМЕНЕНИЯ:
 * - БЛОК 2: Лимит 100 записей ✅
 * - БЛОК 2: Импорт с полным восстановлением ✅
 * - БЛОК 2: Экспорт из истории ✅
 * - БЛОК 2: Модальное окно "Детали" ✅
 * - Функция-обертка saveConversionToHistory() ✅
 * - Счетчик истории в UI ✅
 * - ИСПРАВЛЕНО: Переносы строк (\n вместо \\n)
 * - ИСПРАВЛЕНО: Классы модальных окон
 * - ДОБАВЛЕНО: Вспомогательные функции
 * - ГОТОВА К ЗАМОРОЗКЕ ❄️
 * 
 * ЗАВИСИМОСТИ:
 * - utils.js (downloadFile, escapeHTML)
 * - errors.js (showToast, confirmAction, logError, escapeHTML)
 * - converter.js (parseSimpleTriggers)
 * - linked-triggers.js (getLinkedGroups, getLinkMode, addLinkedGroup, etc.)
 */

// ============================================
// КОНСТАНТЫ
// ============================================

const HISTORY_CONFIG = {
    STORAGE_KEY: 'regexhelper_history',
    MAX_ITEMS: 100,
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
            console.warn('[History] localStorage не поддерживается');
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

        // Рендерим историю при загрузке
        renderHistory();

        console.log('[History] ✅ Модуль инициализирован (v3.0 FINAL)');
    } catch (error) {
        console.error('[History] Ошибка инициализации:', error);
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
        console.error('[History] Ошибка saveHistoryToStorage:', error);
        showToast('error', 'Ошибка сохранения истории');
    }
}

/**
 * Сохранение конвертации в историю (ОБНОВЛЕНО v3.0)
 * 
 * СТРУКТУРА ЗАПИСИ:
 * - type: 'simple' | 'linked'
 * - simpleTriggers: [] - массив простых триггеров
 * - simpleParams: {} - настройки оптимизаций для простых
 * - linkedGroups: [] - массив групп с подгруппами
 * - regex: '' - результат
 * 
 * @param {string} regex - Результат конвертации
 * @param {Object} data - Данные конвертации
 */
function saveToHistory(regex, data) {
    try {
        if (!regex || !data) {
            console.warn('[History] Недостаточно данных для сохранения');
            return;
        }

        const history = loadHistory();
        
        // Создание новой записи
        const entry = {
            id: Date.now(),
            date: formatDateSafe(new Date()),
            timestamp: Date.now(),
            
            // Тип конвертации
            type: data.type || 'simple',
            
            // Данные для простых триггеров
            simpleTriggers: data.simpleTriggers || [],
            simpleParams: data.simpleParams || {},
            
            // Данные для связанных триггеров
            linkedGroups: data.linkedGroups || [],
            linkMode: data.linkMode || 'individual',
            
            // Результат
            regex: regex,
            regexLength: regex.length,
            
            // Статистика
            triggerCount: data.triggerCount || 0
        };

        console.log('[History] Сохранение записи:', entry);

        // Добавление в начало массива
        history.unshift(entry);

        // Ограничение количества записей (100)
        if (history.length > HISTORY_CONFIG.MAX_ITEMS) {
            history.splice(HISTORY_CONFIG.MAX_ITEMS);
        }

        // Сохранение
        saveHistoryToStorage(history);

        // Автоматически обновляем UI
        renderHistory();

        console.log(`[History] ✓ Конвертация сохранена в историю (тип: ${entry.type})`);
    } catch (error) {
        console.error('[History] Ошибка saveToHistory:', error);
    }
}

/**
 * Функция-обертка для сохранения конвертации (НОВОЕ v3.0 FINAL)
 * 
 * Собирает все данные и сохраняет в историю
 * Вызывается из main.js после успешной конвертации
 * 
 * @param {string} regex - Результат конвертации
 * @param {string} conversionType - Тип ('simple' или 'linked')
 */
function saveConversionToHistory(regex, conversionType) {
    try {
        if (!regex || !regex.trim()) {
            console.warn('[History] Regex пустой, не сохраняем');
            return;
        }
        
        let data = {};
        
        if (conversionType === 'simple') {
            // Простые триггеры
            const simpleTextarea = document.getElementById('simpleTriggers');
            const simpleTriggers = simpleTextarea && typeof parseSimpleTriggers === 'function' 
                ? parseSimpleTriggers(simpleTextarea.value) 
                : [];
            
            // Настройки оптимизаций
            const simpleParams = typeof getGlobalOptimizationStates === 'function'
                ? getGlobalOptimizationStates()
                : {};
            
            data = {
                type: 'simple',
                simpleTriggers: simpleTriggers,
                simpleParams: simpleParams,
                linkedGroups: [],
                triggerCount: simpleTriggers.length
            };
            
        } else if (conversionType === 'linked') {
            // Связанные триггеры
            const linkedGroups = typeof getLinkedGroups === 'function' 
                ? getLinkedGroups() 
                : [];
            const linkMode = typeof getLinkMode === 'function'
                ? getLinkMode()
                : 'individual';
            
            // Подсчет триггеров
            const triggerCount = linkedGroups.reduce((sum, group) => {
                return sum + group.subgroups.reduce((subSum, subgroup) => {
                    return subSum + subgroup.triggers.length;
                }, 0);
            }, 0);
            
            data = {
                type: 'linked',
                simpleTriggers: [],
                simpleParams: {},
                linkedGroups: linkedGroups,
                linkMode: linkMode,
                triggerCount: triggerCount
            };
        }
        
        // Сохраняем
        saveToHistory(regex, data);
        
        console.log('[History] ✓ Конвертация сохранена через обертку');
        
    } catch (error) {
        console.error('[History] Ошибка saveConversionToHistory:', error);
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
        
        showToast('success', '✓ Запись удалена из истории');
    } catch (error) {
        console.error('[History] Ошибка deleteFromHistory:', error);
        showToast('error', 'Ошибка удаления');
    }
}

/**
 * Очистка всей истории
 */
function clearHistory() {
    try {
        localStorage.removeItem(HISTORY_CONFIG.STORAGE_KEY);
        renderHistory();
        showToast('success', '✓ История очищена');
    } catch (error) {
        logError('clearHistory', error);
        showToast('error', 'Ошибка очистки истории');
    }
}

// ============================================
// UI ФУНКЦИИ
// ============================================

/**
 * Отрисовка списка истории
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

    // Обновляем счетчик (НОВОЕ v3.0 FINAL)
    updateHistoryCounter(history.length);

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

    historyList.innerHTML = history.map(item => {
        const typeIcon = item.type === 'linked' ? '🔗' : '📝';
        const typeLabel = item.type === 'linked' ? 'Связанные' : 'Простые';
        const pluralTriggers = pluralizeSafe(item.triggerCount || 0, ['триггер', 'триггера', 'триггеров']);
        
        return `
        <div class="history-item" data-id="${item.id}">
            <div class="history-item-header">
                <span class="history-item-date">🕒 ${escapeHTMLSafe(item.date)}</span>
                <span class="history-item-type">${typeIcon} ${typeLabel}</span>
            </div>
            
            <div class="history-item-regex" title="${escapeHTMLSafe(item.regex)}">
                ${escapeHTMLSafe(truncateRegex(item.regex, 60))}
            </div>
            
            <div class="history-item-meta">
                <span title="Количество триггеров">
                    📝 ${item.triggerCount || 0} ${pluralTriggers}
                </span>
                <span title="Длина регулярного выражения">
                    📏 ${item.regexLength} символов
                </span>
            </div>
            
            <div class="history-item-actions">
                <button 
                    class="btn-sm btn-secondary" 
                    onclick="showHistoryDetails(${item.id})"
                    title="Подробная информация"
                >
                    ℹ️ Детали
                </button>
                <button 
                    class="btn-sm btn-primary" 
                    onclick="loadFromHistory(${item.id})"
                    title="Загрузить конвертацию"
                >
                    📥 Загрузить
                </button>
                <button 
                    class="btn-sm btn-secondary" 
                    onclick="exportFromHistory(${item.id})"
                    title="Скачать файл"
                >
                    💾 Скачать
                </button>
                <button 
                    class="btn-icon btn-icon-sm btn-icon-danger" 
                    onclick="deleteFromHistory(${item.id})"
                    title="Удалить запись"
                >
                    ×
                </button>
            </div>
        </div>
    `;
    }).join('');
    
    console.log('[History] ✓ История отрисована:', history.length, 'записей');
}

/**
 * Обновить счетчик истории (НОВОЕ v3.0 FINAL)
 * @param {number} count - Количество записей
 */
function updateHistoryCounter(count) {
    const counterSpan = document.getElementById('historyCount');
    if (counterSpan) {
        counterSpan.textContent = `${count} / ${HISTORY_CONFIG.MAX_ITEMS}`;
    }
}

/**
 * Загрузить запись из истории
 * @param {number} id - ID записи
 */
function loadFromHistory(id) {
    try {
        const history = loadHistory();
        const entry = history.find(item => item.id === id);
        
        if (!entry) {
            showToast('error', 'Запись не найдена');
            return;
        }

        console.log('[History] Загрузка записи:', entry);

        // Очищаем все панели перед загрузкой
        clearAllPanels();

        // Загрузка в зависимости от типа
        if (entry.type === 'simple') {
            loadSimpleTriggersFromHistory(entry);
        } else if (entry.type === 'linked') {
            loadLinkedTriggersFromHistory(entry);
        }

        // Загрузка результата в панель 3
        const resultTextarea = document.getElementById('regexResult');
        if (resultTextarea) {
            resultTextarea.value = entry.regex;
        }

        // Скроллим к началу страницы
        window.scrollTo({ top: 0, behavior: 'smooth' });

        showToast('success', '✓ Конвертация загружена из истории');
        
        console.log('[History] ✓ Запись загружена:', id);
    } catch (error) {
        console.error('[History] Ошибка loadFromHistory:', error);
        showToast('error', 'Ошибка загрузки');
    }
}

/**
 * Очистить все панели перед загрузкой
 */
function clearAllPanels() {
    // Панель 1: Простые триггеры
    const simpleTextarea = document.getElementById('simpleTriggers');
    if (simpleTextarea) {
        simpleTextarea.value = '';
    }
    
    // Панель 2: Связанные триггеры
    const linkedContainer = document.getElementById('linkedTriggersContainer');
    if (linkedContainer) {
        linkedContainer.innerHTML = '';
    }
    
    // Панель 3: Результат
    const resultTextarea = document.getElementById('regexResult');
    if (resultTextarea) {
        resultTextarea.value = '';
    }
}

/**
 * Загрузить простые триггеры из истории
 * @param {Object} entry - Запись истории
 */
function loadSimpleTriggersFromHistory(entry) {
    const simpleTextarea = document.getElementById('simpleTriggers');
    
    if (!simpleTextarea || !entry.simpleTriggers) {
        return;
    }
    
    // ИСПРАВЛЕНО: правильный перенос строк
    simpleTextarea.value = entry.simpleTriggers.join('\n');
    
    // Загружаем параметры оптимизаций
    if (entry.simpleParams) {
        Object.keys(entry.simpleParams).forEach(key => {
            const checkbox = document.getElementById(key);
            if (checkbox) {
                checkbox.checked = entry.simpleParams[key];
            }
        });
    }
    
    console.log('[History] ✓ Простые триггеры загружены:', entry.simpleTriggers.length);
}

/**
 * Загрузить связанные триггеры из истории
 * @param {Object} entry - Запись истории
 */
function loadLinkedTriggersFromHistory(entry) {
    if (!entry.linkedGroups || entry.linkedGroups.length === 0) {
        console.warn('[History] Нет связанных групп для загрузки');
        return;
    }
    
    // Проверяем наличие необходимых функций
    if (typeof addLinkedGroup !== 'function') {
        console.error('[History] Функция addLinkedGroup не найдена');
        showToast('error', 'Ошибка: модуль связанных триггеров не загружен');
        return;
    }
    
    // Устанавливаем режим связи
    if (entry.linkMode) {
        setLinkModeSafe(entry.linkMode);
    }
    
    // Создаем группы
    entry.linkedGroups.forEach((groupData, groupIndex) => {
        // Добавляем группу
        addLinkedGroup();
        
        // Получаем ID последней созданной группы
        const container = document.getElementById('linkedTriggersContainer');
        if (!container) return;
        
        const groups = container.querySelectorAll('.linked-group');
        const group = groups[groups.length - 1];
        if (!group) return;
        
        const groupId = group.id;
        
        // Сохраняем настройки группы
        if (groupData.settings) {
            setGroupSettingsSafe(groupId, groupData.settings);
        }
        
        // Очищаем дефолтную подгруппу
        const groupBody = document.getElementById(`${groupId}_body`);
        if (groupBody) {
            groupBody.innerHTML = '';
        }
        
        // Создаем подгруппы
        if (groupData.subgroups && groupData.subgroups.length > 0) {
            groupData.subgroups.forEach((subgroupData, subIndex) => {
                // Добавляем подгруппу
                if (typeof addSubgroup === 'function') {
                    addSubgroup(groupId);
                }
                
                // Получаем ID последней созданной подгруппы
                const subgroups = groupBody.querySelectorAll('.linked-subgroup');
                const subgroup = subgroups[subgroups.length - 1];
                if (!subgroup) return;
                
                const subgroupId = subgroup.id;
                
                // Очищаем дефолтные поля
                const subgroupBody = document.getElementById(`${subgroupId}_body`);
                if (subgroupBody) {
                    subgroupBody.innerHTML = '';
                }
                
                // Добавляем триггеры
                if (subgroupData.triggers && typeof addTriggerField === 'function') {
                    subgroupData.triggers.forEach(trigger => {
                        addTriggerField(groupId, subgroupId);
                        
                        // Заполняем последнее добавленное поле
                        const fields = subgroupBody.querySelectorAll('.linked-input');
                        const lastField = fields[fields.length - 1];
                        if (lastField) {
                            lastField.value = trigger;
                        }
                    });
                }
                
                // Устанавливаем связь (если не последняя подгруппа)
                if (subgroupData.connection && subIndex < groupData.subgroups.length - 1) {
                    const distanceTypeSelect = document.getElementById(`${subgroupId}_distanceType`);
                    const minInput = document.getElementById(`${subgroupId}_min`);
                    const maxInput = document.getElementById(`${subgroupId}_max`);
                    
                    if (distanceTypeSelect) {
                        distanceTypeSelect.value = subgroupData.connection.distanceType || 'fixed';
                    }
                    if (minInput) {
                        minInput.value = subgroupData.connection.distanceMin || 1;
                    }
                    if (maxInput) {
                        maxInput.value = subgroupData.connection.distanceMax || 7;
                    }
                    
                    // Обновляем UI связи
                    if (typeof updateConnectionUI === 'function') {
                        updateConnectionUI(subgroupId);
                    }
                }
            });
        }
    });
    
    // Обновляем UI настроек групп
    if (typeof updateGroupSettingsUI === 'function') {
        updateGroupSettingsUI();
    }
    
    console.log('[History] ✓ Связанные триггеры загружены:', entry.linkedGroups.length, 'групп');
}

/**
 * Показать модальное окно с деталями записи
 * @param {number} id - ID записи
 */
function showHistoryDetails(id) {
    const history = loadHistory();
    const entry = history.find(item => item.id === id);
    
    if (!entry) {
        showToast('error', 'Запись не найдена');
        return;
    }
    
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.id = 'historyDetailsModal';
    modal.style.display = 'flex';
    
    // Формируем содержимое в зависимости от типа
    let detailsHTML = '';
    
    if (entry.type === 'simple') {
        // Простые триггеры
        detailsHTML = `
            <h4>Исходные триггеры</h4>
            <div class="details-triggers">
                ${entry.simpleTriggers.map(t => `<code>${escapeHTMLSafe(t)}</code>`).join(' ')}
            </div>
            
            <h4>Параметры оптимизации</h4>
            <ul class="details-params">
                ${Object.keys(entry.simpleParams || {}).map(key => {
                    const checked = entry.simpleParams[key];
                    const icon = checked ? '✅' : '❌';
                    return `<li>${icon} ${key}: ${checked ? 'Да' : 'Нет'}</li>`;
                }).join('')}
            </ul>
        `;
    } else if (entry.type === 'linked') {
        // Связанные триггеры
        const modeLabel = getModeLabelSafe(entry.linkMode || 'individual');
        
        detailsHTML = `
            <h4>Режим связи</h4>
            <p><strong>${modeLabel}</strong></p>
            
            <h4>Группы (${entry.linkedGroups.length})</h4>
            ${entry.linkedGroups.map((group, gIndex) => `
                <div class="details-group">
                    <h5>📁 Группа ${gIndex + 1}</h5>
                    ${group.subgroups.map((subgroup, sIndex) => `
                        <div class="details-subgroup">
                            <strong>📂 Подгруппа ${sIndex + 1}:</strong>
                            ${subgroup.triggers.map(t => `<code>${escapeHTMLSafe(t)}</code>`).join(' ')}
                            ${subgroup.connection ? `<br><small>↓ Связь: ${subgroup.connection.distanceType}</small>` : ''}
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        `;
    }
    
    modal.innerHTML = `
        <div class="modal modal-large">
            <div class="modal-header">
                <h3 class="modal-title">📊 Детали регулярного выражения</h3>
                <button class="modal-close" onclick="closeHistoryDetailsModal()">×</button>
            </div>
            <div class="modal-body modal-body-scrollable">
                <div class="details-info">
                    <p><strong>Дата:</strong> ${escapeHTMLSafe(entry.date)}</p>
                    <p><strong>Тип:</strong> ${entry.type === 'linked' ? '🔗 Связанные триггеры' : '📝 Простые триггеры'}</p>
                </div>
                
                <div class="section-divider"></div>
                
                ${detailsHTML}
                
                <div class="section-divider"></div>
                
                <h4>Итоговый regex</h4>
                <div style="background: #f0f4ff; border: 1px solid #d0e3ff; border-radius: 6px; padding: 12px; margin: 12px 0; word-break: break-all; font-family: 'Courier New', monospace; font-size: 13px;">
                    ${escapeHTMLSafe(entry.regex)}
                </div>
                
                <div style="display: flex; gap: 16px; margin-top: 12px; font-size: 13px; color: #666;">
                    <span>📝 ${entry.triggerCount} триггеров</span>
                    <span>📏 ${entry.regexLength} символов</span>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeHistoryDetailsModal()">Закрыть</button>
                <button class="btn-primary" onclick="loadFromHistory(${entry.id}); closeHistoryDetailsModal();">Загрузить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
    
    // Закрытие по клику вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeHistoryDetailsModal();
        }
    });
    
    // Закрытие по ESC
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeHistoryDetailsModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

/**
 * Закрыть модальное окно деталей
 */
function closeHistoryDetailsModal() {
    const modal = document.getElementById('historyDetailsModal');
    if (modal) {
        document.body.removeChild(modal);
        document.body.classList.remove('modal-open');
    }
}

/**
 * Экспорт записи из истории
 * @param {number} id - ID записи
 */
function exportFromHistory(id) {
    const history = loadHistory();
    const entry = history.find(item => item.id === id);
    
    if (!entry) {
        showToast('error', 'Запись не найдена');
        return;
    }
    
    // Создаем модальное окно выбора формата
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.id = 'exportHistoryModal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal modal-small">
            <div class="modal-header">
                <h3 class="modal-title">💾 Экспорт записи</h3>
                <button class="modal-close" onclick="closeExportHistoryModal()">×</button>
            </div>
            <div class="modal-body">
                <p>Выберите формат экспорта:</p>
                <div class="export-options">
                    <button class="btn-primary btn-block" onclick="exportHistoryEntry(${id}, 'txt')">
                        <div><strong>📄 TXT</strong></div>
                        <div class="btn-description">Только regex</div>
                    </button>
                    <button class="btn-primary btn-block" onclick="exportHistoryEntry(${id}, 'csv')">
                        <div><strong>📊 CSV</strong></div>
                        <div class="btn-description">Триггеры + regex</div>
                    </button>
                    <button class="btn-primary btn-block" onclick="exportHistoryEntry(${id}, 'json')">
                        <div><strong>📦 JSON</strong></div>
                        <div class="btn-description">Полные данные</div>
                    </button>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeExportHistoryModal()">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
    
    // Закрытие по клику вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeExportHistoryModal();
        }
    });
}

/**
 * Закрыть модальное окно экспорта
 */
function closeExportHistoryModal() {
    const modal = document.getElementById('exportHistoryModal');
    if (modal) {
        document.body.removeChild(modal);
        document.body.classList.remove('modal-open');
    }
}

/**
 * Экспортировать запись истории в файл
 * @param {number} id - ID записи
 * @param {string} format - Формат ('txt', 'csv', 'json')
 */
function exportHistoryEntry(id, format) {
    const history = loadHistory();
    const entry = history.find(item => item.id === id);
    
    if (!entry) {
        showToast('error', 'Запись не найдена');
        return;
    }
    
    let content = '';
    let filename = '';
    let mimeType = '';
    
    if (format === 'txt') {
        // TXT: только regex
        content = entry.regex;
        filename = `regex_${entry.id}.txt`;
        mimeType = 'text/plain';
        
    } else if (format === 'csv') {
        // CSV: триггеры + regex
        const triggers = entry.type === 'simple' 
            ? entry.simpleTriggers 
            : entry.linkedGroups.flatMap(g => g.subgroups.flatMap(sg => sg.triggers));
        
        // ИСПРАВЛЕНО: правильные переносы строк
        content = 'Триггер\n' + triggers.join('\n') + '\n\nRegex\n' + entry.regex;
        filename = `regex_${entry.id}.csv`;
        mimeType = 'text/csv;charset=utf-8;';
        
    } else if (format === 'json') {
        // JSON: полные данные
        content = JSON.stringify(entry, null, 2);
        filename = `regex_${entry.id}.json`;
        mimeType = 'application/json';
    }
    
    // Скачиваем файл
    downloadFileSafe(content, filename, mimeType);
    
    // Закрываем модальное окно
    closeExportHistoryModal();
    
    showToast('success', `✓ Файл ${filename} скачан`);
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
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (SAFE с FALLBACK)
// ============================================

/**
 * Безопасное форматирование даты
 * @param {Date} date - Дата
 * @returns {string}
 */
function formatDateSafe(date) {
    if (typeof formatDate === 'function') {
        return formatDate(date);
    }
    
    // Fallback
    return date.toLocaleString(HISTORY_CONFIG.DATE_FORMAT, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * Безопасное экранирование HTML
 * @param {string} text - Текст
 * @returns {string}
 */
function escapeHTMLSafe(text) {
    if (typeof escapeHTML === 'function') {
        return escapeHTML(text);
    }
    
    // Fallback
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Безопасная плюрализация
 * @param {number} count - Число
 * @param {Array} forms - Формы ['форма1', 'форма2', 'форма5']
 * @returns {string}
 */
function pluralizeSafe(count, forms) {
    if (typeof pluralize === 'function') {
        return pluralize(count, forms);
    }
    
    // Fallback: простая логика
    const n = Math.abs(count) % 100;
    const n1 = n % 10;
    
    if (n > 10 && n < 20) return forms[2];
    if (n1 > 1 && n1 < 5) return forms[1];
    if (n1 === 1) return forms[0];
    return forms[2];
}

/**
 * Безопасное получение метки режима
 * @param {string} mode - Режим
 * @returns {string}
 */
function getModeLabelSafe(mode) {
    const labels = {
        'individual': 'Индивидуальные параметры',
        'common': 'Общий параметр',
        'alternation': 'Альтернация (A|B|C)'
    };
    
    return labels[mode] || mode;
}

/**
 * Безопасная установка режима связи
 * @param {string} mode - Режим
 */
function setLinkModeSafe(mode) {
    const modeRadios = document.querySelectorAll('input[name="linkMode"]');
    modeRadios.forEach(radio => {
        radio.checked = (radio.value === mode);
    });
}

/**
 * Безопасная установка настроек группы
 * @param {string} groupId - ID группы
 * @param {Object} settings - Настройки
 */
function setGroupSettingsSafe(groupId, settings) {
    if (typeof setGroupSettings === 'function') {
        setGroupSettings(groupId, settings);
        return;
    }
    
    // Fallback: сохраняем в data-атрибут
    const group = document.getElementById(groupId);
    if (group) {
        group.dataset.settings = JSON.stringify(settings);
    }
}

/**
 * Безопасная загрузка файла
 * @param {string} content - Содержимое
 * @param {string} filename - Имя файла
 * @param {string} mimeType - MIME тип
 */
function downloadFileSafe(content, filename, mimeType) {
    if (typeof downloadFile === 'function') {
        downloadFile(content, filename, mimeType);
        return;
    }
    
    // Fallback: собственная реализация
    try {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('[History] Ошибка downloadFileSafe:', error);
    }
}

/**
 * Обрезка regex для превью
 * @param {string} regex - Регулярное выражение
 * @param {number} maxLength - Максимальная длина
 * @returns {string}
 */
function truncateRegex(regex, maxLength = 60) {
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
window.saveConversionToHistory = saveConversionToHistory;
window.loadHistory = loadHistory;
window.renderHistory = renderHistory;
window.loadFromHistory = loadFromHistory;
window.deleteFromHistory = deleteFromHistory;
window.clearHistory = clearHistory;
window.showHistoryDetails = showHistoryDetails;
window.closeHistoryDetailsModal = closeHistoryDetailsModal;
window.exportFromHistory = exportFromHistory;
window.closeExportHistoryModal = closeExportHistoryModal;
window.exportHistoryEntry = exportHistoryEntry;
window.updateHistoryCounter = updateHistoryCounter;

console.log('✅ Модуль history.js загружен (v3.0 FINAL - готова к заморозке ❄️)');
