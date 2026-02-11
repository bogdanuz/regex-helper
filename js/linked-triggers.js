/* ============================================
   REGEXHELPER - LINKED TRIGGERS
   Управление связанными триггерами с подгруппами
   
   ВЕРСИЯ: 3.0 FINAL
   ДАТА: 11.02.2026
   ИЗМЕНЕНИЯ:
   - БЛОК 3: Подгруппы (2 уровня вложенности)
   - БЛОК 3: 3 режима связи групп (индивидуальные/общий/альтернация)
   - БЛОК 9: Лимиты обновлены (15/15/15)
   - ИСПРАВЛЕНО: Экранирование в HTML options (\\ вместо \\\\\\\\)
   - ДОБАВЛЕНО: Функции с fallback для зависимостей
   - ДОБАВЛЕНО: getAllLinkedTriggers() для экспорта
   - УЛУЧШЕНО: Полный экспорт всех функций
   
   ЗАВИСИМОСТИ:
   - utils.js (cleanString)
   - errors.js (showToast, confirmAction)
   - optimizations.js (getGlobalOptimizationStates)
   ============================================ */

/* ============================================
   КОНСТАНТЫ И ЛИМИТЫ (ОБНОВЛЕНО v3.0)
   ============================================ */

const LINKED_LIMITS = {
    MAX_GROUPS: 15,                  // Максимум групп (было 10)
    MAX_TRIGGERS_PER_GROUP: 15,      // Максимум триггеров в группе (было 9)
    MAX_SUBGROUPS_PER_GROUP: 15,     // Максимум подгрупп в группе (НОВОЕ)
    MIN_TRIGGERS_PER_GROUP: 2,       // Минимум триггеров в группе
    MIN_TRIGGERS_PER_SUBGROUP: 1,    // Минимум триггеров в подгруппе (НОВОЕ)
    PERMUTATION_WARNING: 10          // Предупреждение если перестановок > 10 (ОБНОВЛЕНО)
};

// Счётчики для уникальных ID
let linkedGroupCounter = 0;
let linkedSubgroupCounter = 0;
let linkedFieldCounter = 0;

// localStorage ключи
const LINKED_SETTINGS_KEY = 'regexhelper_linked_settings';
const LINKED_MODE_KEY = 'regexhelper_linked_mode'; // НОВОЕ: режим связи

/* ============================================
   РЕЖИМЫ СВЯЗИ ГРУПП (НОВОЕ v3.0)
   ============================================ */

const LINK_MODES = {
    INDIVIDUAL: 'individual',     // Индивидуальные параметры для каждой пары
    COMMON: 'common',             // Общий параметр для всех групп
    ALTERNATION: 'alternation'    // Альтернация (объединить через |)
};

/**
 * Получить текущий режим связи из localStorage
 * @returns {string} - Режим связи (по умолчанию 'individual')
 */
function getLinkMode() {
    return localStorage.getItem(LINKED_MODE_KEY) || LINK_MODES.INDIVIDUAL;
}

/**
 * Установить режим связи в localStorage
 * @param {string} mode - Режим связи
 */
function setLinkMode(mode) {
    localStorage.setItem(LINKED_MODE_KEY, mode);
    console.log(`[LinkedTriggers] Режим связи установлен: ${mode}`);
}

/* ============================================
   SAFE ФУНКЦИИ (FALLBACK ДЛЯ ЗАВИСИМОСТЕЙ)
   ============================================ */

/**
 * Безопасная очистка строки
 * @param {string} str - Строка
 * @returns {string}
 */
function cleanStringSafe(str) {
    if (typeof cleanString === 'function') {
        return cleanString(str);
    }
    
    // Fallback
    if (!str) return '';
    return String(str).trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Безопасное получение глобальных настроек оптимизаций
 * @returns {Object}
 */
function getGlobalOptimizationStatesSafe() {
    if (typeof getGlobalOptimizationStates === 'function') {
        return getGlobalOptimizationStates();
    }
    
    // Fallback: пытаемся прочитать из DOM
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
        console.warn('[LinkedTriggers] Не удалось получить глобальные настройки');
    }
    
    return states;
}

/**
 * Безопасное подтверждение действия
 * @param {string} title - Заголовок
 * @param {string} message - Сообщение
 * @param {Function} onConfirm - Callback при подтверждении
 * @param {Function} onCancel - Callback при отмене
 */
function confirmActionSafe(title, message, onConfirm, onCancel) {
    if (typeof confirmAction === 'function') {
        confirmAction(title, message, onConfirm, onCancel);
        return;
    }
    
    // Fallback: стандартный confirm
    if (window.confirm(`${title}\n\n${message}`)) {
        if (onConfirm) onConfirm();
    } else {
        if (onCancel) onCancel();
    }
}

/**
 * Безопасный toast
 * @param {string} type - Тип (success, error, warning, info)
 * @param {string} message - Сообщение
 */
