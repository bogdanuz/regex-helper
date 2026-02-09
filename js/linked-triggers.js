/* ============================================
   REGEXHELPER - LINKED TRIGGERS
   Управление связанными триггерами (перестановки)
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
    
    // Создаём HTML группы
    const groupDiv = document.createElement('div');
    groupDiv.className = 'linked-group';
    groupDiv.id = groupId;
    groupDiv.innerHTML = `
    <div class="linked-group-header">
        <span class="linked-group-title">Группа ${currentGroups + 1}</span>
        <div class="group-actions">
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
    
    console.log(`[LinkedTriggers] Группа ${groupId} создана`);
}

/* ============================================
   УДАЛЕНИЕ ГРУППЫ
   ============================================ */

// ============================================
// ИСПРАВЛЕНО: Строка ~136
// ============================================

// Кнопка удаления группы
removeBtn.addEventListener('click', () => {
    // БЫЛО: confirmAction('Удалить эту группу...', () => {...});
    // СТАЛО: 4 параметра
    confirmAction(
        'Подтверждение',
        'Удалить эту группу связанных триггеров?',
        () => {
            container.removeChild(group);
            updateLinkedGroupsVisibility();
        },
        null
    );
});

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
   ПОЛУЧЕНИЕ ДАННЫХ
   ============================================ */

/**
 * Получить все группы связанных триггеров
 * @returns {Array} - Массив групп [{id: string, triggers: [string]}]
 */
function getLinkedGroups() {
    const container = document.getElementById('linkedTriggersContainer');
    
    if (!container) {
        return [];
    }
    
    const groups = [];
    const groupElements = container.querySelectorAll('.linked-group');
    
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
            groups.push({
                id: groupId,
                triggers: triggers
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
        
        // Проверка: количество перестановок
        const permutationCount = factorial(group.triggers.length);
        if (permutationCount > LINKED_LIMITS.PERMUTATION_WARNING) {
            result.warnings.push(
                `Группа ${index + 1}: будет создано ${permutationCount} перестановок. Это может замедлить работу.`
            );
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

// ============================================
// ИСПРАВЛЕНО: Строка ~399
// ============================================

/**
 * Очистить все связанные группы
 */
function clearAllLinkedGroups() {
    // БЫЛО: confirmAction('Очистить все группы...', () => {...});
    // СТАЛО: 4 параметра
    confirmAction(
        'Подтверждение',
        'Очистить все группы связанных триггеров?',
        () => {
            const container = document.getElementById('linkedTriggersContainer');
            if (container) {
                container.innerHTML = '';
                updateLinkedGroupsVisibility();
            }
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
        'Очистить все поля в этой группе?',
        () => {
            inputs.forEach(input => {
                input.value = '';
            });
            showToast('info', 'Поля группы очищены');
            console.log(`[LinkedTriggers] Группа ${groupId} очищена`);
        }
    );
}

// Делаем функцию глобальной
window.clearLinkedGroup = clearLinkedGroup;

// Экспортируем функции для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Константы
        LINKED_LIMITS,
        
        // Инициализация
        initLinkedTriggers,
        
        // Управление группами
        addLinkedGroup,
        removeLinkedGroup,
        
        // Управление полями
        addTriggerField,
        removeTriggerField,
        
        // Получение данных
        getLinkedGroups,
        hasLinkedTriggers,
        
        // Валидация
        validateLinkedGroups,
        
        // Перестановки
        generateLinkedPermutations,
        countLinkedPermutations,
        
        // Очистка
        clearAllLinkedGroups,
        
        // Экспорт
        exportLinkedToSimple
    };
}

// Делаем функции глобальными для onclick
window.addLinkedGroup = addLinkedGroup;
window.removeLinkedGroup = removeLinkedGroup;
window.addTriggerField = addTriggerField;
window.removeTriggerField = removeTriggerField;

