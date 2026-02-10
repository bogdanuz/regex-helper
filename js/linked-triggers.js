/* ============================================
   REGEXHELPER - LINKED TRIGGERS
   Управление связанными триггерами (перестановки)
   
   ВЕРСИЯ: 2.0 (CRIT-1 исправлен + anyOrder реализован)
   ДАТА: 10.02.2026
   ИЗМЕНЕНИЯ:
   - CRIT-1: Удален type3 из настроек групп
   - Type 3 реализован через distanceType (fixed/any/paragraph/line)
   - Задача 2.4: UI настроек группы (модалка + кнопка ⚙️)
   - localStorage для групп
   - Показ/скрытие полей min/max для distanceType='fixed'
   ============================================ */

/* ============================================
   КОНСТАНТЫ И ЛИМИТЫ
   ============================================ */

const LINKED_LIMITS = {
    MAX_GROUPS: 10,              // Максимум групп
    MAX_TRIGGERS_PER_GROUP: 9,   // Максимум триггеров в группе
    MIN_TRIGGERS_PER_GROUP: 2,   // Минимум триггеров в группе
    PERMUTATION_WARNING: 720     // Предупреждение если перестановок > 720 (6!)
};

// Счётчик для уникальных ID
let linkedGroupCounter = 0;
let linkedFieldCounter = 0;

// localStorage ключ для настроек групп
const LINKED_SETTINGS_KEY = 'regexhelper_linked_settings';

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
    
    // Устанавливаем event listener на кнопку "Добавить группу"
    const addGroupBtn = document.getElementById('addLinkedGroupBtn');
    if (addGroupBtn) {
        addGroupBtn.addEventListener('click', addLinkedGroup);
    }
    
    console.log('[LinkedTriggers] Модуль инициализирован');
}

/* ============================================
   СОЗДАНИЕ ГРУППЫ
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
    
    // Проверка лимита групп
    const currentGroups = container.querySelectorAll('.linked-group').length;
    if (currentGroups >= LINKED_LIMITS.MAX_GROUPS) {
        showToast('warning', `Максимум ${LINKED_LIMITS.MAX_GROUPS} групп связанных триггеров`);
        return;
    }
    
    const groupId = `linkedGroup_${++linkedGroupCounter}`;
    
    // Создаём HTML группы (с кнопкой ⚙️)
    const groupDiv = document.createElement('div');
    groupDiv.className = 'linked-group';
    groupDiv.id = groupId;
    groupDiv.innerHTML = `
        <div class="linked-group-header">
            <span class="linked-group-title">Группа ${currentGroups + 1}</span>
            <div class="group-actions">
                <button class="btn-icon btn-settings" id="${groupId}_settingsBtn" onclick="openGroupSettingsModal('${groupId}')" title="Настройки группы">⚙️</button>
                <button class="btn-icon btn-icon-warning" onclick="clearLinkedGroup('${groupId}')" title="Очистить все поля группы">🗑️</button>
                <button class="btn-icon btn-icon-danger" onclick="removeLinkedGroup('${groupId}')" title="Удалить группу целиком">🗙</button>
            </div>
        </div>
        <div class="linked-group-body" id="${groupId}_body">
            <!-- Поля будут добавляться динамически -->
        </div>
        <button class="btn-secondary btn-sm mt-1" onclick="addTriggerField('${groupId}')" id="${groupId}_addBtn">
            + Добавить триггер
        </button>
    `;
    
    container.appendChild(groupDiv);
    
    // Добавляем 2 поля по умолчанию
    addTriggerField(groupId);
    addTriggerField(groupId);
    
    // Обновляем UI кнопки настроек (белая по умолчанию)
    updateGroupSettingsUI();
    
    console.log(`[LinkedTriggers] Группа ${groupId} создана`);
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
    
    confirmAction(
        'Подтверждение',
        'Удалить эту группу связанных триггеров?',
        () => {
            // Удаляем настройки группы из localStorage
            removeGroupSettings(groupId);
            
            // Удаляем HTML элемент
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
            title.textContent = `Группа ${index + 1}`;
        }
    });
}

/* ============================================
   ДОБАВЛЕНИЕ ПОЛЯ
   ============================================ */

/**
 * Добавить поле триггера в группу
 * @param {string} groupId - ID группы
 */