function showToastSafe(type, message) {
    if (typeof showToast === 'function') {
        showToast(type, message);
        return;
    }
    
    // Fallback: console
    console.log(`[Toast ${type.toUpperCase()}] ${message}`);
}

/* ============================================
   ИНИЦИАЛИЗАЦИЯ
   ============================================ */

/**
 * Инициализация модуля связанных триггеров
 */
function initLinkedTriggers() {
    const container = document.getElementById('linkedTriggersContainer');
    
    if (!container) {
        console.warn('[LinkedTriggers] Контейнер не найден');
        return;
    }
    
    // Кнопка "Добавить группу"
    const addGroupBtn = document.getElementById('addLinkedGroupBtn');
    if (addGroupBtn) {
        addGroupBtn.addEventListener('click', addLinkedGroup);
    }
    
    // Радиокнопки режима связи (НОВОЕ v3.0)
    const modeRadios = document.querySelectorAll('input[name="linkMode"]');
    if (modeRadios.length > 0) {
        // Устанавливаем текущий режим
        const currentMode = getLinkMode();
        modeRadios.forEach(radio => {
            radio.checked = (radio.value === currentMode);
            radio.addEventListener('change', (e) => {
                setLinkMode(e.target.value);
                showToastSafe('info', `Режим связи изменен: ${getModeLabel(e.target.value)}`);
            });
        });
    }
    
    console.log('[LinkedTriggers] ✅ Модуль инициализирован (v3.0 FINAL)');
}

/**
 * Получить человекочитаемую метку режима
 * @param {string} mode - Режим связи
 * @returns {string}
 */
function getModeLabel(mode) {
    switch (mode) {
        case LINK_MODES.INDIVIDUAL: return 'Индивидуальные параметры';
        case LINK_MODES.COMMON: return 'Общий параметр';
        case LINK_MODES.ALTERNATION: return 'Альтернация';
        default: return mode;
    }
}

/* ============================================
   СОЗДАНИЕ ГРУППЫ (ОБНОВЛЕНО v3.0)
   ============================================ */

/**
 * Добавить новую группу связанных триггеров
 */
function addLinkedGroup() {
    const container = document.getElementById('linkedTriggersContainer');
    
    if (!container) {
        console.error('[LinkedTriggers] Контейнер не найден');
        return;
    }
    
    // Проверка лимита групп (ОБНОВЛЕНО: 15)
    const currentGroups = container.querySelectorAll('.linked-group').length;
    if (currentGroups >= LINKED_LIMITS.MAX_GROUPS) {
        showToastSafe('warning', `Максимум ${LINKED_LIMITS.MAX_GROUPS} групп связанных триггеров`);
        return;
    }
    
    const groupId = `linkedGroup_${++linkedGroupCounter}`;
    
    // Создаём HTML группы (ОБНОВЛЕНО: с кнопкой "Добавить подгруппу")
    const groupDiv = document.createElement('div');
    groupDiv.className = 'linked-group';
    groupDiv.id = groupId;
    groupDiv.innerHTML = `
        <div class="linked-group-header">
            <span class="linked-group-title">📁 Группа ${currentGroups + 1}</span>
            <div class="group-actions">
                <button class="btn-icon btn-settings" id="${groupId}_settingsBtn" onclick="openGroupSettingsModal('${groupId}')" title="Настройки группы">⚙️</button>
                <button class="btn-icon btn-icon-warning" onclick="clearLinkedGroup('${groupId}')" title="Очистить все поля группы">🗑️</button>
                <button class="btn-icon btn-icon-danger" onclick="removeLinkedGroup('${groupId}')" title="Удалить группу целиком">×</button>
            </div>
        </div>
        <div class="linked-group-body" id="${groupId}_body">
            <!-- Подгруппы будут добавляться динамически -->
        </div>
        <div class="group-footer">
            <button class="btn-secondary btn-sm" onclick="addSubgroup('${groupId}')" id="${groupId}_addSubgroupBtn">
                + Добавить подгруппу
            </button>
        </div>
    `;
    
    container.appendChild(groupDiv);
    
    // Добавляем 1 подгруппу по умолчанию с 2 полями
    addSubgroup(groupId);
    
    // Обновляем UI
    updateGroupSettingsUI();
    
    console.log(`[LinkedTriggers] Группа ${groupId} создана`);
}

/* ============================================
   ПОДГРУППЫ (НОВОЕ v3.0)
   ============================================ */

/**
 * Добавить подгруппу в группу
 * @param {string} groupId - ID группы
 */
function addSubgroup(groupId) {
    const groupBody = document.getElementById(`${groupId}_body`);
    
    if (!groupBody) {
        console.error(`[LinkedTriggers] Группа ${groupId} не найдена`);
        return;
    }
    
    // Проверка лимита подгрупп
    const currentSubgroups = groupBody.querySelectorAll('.linked-subgroup').length;
    if (currentSubgroups >= LINKED_LIMITS.MAX_SUBGROUPS_PER_GROUP) {
        showToastSafe('warning', `Максимум ${LINKED_LIMITS.MAX_SUBGROUPS_PER_GROUP} подгрупп в группе`);
        return;
    }
    
    const subgroupId = `linkedSubgroup_${++linkedSubgroupCounter}`;
    const subgroupIndex = currentSubgroups + 1;
    
    // ИСПРАВЛЕНО: правильное экранирование в HTML (двойное \\)
    const subgroupDiv = document.createElement('div');
    subgroupDiv.className = 'linked-subgroup';
    subgroupDiv.id = subgroupId;
    subgroupDiv.dataset.groupId = groupId;
    subgroupDiv.innerHTML = `
        <div class="subgroup-header">
            <span class="subgroup-title">📂 Подгруппа ${subgroupIndex}</span>
            <button class="btn-icon btn-icon-sm" onclick="removeSubgroup('${groupId}', '${subgroupId}')" title="Удалить подгруппу">×</button>
        </div>
        <div class="subgroup-body" id="${subgroupId}_body">
            <!-- Поля триггеров -->
        </div>
        <button class="btn-link btn-sm" onclick="addTriggerField('${groupId}', '${subgroupId}')" id="${subgroupId}_addBtn">
            + Добавить триггер
        </button>
        
        <!-- Связь между подгруппами (если не последняя) -->
        <div class="subgroup-connection" id="${subgroupId}_connection" style="display: none;">
            <label class="connection-label">↓ Связь с следующей подгруппой:</label>
            <select class="connection-select" id="${subgroupId}_distanceType" onchange="updateConnectionUI('${subgroupId}')">
                <option value="fixed">.{min,max} (фиксированное)</option>
                <option value="any">[\\s\\S]+ (любое расстояние)</option>
                <option value="paragraph">.+ (в пределах абзаца)</option>
                <option value="line">[^\\n]+ (в пределах строки)</option>
            </select>
            <div class="connection-minmax" id="${subgroupId}_minmax">
                <input type="number" id="${subgroupId}_min" class="input-sm" placeholder="min" value="1" min="0" max="999">
                <span>—</span>
                <input type="number" id="${subgroupId}_max" class="input-sm" placeholder="max" value="7" min="1" max="999">
            </div>
        </div>
    `;
    
    groupBody.appendChild(subgroupDiv);
    
    // Добавляем 2 поля триггеров по умолчанию
    addTriggerField(groupId, subgroupId);
    addTriggerField(groupId, subgroupId);
    
    // Обновляем связи (показываем/скрываем connection блоки)
    updateSubgroupConnections(groupId);
    
    // Обновляем состояние кнопки "Добавить подгруппу"
    updateAddSubgroupButtonState(groupId);
    
    console.log(`[LinkedTriggers] Подгруппа ${subgroupId} добавлена в ${groupId}`);
}

/**
 * Удалить подгруппу
 * @param {string} groupId - ID группы
 * @param {string} subgroupId - ID подгруппы
 */
function removeSubgroup(groupId, subgroupId) {
    const subgroup = document.getElementById(subgroupId);
    const groupBody = document.getElementById(`${groupId}_body`);
    
    if (!subgroup || !groupBody) {
        console.error(`[LinkedTriggers] Подгруппа ${subgroupId} не найдена`);
        return;
    }
    
    // Проверка: минимум 1 подгруппа
    const currentSubgroups = groupBody.querySelectorAll('.linked-subgroup').length;
    if (currentSubgroups <= 1) {
        showToastSafe('warning', 'Минимум 1 подгруппа в группе');
        return;
    }
    
    subgroup.remove();
    
    // Обновляем нумерацию подгрупп
    updateSubgroupNumbers(groupId);
    
    // Обновляем связи
    updateSubgroupConnections(groupId);
    
    // Обновляем состояние кнопки
    updateAddSubgroupButtonState(groupId);
    
    console.log(`[LinkedTriggers] Подгруппа ${subgroupId} удалена`);
}

/**
 * Обновить нумерацию подгрупп
 * @param {string} groupId - ID группы
 */
function updateSubgroupNumbers(groupId) {
    const groupBody = document.getElementById(`${groupId}_body`);
    if (!groupBody) return;
    
    const subgroups = groupBody.querySelectorAll('.linked-subgroup');
    subgroups.forEach((subgroup, index) => {
        const title = subgroup.querySelector('.subgroup-title');
        if (title) {
            title.textContent = `📂 Подгруппа ${index + 1}`;
        }
    });
}

/**
 * Обновить связи между подгруппами (показать/скрыть connection блоки)
 * @param {string} groupId - ID группы
 */