function addTriggerField(groupId) {
    const groupBody = document.getElementById(`${groupId}_body`);
    
    if (!groupBody) {
        console.error(`[LinkedTriggers] Тело группы ${groupId} не найдено`);
        return;
    }
    
    // Проверка лимита полей в группе
    const currentFields = groupBody.querySelectorAll('.linked-field').length;
    if (currentFields >= LINKED_LIMITS.MAX_TRIGGERS_PER_GROUP) {
        showToast('warning', `Максимум ${LINKED_LIMITS.MAX_TRIGGERS_PER_GROUP} триггеров в группе`);
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
            data-field="${fieldId}"
        >
        <button class="btn-icon btn-icon-sm" onclick="removeTriggerField('${groupId}', '${fieldId}')" title="Удалить это поле триггера">×</button>
    `;
    
    groupBody.appendChild(fieldDiv);
    
    // Обновляем состояние кнопки "Добавить триггер"
    updateAddButtonState(groupId);
    
    console.log(`[LinkedTriggers] Поле ${fieldId} добавлено в ${groupId}`);
}

/* ============================================
   УДАЛЕНИЕ ПОЛЯ
   ============================================ */

/**
 * Удалить поле триггера из группы
 * @param {string} groupId - ID группы
 * @param {string} fieldId - ID поля
 */
function removeTriggerField(groupId, fieldId) {
    const field = document.getElementById(fieldId);
    const groupBody = document.getElementById(`${groupId}_body`);
    
    if (!field || !groupBody) {
        console.error(`[LinkedTriggers] Поле ${fieldId} или группа ${groupId} не найдены`);
        return;
    }
    
    // Проверка минимума полей
    const currentFields = groupBody.querySelectorAll('.linked-field').length;
    if (currentFields <= LINKED_LIMITS.MIN_TRIGGERS_PER_GROUP) {
        showToast('warning', `Минимум ${LINKED_LIMITS.MIN_TRIGGERS_PER_GROUP} триггера в группе`);
        return;
    }
    
    field.remove();
    
    // Обновляем placeholder'ы
    updateFieldPlaceholders(groupId);
    
    // Обновляем состояние кнопки "Добавить триггер"
    updateAddButtonState(groupId);
    
    console.log(`[LinkedTriggers] Поле ${fieldId} удалено из ${groupId}`);
}

/**
 * Обновить placeholder'ы после удаления поля
 * @param {string} groupId - ID группы
 */
function updateFieldPlaceholders(groupId) {
    const groupBody = document.getElementById(`${groupId}_body`);
    if (!groupBody) return;
    
    const fields = groupBody.querySelectorAll('.linked-input');
    fields.forEach((input, index) => {
        input.placeholder = `Триггер ${index + 1}`;
    });
}

/**
 * Обновить состояние кнопки "Добавить триггер"
 * @param {string} groupId - ID группы
 */
function updateAddButtonState(groupId) {
    const groupBody = document.getElementById(`${groupId}_body`);
    const addBtn = document.getElementById(`${groupId}_addBtn`);
    
    if (!groupBody || !addBtn) return;
    
    const currentFields = groupBody.querySelectorAll('.linked-field').length;
    
    if (currentFields >= LINKED_LIMITS.MAX_TRIGGERS_PER_GROUP) {
        addBtn.disabled = true;
        addBtn.title = `Максимум ${LINKED_LIMITS.MAX_TRIGGERS_PER_GROUP} триггеров`;
    } else {
        addBtn.disabled = false;
        addBtn.title = 'Добавить триггер';
    }
}

/* ============================================
   НАСТРОЙКИ ГРУПП (ИСПРАВЛЕНО v2.0)
   ============================================ */

/**
 * Получить настройки группы из localStorage
 * @param {string} groupId - ID группы
 * @returns {Object|null} - Настройки группы или null
 */
function getGroupSettings(groupId) {
    const allSettings = JSON.parse(localStorage.getItem(LINKED_SETTINGS_KEY) || '{}');
    return allSettings[groupId] || null;
}

/**
 * Установить настройки группы в localStorage
 * @param {string} groupId - ID группы
 * @param {Object} settings - Настройки группы
 */
function setGroupSettings(groupId, settings) {
    const allSettings = JSON.parse(localStorage.getItem(LINKED_SETTINGS_KEY) || '{}');
    allSettings[groupId] = settings;
    localStorage.setItem(LINKED_SETTINGS_KEY, JSON.stringify(allSettings));
    
    console.log(`[LinkedTriggers] Настройки группы ${groupId} сохранены:`, settings);
}

/**
 * Удалить настройки группы из localStorage
 * @param {string} groupId - ID группы
 */
function removeGroupSettings(groupId) {
    const allSettings = JSON.parse(localStorage.getItem(LINKED_SETTINGS_KEY) || '{}');
    delete allSettings[groupId];
    localStorage.setItem(LINKED_SETTINGS_KEY, JSON.stringify(allSettings));
    
    console.log(`[LinkedTriggers] Настройки группы ${groupId} удалены`);
}

/**
 * Проверить наличие индивидуальных настроек группы
 * @param {string} groupId - ID группы
 * @returns {boolean}
 */
function hasGroupSettings(groupId) {
    return getGroupSettings(groupId) !== null;
}

/**
 * Получить эффективные настройки группы (индивидуальные или глобальные)
 * 
 * ИСПРАВЛЕНО v2.0: type3 УДАЛЕН!
 * Type 3 реализован через distanceType (fixed/any/paragraph/line)
 * 
 * @param {string} groupId - ID группы
 * @param {Object} globalSettings - Глобальные настройки
 * @returns {Object} - Финальные настройки
 */
function getEffectiveGroupSettings(groupId, globalSettings) {
    const groupSettings = getGroupSettings(groupId);
    
    if (groupSettings) {
        // Есть индивидуальные настройки → используем их
        console.log(`[LinkedTriggers] Группа ${groupId}: ИНДИВИДУАЛЬНЫЕ настройки`, groupSettings);
        return groupSettings;
    }
    
    // Нет индивидуальных настроек → используем ГЛОБАЛЬНЫЕ + дефолт для расстояния
    const effectiveSettings = {
        // Настройки расстояния (Type 3 реализован ЗДЕСЬ!)
        distanceType: 'fixed',
        distanceMin: 1,
        distanceMax: 7,
        anyOrder: false,
        
        // Оптимизации триггеров (БЕЗ type3!)
        type1: globalSettings.type1 || false,
        type2: globalSettings.type2 || false,
        // type3: УДАЛЕН! (реализован через distanceType)
        type4: globalSettings.type4 || false,
        type5: globalSettings.type5 || false
    };
    
    console.log(`[LinkedTriggers] Группа ${groupId}: ГЛОБАЛЬНЫЕ настройки`, effectiveSettings);
    return effectiveSettings;
}

/**
 * Открыть модальное окно настроек группы
 * 
 * ИСПРАВЛЕНО v2.0: type3 УДАЛЕН!
 * 
 * @param {string} groupId - ID группы
 */
function openGroupSettingsModal(groupId) {
    const modal = document.getElementById('groupSettingsModal');
    
    if (!modal) {
        console.error('[LinkedTriggers] Модальное окно groupSettingsModal не найдено');
        showToast('error', 'Модальное окно настроек не найдено. Проверьте index.html');
        return;
    }
    
    // Получаем название группы
    const group = document.getElementById(groupId);
    const groupTitle = group ? group.querySelector('.linked-group-title').textContent : groupId;
    
    // Устанавливаем заголовок модального окна
    const modalTitle = modal.querySelector('.modal-title');
    if (modalTitle) {
        modalTitle.textContent = `⚙ Настройки: ${groupTitle}`;
    }
    
    // Получаем текущие настройки (или глобальные по умолчанию)
    const globalSettings = getGlobalOptimizationStates();
    const currentSettings = getGroupSettings(groupId) || {
        distanceType: 'fixed',
        distanceMin: 1,
        distanceMax: 7,
        anyOrder: false,
        type1: globalSettings.type1,
        type2: globalSettings.type2,
        // type3: УДАЛЕН!
        type4: globalSettings.type4,
        type5: globalSettings.type5
    };
    
    // Заполняем форму
    const distanceTypeRadios = modal.querySelectorAll('input[name="groupDistanceType"]');
    distanceTypeRadios.forEach(radio => {
        radio.checked = (radio.value === currentSettings.distanceType);
    });
    
    // Поля min/max
    const minInput = modal.querySelector('#groupDistanceMin');
    const maxInput = modal.querySelector('#groupDistanceMax');
    if (minInput) minInput.value = currentSettings.distanceMin;
    if (maxInput) maxInput.value = currentSettings.distanceMax;
    
    // Показываем/скрываем поля min/max в зависимости от типа
    toggleDistanceFields(currentSettings.distanceType);
    
    // Чекбокс "Любая последовательность"
    const anyOrderCheckbox = modal.querySelector('#groupAnyOrder');
    if (anyOrderCheckbox) anyOrderCheckbox.checked = currentSettings.anyOrder;
    
    // Чекбоксы оптимизаций (ИСПРАВЛЕНО: БЕЗ type3!)
    const type1Checkbox = modal.querySelector('#groupType1');
    const type2Checkbox = modal.querySelector('#groupType2');
    // const type3Checkbox = modal.querySelector('#groupType3');  // ← УДАЛЕНО!
    const type4Checkbox = modal.querySelector('#groupType4');
    const type5Checkbox = modal.querySelector('#groupType5');
    
    if (type1Checkbox) type1Checkbox.checked = currentSettings.type1;
    if (type2Checkbox) type2Checkbox.checked = currentSettings.type2;
    // if (type3Checkbox) type3Checkbox.checked = currentSettings.type3;  // ← УДАЛЕНО!
    if (type4Checkbox) type4Checkbox.checked = currentSettings.type4;
    if (type5Checkbox) type5Checkbox.checked = currentSettings.type5;
    
    // Сохраняем groupId в data-атрибуте модального окна
    modal.dataset.groupId = groupId;
    
    // Event listeners для радиокнопок (показывать/скрывать поля min/max)
    distanceTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            toggleDistanceFields(e.target.value);
        });
    });
    
    // Показываем модальное окно
    modal.style.display = 'block';
    
    console.log(`[LinkedTriggers] Открыто модальное окно настроек для ${groupId}`);
}

/**
 * Показать/скрыть поля min/max в зависимости от типа расстояния
 * @param {string} distanceType - Тип расстояния
 */
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

/**
 * Применить настройки группы (кнопка "Применить" в модальном окне)
 * 
 * ИСПРАВЛЕНО v2.0: type3 УДАЛЕН!
 */
function applyGroupSettings() {
    const modal = document.getElementById('groupSettingsModal');
    if (!modal) return;
    
    const groupId = modal.dataset.groupId;
    if (!groupId) {
        console.error('[LinkedTriggers] groupId не найден в модальном окне');
        return;
    }
    
    // Собираем данные из формы
    const distanceTypeRadio = modal.querySelector('input[name="groupDistanceType"]:checked');
    const distanceType = distanceTypeRadio ? distanceTypeRadio.value : 'fixed';
    
    const minInput = modal.querySelector('#groupDistanceMin');
    const maxInput = modal.querySelector('#groupDistanceMax');
    const distanceMin = minInput ? parseInt(minInput.value) || 1 : 1;
    const distanceMax = maxInput ? parseInt(maxInput.value) || 7 : 7;
    
    const anyOrderCheckbox = modal.querySelector('#groupAnyOrder');
    const anyOrder = anyOrderCheckbox ? anyOrderCheckbox.checked : false;
    
    // ИСПРАВЛЕНО v2.0: БЕЗ type3!
    const type1Checkbox = modal.querySelector('#groupType1');
    const type2Checkbox = modal.querySelector('#groupType2');
    // const type3Checkbox = modal.querySelector('#groupType3');  // ← УДАЛЕНО!
    const type4Checkbox = modal.querySelector('#groupType4');
    const type5Checkbox = modal.querySelector('#groupType5');
    
    const settings = {
        distanceType: distanceType,
        distanceMin: distanceMin,
        distanceMax: distanceMax,
        anyOrder: anyOrder,
        type1: type1Checkbox ? type1Checkbox.checked : false,
        type2: type2Checkbox ? type2Checkbox.checked : false,
        // type3: УДАЛЕН! (реализован через distanceType)
        type4: type4Checkbox ? type4Checkbox.checked : false,
        type5: type5Checkbox ? type5Checkbox.checked : false
    };
    
    // Сохраняем настройки
    setGroupSettings(groupId, settings);
    
    // Обновляем UI кнопки (белая → зеленая)
    updateGroupSettingsUI();
    
    // Закрываем модальное окно
    closeGroupSettingsModal();
    
    // Toast уведомление
    showToast('success', 'Настройки группы применены');
    
    console.log(`[LinkedTriggers] Настройки группы ${groupId} применены`);
}

/**
 * Сбросить настройки группы (кнопка "Сбросить" в модальном окне)
 */
function resetGroupSettings() {
    const modal = document.getElementById('groupSettingsModal');
    if (!modal) return;
    
    const groupId = modal.dataset.groupId;
    if (!groupId) return;
    
    // Удаляем настройки из localStorage
    removeGroupSettings(groupId);
    
    // Обновляем UI кнопки (зеленая → белая)
    updateGroupSettingsUI();
    
    // Закрываем модальное окно
    closeGroupSettingsModal();
    
    // Toast уведомление
    showToast('info', 'Настройки группы сброшены');
    
    console.log(`[LinkedTriggers] Настройки группы ${groupId} сброшены`);
}

/**
 * Закрыть модальное окно настроек группы
 */
function closeGroupSettingsModal() {
    const modal = document.getElementById('groupSettingsModal');
    if (modal) {
        modal.style.display = 'none';
        modal.dataset.groupId = '';
    }
}

/**
 * Обновить UI кнопок настроек (белая/зеленая)
 */
function updateGroupSettingsUI() {
    const container = document.getElementById('linkedTriggersContainer');
    if (!container) return;
    
    const groups = container.querySelectorAll('.linked-group');
    
    groups.forEach(group => {
        const groupId = group.id;
        const settingsBtn = document.getElementById(`${groupId}_settingsBtn`);
        
        if (!settingsBtn) return;
        
        if (hasGroupSettings(groupId)) {
            // Есть индивидуальные настройки → зеленая кнопка
            settingsBtn.classList.add('has-settings');
            settingsBtn.title = 'Настройки группы (индивидуальные)';
        } else {
            // Нет индивидуальных настроек → белая кнопка
            settingsBtn.classList.remove('has-settings');
            settingsBtn.title = 'Настройки группы';
        }
    });
}

/* ============================================
   ПОЛУЧЕНИЕ ДАННЫХ (ОБНОВЛЕНО)
   ============================================ */

/**
 * Получить все группы связанных триггеров (с настройками)
 * @returns {Array} - Массив групп [{id: string, triggers: [string], settings: Object}]
 */
function getLinkedGroups() {
    const container = document.getElementById('linkedTriggersContainer');
    
    if (!container) {
        return [];
    }
    
    const groups = [];
    const groupElements = container.querySelectorAll('.linked-group');
    const globalSettings = getGlobalOptimizationStates();
    
    groupElements.forEach(groupEl => {
        const groupId = groupEl.id;
        const inputs = groupEl.querySelectorAll('.linked-input');
        
        const triggers = [];
        inputs.forEach(input => {
            const value = cleanString(input.value);
            if (value) {
                triggers.push(value);
            }
        });
        
        if (triggers.length >= LINKED_LIMITS.MIN_TRIGGERS_PER_GROUP) {
            // Получаем эффективные настройки (индивидуальные или глобальные)
            const settings = getEffectiveGroupSettings(groupId, globalSettings);
            
            groups.push({
                id: groupId,
                triggers: triggers,
                settings: settings
            });
        }
    });
    
    return groups;
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
   ВАЛИДАЦИЯ
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
        // Нет групп - это OK, валидация проходит
        return result;
    }
    
    groups.forEach((group, index) => {
        // Проверка: минимум 2 триггера
        if (group.triggers.length < LINKED_LIMITS.MIN_TRIGGERS_PER_GROUP) {
            result.valid = false;
            result.errors.push(`Группа ${index + 1}: минимум ${LINKED_LIMITS.MIN_TRIGGERS_PER_GROUP} триггера`);
        }
        
        // Проверка: есть ли дубликаты
        const uniqueTriggers = new Set(group.triggers);
        if (uniqueTriggers.size < group.triggers.length) {
            result.valid = false;
            result.errors.push(`Группа ${index + 1}: обнаружены дубликаты`);
        }
        
        // Проверка: количество перестановок (если anyOrder включен)
        if (group.settings.anyOrder) {
            const permutationCount = factorial(group.triggers.length);
            if (permutationCount > LINKED_LIMITS.PERMUTATION_WARNING) {
                result.warnings.push(
                    `Группа ${index + 1}: будет создано ${permutationCount} перестановок. Это может замедлить работу.`
                );
            }
        }
    });
    
    return result;
}

/* ============================================
   ГЕНЕРАЦИЯ ПЕРЕСТАНОВОК
   ============================================ */

/**
 * Генерация всех перестановок для связанных триггеров
 * @returns {Array} - Массив всех перестановок (строк)
 */
function generateLinkedPermutations() {
    const groups = getLinkedGroups();
    
    if (groups.length === 0) {
        return [];
    }
    
    let allPermutations = [];
    
    groups.forEach(group => {
        const permutations = getPermutations(group.triggers);
        
        // Объединяем триггеры в строки
        const permutationStrings = permutations.map(perm => perm.join(' '));
        
        allPermutations = allPermutations.concat(permutationStrings);
    });
    
    return allPermutations;
}

/**
 * Подсчёт общего количества перестановок
 * @returns {number} - Количество перестановок
 */
function countLinkedPermutations() {
    const groups = getLinkedGroups();
    
    if (groups.length === 0) {
        return 0;
    }
    
    let totalCount = 0;
    
    groups.forEach(group => {
        const count = factorial(group.triggers.length);
        totalCount += count;
    });
    
    return totalCount;
}

/* ============================================
   ОЧИСТКА
   ============================================ */

/**
 * Очистить все поля в группе (не удалять саму группу)
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
    
    // Проверяем есть ли заполненные поля
    let hasValues = false;
    inputs.forEach(input => {
        if (input.value.trim()) {
            hasValues = true;
        }
    });
    
    if (!hasValues) {
        showToast('info', 'Все поля уже пустые');
        return;
    }
    
    confirmAction(
        'Подтверждение',
        'Очистить все поля в этой группе?',
        () => {
            inputs.forEach(input => {
                input.value = '';
            });
            showToast('info', 'Поля группы очищены');
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
        showToast('info', 'Нет групп для очистки');
        return;
    }
    
    confirmAction(
        'Подтверждение',
        'Очистить все группы связанных триггеров?',
        () => {
            // Удаляем все настройки групп
            localStorage.removeItem(LINKED_SETTINGS_KEY);
            
            // Удаляем HTML
            container.innerHTML = '';
            showToast('info', 'Все группы удалены');
            console.log('[LinkedTriggers] Все группы очищены');
        },
        null
    );
}

/* ============================================
   ЭКСПОРТ В ПРОСТЫЕ ТРИГГЕРЫ
   ============================================ */

/**
 * Экспорт связанных триггеров в textarea простых триггеров
 */
function exportLinkedToSimple() {
    const permutations = generateLinkedPermutations();
    
    if (permutations.length === 0) {
        showToast('info', 'Нет связанных триггеров для экспорта');
        return;
    }
    
    // Получаем textarea простых триггеров
    const textarea = document.getElementById('simpleTriggers');
    
    if (!textarea) {
        console.error('[LinkedTriggers] Textarea simpleTriggers не найдена');
        return;
    }
    
    // Получаем текущие триггеры
    const currentTriggers = parseSimpleTriggers(textarea.value);
    
    // Объединяем
    const combined = [...currentTriggers, ...permutations];
    
    // Удаляем дубликаты
    const unique = [...new Set(combined)];
    
    // Записываем обратно
    textarea.value = unique.join('\n');
    
    // Показываем уведомление
    const addedCount = permutations.length;
    showToast('success', `Добавлено ${addedCount} ${pluralize(addedCount, ['перестановка', 'перестановки', 'перестановок'])}`);
    
    console.log(`[LinkedTriggers] Экспортировано ${addedCount} перестановок`);
}

/* ============================================
   ЭКСПОРТ ФУНКЦИЙ
   ============================================ */

// Делаем функции глобальными для onclick
window.addLinkedGroup = addLinkedGroup;
window.removeLinkedGroup = removeLinkedGroup;
window.addTriggerField = addTriggerField;
window.removeTriggerField = removeTriggerField;
window.clearLinkedGroup = clearLinkedGroup;
window.clearAllLinkedGroups = clearAllLinkedGroups;
window.openGroupSettingsModal = openGroupSettingsModal;
window.applyGroupSettings = applyGroupSettings;
window.resetGroupSettings = resetGroupSettings;
window.closeGroupSettingsModal = closeGroupSettingsModal;

console.log('✓ Модуль linked-triggers.js загружен (v2.0 - CRIT-1 исправлен, Type 3 реализован через distanceType)');