function updateSubgroupConnections(groupId) {
    const groupBody = document.getElementById(`${groupId}_body`);
    if (!groupBody) return;
    
    const subgroups = groupBody.querySelectorAll('.linked-subgroup');
    
    subgroups.forEach((subgroup, index) => {
        const subgroupId = subgroup.id;
        const connection = document.getElementById(`${subgroupId}_connection`);
        
        if (!connection) return;
        
        // Показываем connection только если это НЕ последняя подгруппа
        if (index < subgroups.length - 1) {
            connection.style.display = 'block';
        } else {
            connection.style.display = 'none';
        }
    });
}

/**
 * Обновить UI связи (показать/скрыть min/max)
 * @param {string} subgroupId - ID подгруппы
 */
function updateConnectionUI(subgroupId) {
    const distanceTypeSelect = document.getElementById(`${subgroupId}_distanceType`);
    const minMaxDiv = document.getElementById(`${subgroupId}_minmax`);
    
    if (!distanceTypeSelect || !minMaxDiv) return;
    
    const distanceType = distanceTypeSelect.value;
    
    if (distanceType === 'fixed') {
        minMaxDiv.style.display = 'flex';
    } else {
        minMaxDiv.style.display = 'none';
    }
}

/**
 * Обновить состояние кнопки "Добавить подгруппу"
 * @param {string} groupId - ID группы
 */
function updateAddSubgroupButtonState(groupId) {
    const groupBody = document.getElementById(`${groupId}_body`);
    const addBtn = document.getElementById(`${groupId}_addSubgroupBtn`);
    
    if (!groupBody || !addBtn) return;
    
    const currentSubgroups = groupBody.querySelectorAll('.linked-subgroup').length;
    
    if (currentSubgroups >= LINKED_LIMITS.MAX_SUBGROUPS_PER_GROUP) {
        addBtn.disabled = true;
        addBtn.title = `Максимум ${LINKED_LIMITS.MAX_SUBGROUPS_PER_GROUP} подгрупп`;
    } else {
        addBtn.disabled = false;
        addBtn.title = 'Добавить подгруппу';
    }
}

/* ============================================
   ДОБАВЛЕНИЕ ПОЛЯ (ОБНОВЛЕНО v3.0)
   ============================================ */

/**
 * Добавить поле триггера в подгруппу
 * @param {string} groupId - ID группы
 * @param {string} subgroupId - ID подгруппы
 */
function addTriggerField(groupId, subgroupId) {
    const subgroupBody = document.getElementById(`${subgroupId}_body`);
    
    if (!subgroupBody) {
        console.error(`[LinkedTriggers] Подгруппа ${subgroupId} не найдена`);
        return;
    }
    
    // Проверка лимита полей
    const currentFields = subgroupBody.querySelectorAll('.linked-field').length;
    if (currentFields >= LINKED_LIMITS.MAX_TRIGGERS_PER_GROUP) {
        showToastSafe('warning', `Максимум ${LINKED_LIMITS.MAX_TRIGGERS_PER_GROUP} триггеров в подгруппе`);
        return;
    }
    
    const fieldId = `linkedField_${++linkedFieldCounter}`;
    
    // Создаём HTML поля
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'linked-field';
    fieldDiv.id = fieldId;
    fieldDiv.innerHTML = `
        <input 
            type="text" 
            class="input linked-input" 
            placeholder="Триггер ${currentFields + 1}"
            data-group="${groupId}"
            data-subgroup="${subgroupId}"
            data-field="${fieldId}"
        >
        <button class="btn-icon btn-icon-sm" onclick="removeTriggerField('${groupId}', '${subgroupId}', '${fieldId}')" title="Удалить триггер">×</button>
    `;
    
    subgroupBody.appendChild(fieldDiv);
    
    // Обновляем состояние кнопки "Добавить триггер"
    updateAddButtonState(subgroupId);
    
    console.log(`[LinkedTriggers] Поле ${fieldId} добавлено в ${subgroupId}`);
}

/* ============================================
   УДАЛЕНИЕ ПОЛЯ (ОБНОВЛЕНО v3.0)
   ============================================ */

/**
 * Удалить поле триггера из подгруппы
 * @param {string} groupId - ID группы
 * @param {string} subgroupId - ID подгруппы
 * @param {string} fieldId - ID поля
 */
function removeTriggerField(groupId, subgroupId, fieldId) {
    const field = document.getElementById(fieldId);
    const subgroupBody = document.getElementById(`${subgroupId}_body`);
    
    if (!field || !subgroupBody) {
        console.error(`[LinkedTriggers] Поле ${fieldId} не найдено`);
        return;
    }
    
    // Проверка минимума полей
    const currentFields = subgroupBody.querySelectorAll('.linked-field').length;
    if (currentFields <= LINKED_LIMITS.MIN_TRIGGERS_PER_SUBGROUP) {
        showToastSafe('warning', `Минимум ${LINKED_LIMITS.MIN_TRIGGERS_PER_SUBGROUP} триггер в подгруппе`);
        return;
    }
    
    field.remove();
    
    // Обновляем placeholder'ы
    updateFieldPlaceholders(subgroupId);
    
    // Обновляем состояние кнопки
    updateAddButtonState(subgroupId);
    
    console.log(`[LinkedTriggers] Поле ${fieldId} удалено`);
}

/**
 * Обновить placeholder'ы после удаления поля
 * @param {string} subgroupId - ID подгруппы
 */
function updateFieldPlaceholders(subgroupId) {
    const subgroupBody = document.getElementById(`${subgroupId}_body`);
    if (!subgroupBody) return;
    
    const fields = subgroupBody.querySelectorAll('.linked-input');
    fields.forEach((input, index) => {
        input.placeholder = `Триггер ${index + 1}`;
    });
}

/**
 * Обновить состояние кнопки "Добавить триггер"
 * @param {string} subgroupId - ID подгруппы
 */
function updateAddButtonState(subgroupId) {
    const subgroupBody = document.getElementById(`${subgroupId}_body`);
    const addBtn = document.getElementById(`${subgroupId}_addBtn`);
    
    if (!subgroupBody || !addBtn) return;
    
    const currentFields = subgroupBody.querySelectorAll('.linked-field').length;
    
    if (currentFields >= LINKED_LIMITS.MAX_TRIGGERS_PER_GROUP) {
        addBtn.disabled = true;
        addBtn.title = `Максимум ${LINKED_LIMITS.MAX_TRIGGERS_PER_GROUP} триггеров`;
    } else {
        addBtn.disabled = false;
        addBtn.title = 'Добавить триггер';
    }
}

/* ============================================
   УДАЛЕНИЕ ГРУППЫ
   ============================================ */

/**
 * Удалить группу связанных триггеров
 * @param {string} groupId - ID группы
 */
function removeLinkedGroup(groupId) {
    const group = document.getElementById(groupId);
    const container = document.getElementById('linkedTriggersContainer');
    
    if (!group || !container) {
        console.error(`[LinkedTriggers] Группа ${groupId} не найдена`);
        return;
    }
    
    confirmActionSafe(
        'Подтверждение',
        'Удалить эту группу связанных триггеров?',
        () => {
            removeGroupSettings(groupId);
            container.removeChild(group);
            updateGroupNumbers();
            console.log(`[LinkedTriggers] Группа ${groupId} удалена`);
        },
        null
    );
}

/**
 * Обновить нумерацию групп после удаления
 */
function updateGroupNumbers() {
    const container = document.getElementById('linkedTriggersContainer');
    if (!container) return;
    
    const groups = container.querySelectorAll('.linked-group');
    groups.forEach((group, index) => {
        const title = group.querySelector('.linked-group-title');
        if (title) {
            title.textContent = `📁 Группа ${index + 1}`;
        }
    });
}

/* ============================================
   НАСТРОЙКИ ГРУПП
   ============================================ */

function getGroupSettings(groupId) {
    const allSettings = JSON.parse(localStorage.getItem(LINKED_SETTINGS_KEY) || '{}');
    return allSettings[groupId] || null;
}

function setGroupSettings(groupId, settings) {
    const allSettings = JSON.parse(localStorage.getItem(LINKED_SETTINGS_KEY) || '{}');
    allSettings[groupId] = settings;
    localStorage.setItem(LINKED_SETTINGS_KEY, JSON.stringify(allSettings));
    console.log(`[LinkedTriggers] Настройки группы ${groupId} сохранены:`, settings);
}

function removeGroupSettings(groupId) {
    const allSettings = JSON.parse(localStorage.getItem(LINKED_SETTINGS_KEY) || '{}');
    delete allSettings[groupId];
    localStorage.setItem(LINKED_SETTINGS_KEY, JSON.stringify(allSettings));
    console.log(`[LinkedTriggers] Настройки группы ${groupId} удалены`);
}

function hasGroupSettings(groupId) {
    return getGroupSettings(groupId) !== null;
}

function getEffectiveGroupSettings(groupId, globalSettings) {
    const groupSettings = getGroupSettings(groupId);
    
    if (groupSettings) {
        console.log(`[LinkedTriggers] Группа ${groupId}: ИНДИВИДУАЛЬНЫЕ настройки`, groupSettings);
        return groupSettings;
    }
    
    const effectiveSettings = {
        distanceType: 'fixed',
        distanceMin: 1,
        distanceMax: 7,
        anyOrder: false,
        type1: globalSettings.type1 || false,
        type2: globalSettings.type2 || false,
        type4: globalSettings.type4 || false,
        type5: globalSettings.type5 || false
    };
    
    console.log(`[LinkedTriggers] Группа ${groupId}: ГЛОБАЛЬНЫЕ настройки`, effectiveSettings);
    return effectiveSettings;
}

function openGroupSettingsModal(groupId) {
    const modal = document.getElementById('groupSettingsModal');
    
    if (!modal) {
        console.error('[LinkedTriggers] Модальное окно groupSettingsModal не найдено');
        showToastSafe('error', 'Модальное окно настроек не найдено');
        return;
    }
    
    const group = document.getElementById(groupId);
    const groupTitle = group ? group.querySelector('.linked-group-title').textContent : groupId;
    
    const modalTitle = modal.querySelector('.modal-title');
    if (modalTitle) {
        modalTitle.textContent = `⚙ Настройки: ${groupTitle}`;
    }
    
    const globalSettings = getGlobalOptimizationStatesSafe();
    const currentSettings = getGroupSettings(groupId) || {
        distanceType: 'fixed',
        distanceMin: 1,
        distanceMax: 7,
        anyOrder: false,
        type1: globalSettings.type1,
        type2: globalSettings.type2,
        type4: globalSettings.type4,
        type5: globalSettings.type5
    };
    
    const distanceTypeRadios = modal.querySelectorAll('input[name="groupDistanceType"]');
    distanceTypeRadios.forEach(radio => {
        radio.checked = (radio.value === currentSettings.distanceType);
    });
    
    const minInput = modal.querySelector('#groupDistanceMin');
    const maxInput = modal.querySelector('#groupDistanceMax');
    if (minInput) minInput.value = currentSettings.distanceMin;
    if (maxInput) maxInput.value = currentSettings.distanceMax;
    
    toggleDistanceFields(currentSettings.distanceType);
    
    const anyOrderCheckbox = modal.querySelector('#groupAnyOrder');
    if (anyOrderCheckbox) anyOrderCheckbox.checked = currentSettings.anyOrder;
    
    const type1Checkbox = modal.querySelector('#groupType1');
    const type2Checkbox = modal.querySelector('#groupType2');
    const type4Checkbox = modal.querySelector('#groupType4');
    const type5Checkbox = modal.querySelector('#groupType5');
    
    if (type1Checkbox) type1Checkbox.checked = currentSettings.type1;
    if (type2Checkbox) type2Checkbox.checked = currentSettings.type2;
    if (type4Checkbox) type4Checkbox.checked = currentSettings.type4;
    if (type5Checkbox) type5Checkbox.checked = currentSettings.type5;
    
    modal.dataset.groupId = groupId;
    
    distanceTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            toggleDistanceFields(e.target.value);
        });
    });
    
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    
    console.log(`[LinkedTriggers] Открыто модальное окно настроек для ${groupId}`);
}

function toggleDistanceFields(distanceType) {
    const modal = document.getElementById('groupSettingsModal');
    if (!modal) return;
    
    const minMaxContainer = modal.querySelector('.distance-minmax');
    if (!minMaxContainer) return;
    
    if (distanceType === 'fixed') {
        minMaxContainer.style.display = 'block';
    } else {
        minMaxContainer.style.display = 'none';
    }
}

function applyGroupSettings() {
    const modal = document.getElementById('groupSettingsModal');
    if (!modal) return;
    
    const groupId = modal.dataset.groupId;
    if (!groupId) {
        console.error('[LinkedTriggers] groupId не найден');
        return;
    }
    
    const distanceTypeRadio = modal.querySelector('input[name="groupDistanceType"]:checked');
    const distanceType = distanceTypeRadio ? distanceTypeRadio.value : 'fixed';
    
    const minInput = modal.querySelector('#groupDistanceMin');
    const maxInput = modal.querySelector('#groupDistanceMax');
    const distanceMin = minInput ? parseInt(minInput.value) || 1 : 1;
    const distanceMax = maxInput ? parseInt(maxInput.value) || 7 : 7;
    
    const anyOrderCheckbox = modal.querySelector('#groupAnyOrder');
    const anyOrder = anyOrderCheckbox ? anyOrderCheckbox.checked : false;
    
    const type1Checkbox = modal.querySelector('#groupType1');
    const type2Checkbox = modal.querySelector('#groupType2');
    const type4Checkbox = modal.querySelector('#groupType4');
    const type5Checkbox = modal.querySelector('#groupType5');
    
    const settings = {
        distanceType: distanceType,
        distanceMin: distanceMin,
        distanceMax: distanceMax,
        anyOrder: anyOrder,
        type1: type1Checkbox ? type1Checkbox.checked : false,
        type2: type2Checkbox ? type2Checkbox.checked : false,
        type4: type4Checkbox ? type4Checkbox.checked : false,
        type5: type5Checkbox ? type5Checkbox.checked : false
    };
    
    setGroupSettings(groupId, settings);
    updateGroupSettingsUI();
    closeGroupSettingsModal();
    showToastSafe('success', 'Настройки группы применены');
    
    console.log(`[LinkedTriggers] Настройки группы ${groupId} применены`);
}

function resetGroupSettings() {
    const modal = document.getElementById('groupSettingsModal');
    if (!modal) return;
    
    const groupId = modal.dataset.groupId;
    if (!groupId) return;
    
    removeGroupSettings(groupId);
    updateGroupSettingsUI();
    closeGroupSettingsModal();
    showToastSafe('info', 'Настройки группы сброшены');
    
    console.log(`[LinkedTriggers] Настройки группы ${groupId} сброшены`);
}

function closeGroupSettingsModal() {
    const modal = document.getElementById('groupSettingsModal');
    if (modal) {
        modal.style.display = 'none';
        modal.dataset.groupId = '';
        document.body.classList.remove('modal-open');
    }
}

function updateGroupSettingsUI() {
    const container = document.getElementById('linkedTriggersContainer');
    if (!container) return;
    
    const groups = container.querySelectorAll('.linked-group');
    
    groups.forEach(group => {
        const groupId = group.id;
        const settingsBtn = document.getElementById(`${groupId}_settingsBtn`);
        
        if (!settingsBtn) return;
        
        if (hasGroupSettings(groupId)) {
            settingsBtn.classList.add('has-settings');
            settingsBtn.title = 'Настройки группы (индивидуальные)';
        } else {
            settingsBtn.classList.remove('has-settings');
            settingsBtn.title = 'Настройки группы';
        }
    });
}

/* ============================================
   ПОЛУЧЕНИЕ ДАННЫХ (ОБНОВЛЕНО v3.0)
   ============================================ */

/**
 * Получить все группы с подгруппами
 * @returns {Array}
 */
function getLinkedGroups() {
    const container = document.getElementById('linkedTriggersContainer');
    
    if (!container) {
        return [];
    }
    
    const groups = [];
    const groupElements = container.querySelectorAll('.linked-group');
    const globalSettings = getGlobalOptimizationStatesSafe();
    
    groupElements.forEach(groupEl => {
        const groupId = groupEl.id;
        const subgroupElements = groupEl.querySelectorAll('.linked-subgroup');
        
        const subgroups = [];
        
        subgroupElements.forEach((subgroupEl, subIndex) => {
            const subgroupId = subgroupEl.id;
            const inputs = subgroupEl.querySelectorAll('.linked-input');
            
            const triggers = [];
            inputs.forEach(input => {
                const value = cleanStringSafe(input.value);
                if (value) {
                    triggers.push(value);
                }
            });
            
            // Получаем настройки связи (если не последняя подгруппа)
            let connection = null;
            if (subIndex < subgroupElements.length - 1) {
                const distanceTypeSelect = document.getElementById(`${subgroupId}_distanceType`);
                const minInput = document.getElementById(`${subgroupId}_min`);
                const maxInput = document.getElementById(`${subgroupId}_max`);
                
                connection = {
                    distanceType: distanceTypeSelect ? distanceTypeSelect.value : 'fixed',
                    distanceMin: minInput ? parseInt(minInput.value) || 1 : 1,
                    distanceMax: maxInput ? parseInt(maxInput.value) || 7 : 7
                };
            }
            
            if (triggers.length >= LINKED_LIMITS.MIN_TRIGGERS_PER_SUBGROUP) {
                subgroups.push({
                    id: subgroupId,
                    triggers: triggers,
                    connection: connection
                });
            }
        });
        
        if (subgroups.length > 0) {
            const settings = getEffectiveGroupSettings(groupId, globalSettings);
            
            groups.push({
                id: groupId,
                subgroups: subgroups,
                settings: settings
            });
        }
    });
    
    return groups;
}

/**
 * Получить все триггеры из всех групп (плоский массив) - НОВОЕ v3.0 FINAL
 * Используется в history.js для экспорта
 * @returns {Array}
 */
function getAllLinkedTriggers() {
    const groups = getLinkedGroups();
    const allTriggers = [];
    
    groups.forEach(group => {
        group.subgroups.forEach(subgroup => {
            allTriggers.push(...subgroup.triggers);
        });
    });
    
    return allTriggers;
}

/**
 * Проверка: есть ли связанные триггеры
 * @returns {boolean}
 */
function hasLinkedTriggers() {
    const groups = getLinkedGroups();
    return groups.length > 0;
}

/* ============================================
   ВАЛИДАЦИЯ (ОБНОВЛЕНО v3.0)
   ============================================ */

/**
 * Валидация всех групп связанных триггеров
 * @returns {Object} - {valid: boolean, errors: [], warnings: []}
 */
function validateLinkedGroups() {
    const result = {
        valid: true,
        errors: [],
        warnings: []
    };
    
    const groups = getLinkedGroups();
    
    if (groups.length === 0) {
        return result;
    }
    
    groups.forEach((group, groupIndex) => {
        // Проверка подгрупп
        if (group.subgroups.length === 0) {
            result.valid = false;
            result.errors.push(`Группа ${groupIndex + 1}: нет подгрупп`);
        }
        
        group.subgroups.forEach((subgroup, subIndex) => {
            // Проверка: минимум 1 триггер в подгруппе
            if (subgroup.triggers.length < LINKED_LIMITS.MIN_TRIGGERS_PER_SUBGROUP) {
                result.valid = false;
                result.errors.push(`Группа ${groupIndex + 1}, Подгруппа ${subIndex + 1}: минимум ${LINKED_LIMITS.MIN_TRIGGERS_PER_SUBGROUP} триггер`);
            }
            
            // Проверка дубликатов
            const uniqueTriggers = new Set(subgroup.triggers);
            if (uniqueTriggers.size < subgroup.triggers.length) {
                result.valid = false;
                result.errors.push(`Группа ${groupIndex + 1}, Подгруппа ${subIndex + 1}: обнаружены дубликаты`);
            }
        });
        
        // Предупреждение о перестановках (ОБНОВЛЕНО: 10 вместо 720)
        if (group.settings.anyOrder) {
            const totalTriggers = group.subgroups.reduce((sum, sg) => sum + sg.triggers.length, 0);
            if (totalTriggers > LINKED_LIMITS.PERMUTATION_WARNING) {
                result.warnings.push(
                    `Группа ${groupIndex + 1}: больше ${LINKED_LIMITS.PERMUTATION_WARNING} триггеров с перестановками. Это может создать слишком много вариантов!`
                );
            }
        }
    });
    
    return result;
}

/* ============================================
   ОЧИСТКА (ОБНОВЛЕНО v3.0)
   ============================================ */

/**
 * Очистить все поля в группе
 * @param {string} groupId - ID группы
 */
function clearLinkedGroup(groupId) {
    const groupBody = document.getElementById(`${groupId}_body`);
    
    if (!groupBody) {
        console.error(`[LinkedTriggers] Группа ${groupId} не найдена`);
        return;
    }
    
    const inputs = groupBody.querySelectorAll('.linked-input');
    
    if (inputs.length === 0) return;
    
    let hasValues = false;
    inputs.forEach(input => {
        if (input.value.trim()) {
            hasValues = true;
        }
    });
    
    if (!hasValues) {
        showToastSafe('info', 'Все поля уже пустые');
        return;
    }
    
    confirmActionSafe(
        'Подтверждение',
        'Очистить все поля в этой группе?',
        () => {
            inputs.forEach(input => {
                input.value = '';
            });
            showToastSafe('info', 'Поля группы очищены');
            console.log(`[LinkedTriggers] Группа ${groupId} очищена`);
        },
        null
    );
}

/**
 * Очистить все связанные группы
 */
function clearAllLinkedGroups() {
    const container = document.getElementById('linkedTriggersContainer');
    if (!container) return;
    
    const groups = container.querySelectorAll('.linked-group');
    if (groups.length === 0) {
        showToastSafe('info', 'Нет групп для очистки');
        return;
    }
    
    confirmActionSafe(
        'Подтверждение',
        'Очистить все группы связанных триггеров?',
        () => {
            localStorage.removeItem(LINKED_SETTINGS_KEY);
            container.innerHTML = '';
            showToastSafe('info', 'Все группы удалены');
            console.log('[LinkedTriggers] Все группы очищены');
        },
        null
    );
}

/* ============================================
   ЭКСПОРТ ФУНКЦИЙ (РАСШИРЕННЫЙ v3.0 FINAL)
   ============================================ */

// Основные функции управления
window.initLinkedTriggers = initLinkedTriggers;
window.addLinkedGroup = addLinkedGroup;
window.removeLinkedGroup = removeLinkedGroup;
window.addSubgroup = addSubgroup;
window.removeSubgroup = removeSubgroup;
window.addTriggerField = addTriggerField;
window.removeTriggerField = removeTriggerField;
window.clearLinkedGroup = clearLinkedGroup;
window.clearAllLinkedGroups = clearAllLinkedGroups;

// Настройки групп
window.openGroupSettingsModal = openGroupSettingsModal;
window.applyGroupSettings = applyGroupSettings;
window.resetGroupSettings = resetGroupSettings;
window.closeGroupSettingsModal = closeGroupSettingsModal;
window.updateGroupSettingsUI = updateGroupSettingsUI;
window.setGroupSettings = setGroupSettings;
window.getGroupSettings = getGroupSettings;

// Получение данных
window.getLinkedGroups = getLinkedGroups;
window.getAllLinkedTriggers = getAllLinkedTriggers; // НОВОЕ!
window.hasLinkedTriggers = hasLinkedTriggers;
window.validateLinkedGroups = validateLinkedGroups;

// Режимы связи
window.getLinkMode = getLinkMode;
window.setLinkMode = setLinkMode;
window.getModeLabel = getModeLabel;

// UI
window.updateConnectionUI = updateConnectionUI;

console.log('✅ Модуль linked-triggers.js загружен (v3.0 FINAL)');
