/**
 * RegexHelper v4.0 - Features Linked Triggers
 * Связанные триггеры с 3 режимами (Individual, Common, Alternation)
 * @version 1.0
 * @date 12.02.2026
 */

import { applyOptimizations, applyType3 } from '../converter/optimizer.js';
import { escapeRegex } from '../core/utils.js';
import { addWordBoundaries } from '../converter/parser.js';
import { validateTriggers } from '../converter/validator.js';
import { showToast, showInlineError, clearInlineError } from '../core/errors.js';
import { generateId, pluralize } from '../core/utils.js';
import { openModal, closeModal } from '../ui/modals.js';
import { LINKEDTRIGGERSCONFIG } from '../core/config.js';

let linkedGroups = [];
let currentLinkMode = 'individual';
let groupSettings = new Map();

/**
 * Инициализирует linked triggers
 * @example
 * initLinkedTriggers();
 */
export function initLinkedTriggers() {
    linkedGroups = [];
    groupSettings = new Map();
    currentLinkMode = 'individual';
    
    const addGroupBtn = document.getElementById('addLinkedGroupBtn');
    if (addGroupBtn) {
        addGroupBtn.addEventListener('click', addLinkedGroup);
    }
    
    const modeSelect = document.getElementById('linkModeSelect');
    if (modeSelect) {
        modeSelect.addEventListener('change', (e) => setLinkMode(e.target.value));
    }
    
    updateGroupCounter();
}

/**
 * Добавляет новую группу
 * @returns {string} - ID созданной группы
 * @example
 * const groupId = addLinkedGroup(); // => 'group-1234567890'
 */
export function addLinkedGroup() {
    if (linkedGroups.length >= LINKEDTRIGGERSCONFIG.MAXGROUPS) {
        showToast('warning', `Максимум ${LINKEDTRIGGERSCONFIG.MAXGROUPS} групп`);
        return null;
    }
    
    const groupId = generateGroupId();
    const group = {
        id: groupId,
        subgroups: [],
        settings: getDefaultGroupSettings()
    };
    
    linkedGroups.push(group);
    groupSettings.set(groupId, group.settings);
    
    renderLinkedGroup(group);
    updateGroupCounter();
    
    return groupId;
}

/**
 * Удаляет группу
 * @param {string} groupId - ID группы
 * @example
 * removeGroup('group-123');
 */
export function removeGroup(groupId) {
    const index = linkedGroups.findIndex(g => g.id === groupId);
    
    if (index === -1) {
        return;
    }
    
    linkedGroups.splice(index, 1);
    groupSettings.delete(groupId);
    
    const groupEl = document.getElementById(groupId);
    if (groupEl) {
        groupEl.remove();
    }
    
    updateGroupCounter();
}

/**
 * Получает все группы
 * @returns {Array} - Массив групп
 * @example
 * const groups = getLinkedGroups();
 */
export function getLinkedGroups() {
    return linkedGroups.map(group => {
        const groupEl = document.getElementById(group.id);
        if (!groupEl) return null;
        
        const subgroups = Array.from(groupEl.querySelectorAll('.subgroup')).map(subEl => {
            const triggers = Array.from(subEl.querySelectorAll('.trigger-input'))
                .map(input => input.value.trim())
                .filter(v => v);
            
            return {
                id: subEl.id,
                triggers: triggers
            };
        }).filter(sg => sg.triggers.length > 0);
        
        return {
            id: group.id,
            subgroups: subgroups,
            settings: groupSettings.get(group.id) || getDefaultGroupSettings()
        };
    }).filter(g => g && g.subgroups.length > 0);
}

/**
 * Добавляет подгруппу в группу
 * @param {string} groupId - ID группы
 * @returns {string} - ID созданной подгруппы
 * @example
 * addSubgroup('group-123');
 */
export function addSubgroup(groupId) {
    const group = linkedGroups.find(g => g.id === groupId);
    
    if (!group) {
        return null;
    }
    
    const groupEl = document.getElementById(groupId);
    if (!groupEl) {
        return null;
    }
    
    const subgroupsContainer = groupEl.querySelector('.subgroups-container');
    const currentSubgroupCount = subgroupsContainer.querySelectorAll('.subgroup').length;
    
    if (currentSubgroupCount >= LINKEDTRIGGERSCONFIG.MAXSUBGROUPS) {
        showToast('warning', `Максимум ${LINKEDTRIGGERSCONFIG.MAXSUBGROUPS} подгрупп`);
        return null;
    }
    
    const subgroupId = generateSubgroupId(groupId);
    const subgroupData = {
        id: subgroupId,
        triggers: ['']
    };
    
    renderSubgroup(groupId, subgroupData);
    updateSubgroupCounter(groupId);
    
    return subgroupId;
}

/**
 * Удаляет подгруппу
 * @param {string} subgroupId - ID подгруппы
 * @example
 * removeSubgroup('subgroup-123');
 */
export function removeSubgroup(subgroupId) {
    const subgroupEl = document.getElementById(subgroupId);
    
    if (!subgroupEl) {
        return;
    }
    
    const groupEl = subgroupEl.closest('.linked-group');
    subgroupEl.remove();
    
    if (groupEl) {
        updateSubgroupCounter(groupEl.id);
    }
}

/**
 * Добавляет поле триггера в подгруппу
 * @param {string} subgroupId - ID подгруппы
 * @example
 * addTriggerField('subgroup-123');
 */
export function addTriggerField(subgroupId) {
    const subgroupEl = document.getElementById(subgroupId);
    
    if (!subgroupEl) {
        return;
    }
    
    const triggersContainer = subgroupEl.querySelector('.triggers-container');
    const currentTriggerCount = triggersContainer.querySelectorAll('.trigger-input').length;
    
    if (currentTriggerCount >= LINKEDTRIGGERSCONFIG.MAXTRIGGERSPERSUBGROUP) {
        showToast('warning', `Максимум ${LINKEDTRIGGERSCONFIG.MAXTRIGGERSPERSUBGROUP} триггеров в подгруппе`);
        return;
    }
    
    const triggerId = generateTriggerId(subgroupId);
    renderTriggerField(subgroupId, { id: triggerId, value: '' });
}

/**
 * Удаляет поле триггера
 * @param {string} triggerId - ID поля триггера
 * @example
 * removeTriggerField('trigger-123');
 */
export function removeTriggerField(triggerId) {
    const triggerEl = document.getElementById(triggerId);
    
    if (!triggerEl) {
        return;
    }
    
    triggerEl.remove();
}

/**
 * Получает текущий режим связывания
 * @returns {string} - 'individual', 'common' или 'alternation'
 * @example
 * const mode = getLinkMode(); // => 'individual'
 */
export function getLinkMode() {
    return currentLinkMode;
}

/**
 * Устанавливает режим связывания
 * @param {string} mode - 'individual', 'common' или 'alternation'
 * @example
 * setLinkMode('common');
 */
export function setLinkMode(mode) {
    const validModes = ['individual', 'common', 'alternation'];
    
    if (!validModes.includes(mode)) {
        console.warn(`setLinkMode: неверный режим "${mode}"`);
        return;
    }
    
    currentLinkMode = mode;
}

/**
 * Конвертирует группы в regex
 * @returns {string} - Результирующий regex
 * @example
 * const regex = convertLinkedGroups(); // => '(купить|приобрести).{1,7}(айфон|iphone)'
 */
export function convertLinkedGroups() {
    const groups = getLinkedGroups();
    
    if (groups.length === 0) {
        return '';
    }
    
    const validation = validateLinkedGroups();
    if (!validation.valid) {
        return '';
    }
    
    const mode = getLinkMode();
    
    switch (mode) {
        case 'individual':
            return convertIndividual(groups);
        case 'common':
            return convertCommon(groups);
        case 'alternation':
            return convertAlternation(groups);
        default:
            return '';
    }
}

/**
 * Устанавливает настройки группы
 * @param {string} groupId - ID группы
 * @param {Object} settings - Настройки
 * @example
 * setGroupSettings('group-123', { types: [1, 2], distance: { min: 3, max: 10 } });
 */
export function setGroupSettings(groupId, settings) {
    groupSettings.set(groupId, settings);
}

/**
 * Получает настройки группы
 * @param {string} groupId - ID группы
 * @returns {Object} - Настройки группы
 * @example
 * const settings = getGroupSettings('group-123');
 */
export function getGroupSettings(groupId) {
    return groupSettings.get(groupId) || getDefaultGroupSettings();
}

/**
 * Валидирует все группы
 * @returns {Object} - { valid: boolean, errors: Array, warnings: Array }
 * @example
 * const validation = validateLinkedGroups();
 */
export function validateLinkedGroups() {
    const groups = getLinkedGroups();
    const errors = [];
    const warnings = [];
    
    if (groups.length === 0) {
        errors.push('Нет ни одной группы с триггерами');
        return { valid: false, errors, warnings };
    }
    
    groups.forEach((group, idx) => {
        if (group.subgroups.length === 0) {
            errors.push(`Группа ${idx + 1}: нет подгрупп`);
        }
        
        group.subgroups.forEach((subgroup, subIdx) => {
            if (subgroup.triggers.length === 0) {
                errors.push(`Группа ${idx + 1}, подгруппа ${subIdx + 1}: нет триггеров`);
            }
        });
    });
    
    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Очищает все группы
 * @example
 * clearLinkedTriggers();
 */
export function clearLinkedTriggers() {
    linkedGroups = [];
    groupSettings.clear();
    
    const container = document.getElementById('linkedTriggersContainer');
    if (container) {
        container.innerHTML = '';
    }
    
    updateGroupCounter();
}

/**
 * Конвертирует группы в режиме Individual
 * @param {Array} groups - Массив групп
 * @returns {string} - Regex
 * @example
 * convertIndividual(groups); // => '(купить|приобрести).{1,7}(айфон|iphone)'
 */
export function convertIndividual(groups) {
    const regexParts = [];
    
    groups.forEach(group => {
        const settings = getGroupSettings(group.id);
        const distance = settings.distance || LINKEDTRIGGERSCONFIG.DEFAULTDISTANCE;
        
        const subgroupRegexes = group.subgroups.map(subgroup => {
            return buildSubgroupRegex(subgroup, settings);
        });
        
        const groupRegex = applyDistancePattern(subgroupRegexes, distance);
        regexParts.push(groupRegex);
    });
    
    return regexParts.join('|');
}

/**
 * Конвертирует группы в режиме Common
 * @param {Array} groups - Массив групп
 * @returns {string} - Regex
 * @example
 * convertCommon(groups); // => '(купить|приобрести|айфон|iphone).{1,7}(купить|приобрести|айфон|iphone)'
 */
export function convertCommon(groups) {
    const allTriggers = [];
    
    groups.forEach(group => {
        group.subgroups.forEach(subgroup => {
            allTriggers.push(...subgroup.triggers);
        });
    });
    
    const uniqueTriggers = [...new Set(allTriggers)];
    const escapedTriggers = uniqueTriggers.map(t => escapeRegex(t));
    
    if (groups.length > 0 && groups[0].subgroups.length > 1) {
        const settings = getGroupSettings(groups[0].id);
        const distance = settings.distance || LINKEDTRIGGERSCONFIG.DEFAULTDISTANCE;
        const part = `(${escapedTriggers.join('|')})`;
        return applyDistancePattern([part, part], distance);
    }
    
    return `(${escapedTriggers.join('|')})`;
}

/**
 * Конвертирует группы в режиме Alternation
 * @param {Array} groups - Массив групп
 * @returns {string} - Regex
 * @example
 * convertAlternation(groups); // => 'купить|приобрести|айфон|iphone'
 */
export function convertAlternation(groups) {
    const allTriggers = [];
    
    groups.forEach(group => {
        group.subgroups.forEach(subgroup => {
            allTriggers.push(...subgroup.triggers);
        });
    });
    
    const uniqueTriggers = [...new Set(allTriggers)];
    const escapedTriggers = uniqueTriggers.map(t => escapeRegex(t));
    
    return escapedTriggers.join('|');
}

/**
 * Строит regex для группы
 * @param {Object} group - Группа
 * @param {string} mode - Режим
 * @returns {string} - Regex
 * @example
 * buildGroupRegex(group, 'individual');
 */
export function buildGroupRegex(group, mode) {
    const settings = getGroupSettings(group.id);
    
    switch (mode) {
        case 'individual':
            return convertIndividual([group]);
        case 'common':
            return convertCommon([group]);
        case 'alternation':
            return convertAlternation([group]);
        default:
            return '';
    }
}

/**
 * Строит regex для подгруппы
 * @param {Object} subgroup - Подгруппа
 * @param {Object} settings - Настройки
 * @returns {string} - Regex
 * @example
 * buildSubgroupRegex(subgroup, settings);
 */
export function buildSubgroupRegex(subgroup, settings) {
    const types = settings.types || [];
    let triggers = [...subgroup.triggers];
    
    if (types.length > 0) {
        triggers = applyOptimizations(triggers, types);
        triggers = triggers.split('|');
    } else {
        triggers = triggers.map(t => escapeRegex(t));
    }
    
    return `(${triggers.join('|')})`;
}

/**
 * Применяет оптимизации к regex группы
 * @param {string} regex - Regex
 * @param {Array} types - Типы оптимизаций
 * @returns {string} - Оптимизированный regex
 * @example
 * applyGroupOptimizations(regex, [1, 2]);
 */
export function applyGroupOptimizations(regex, types) {
    return regex;
}

/**
 * Применяет паттерн расстояния между подгруппами
 * @param {Array} subgroups - Массив regex подгрупп
 * @param {Object} distance - { min, max }
 * @returns {string} - Regex с паттерном расстояния
 * @example
 * applyDistancePattern(['(купить|приобрести)', '(айфон|iphone)'], { min: 1, max: 7 });
 * // => '(купить|приобрести).{1,7}(айфон|iphone)'
 */
export function applyDistancePattern(subgroups, distance) {
    if (subgroups.length === 0) {
        return '';
    }
    
    if (subgroups.length === 1) {
        return subgroups[0];
    }
    
    const min = distance.min || 1;
    const max = distance.max || 7;
    
    return subgroups.join(`.{${min},${max}}`);
}

/**
 * Объединяет подгруппы
 * @param {Array} subgroups - Массив подгрупп
 * @returns {string} - Объединённый regex
 * @example
 * mergeSubgroups(subgroups);
 */
export function mergeSubgroups(subgroups) {
    const allTriggers = [];
    
    subgroups.forEach(sg => {
        allTriggers.push(...sg.triggers);
    });
    
    const uniqueTriggers = [...new Set(allTriggers)];
    const escapedTriggers = uniqueTriggers.map(t => escapeRegex(t));
    
    return `(${escapedTriggers.join('|')})`;
}

/**
 * Оптимизирует альтернации
 * @param {Array} alternatives - Массив альтернатив
 * @returns {string} - Оптимизированный regex
 * @example
 * optimizeAlternation(['test', 'testing', 'tester']);
 */
export function optimizeAlternation(alternatives) {
    return alternatives.join('|');
}

/**
 * Оборачивает regex в границы слов
 * @param {string} regex - Regex
 * @param {boolean} useBoundaries - Использовать границы
 * @returns {string} - Regex с границами
 * @example
 * wrapWithBoundaries('test', true); // => '\\btest\\b'
 */
export function wrapWithBoundaries(regex, useBoundaries) {
    if (!useBoundaries) {
        return regex;
    }
    
    return `\\b${regex}\\b`;
}

/**
 * Отрисовывает группу
 * @param {Object} groupData - Данные группы
 * @example
 * renderLinkedGroup(groupData);
 */
export function renderLinkedGroup(groupData) {
    const container = document.getElementById('linkedTriggersContainer');
    
    if (!container) {
        return;
    }
    
    const groupEl = document.createElement('div');
    groupEl.className = 'linked-group';
    groupEl.id = groupData.id;
    groupEl.innerHTML = `
        <div class="group-header">
            <h4>Группа ${linkedGroups.length}</h4>
            <button class="btn-icon" onclick="window.removeLinkedGroup('${groupData.id}')">×</button>
        </div>
        <div class="subgroups-container"></div>
        <button class="btn-secondary" onclick="window.addLinkedSubgroup('${groupData.id}')">+ Подгруппа</button>
    `;
    
    container.appendChild(groupEl);
    
    addSubgroup(groupData.id);
    addSubgroup(groupData.id);
}

/**
 * Отрисовывает подгруппу
 * @param {string} groupId - ID группы
 * @param {Object} subgroupData - Данные подгруппы
 * @example
 * renderSubgroup('group-123', subgroupData);
 */
export function renderSubgroup(groupId, subgroupData) {
    const groupEl = document.getElementById(groupId);
    
    if (!groupEl) {
        return;
    }
    
    const container = groupEl.querySelector('.subgroups-container');
    const subgroupEl = document.createElement('div');
    subgroupEl.className = 'subgroup';
    subgroupEl.id = subgroupData.id;
    
    const subgroupCount = container.querySelectorAll('.subgroup').length + 1;
    
    subgroupEl.innerHTML = `
        <div class="subgroup-header">
            <span>Подгруппа ${subgroupCount}</span>
            <button class="btn-icon" onclick="window.removeLinkedSubgroup('${subgroupData.id}')">×</button>
        </div>
        <div class="triggers-container"></div>
        <button class="btn-small" onclick="window.addLinkedTrigger('${subgroupData.id}')">+ Триггер</button>
    `;
    
    container.appendChild(subgroupEl);
    
    addTriggerField(subgroupData.id);
}

/**
 * Отрисовывает поле триггера
 * @param {string} subgroupId - ID подгруппы
 * @param {Object} fieldData - Данные поля
 * @example
 * renderTriggerField('subgroup-123', { id: 'trigger-456', value: '' });
 */
export function renderTriggerField(subgroupId, fieldData) {
    const subgroupEl = document.getElementById(subgroupId);
    
    if (!subgroupEl) {
        return;
    }
    
    const container = subgroupEl.querySelector('.triggers-container');
    const fieldEl = document.createElement('div');
    fieldEl.className = 'trigger-field';
    fieldEl.id = fieldData.id;
    fieldEl.innerHTML = `
        <input type="text" class="trigger-input" placeholder="Триггер" value="${fieldData.value || ''}">
        <button class="btn-icon" onclick="window.removeLinkedTrigger('${fieldData.id}')">×</button>
    `;
    
    container.appendChild(fieldEl);
}

/**
 * Обновляет счётчик групп
 * @example
 * updateGroupCounter();
 */
export function updateGroupCounter() {
    const counter = document.getElementById('linkedGroupCount');
    
    if (!counter) {
        return;
    }
    
    counter.textContent = `${linkedGroups.length} ${pluralize(linkedGroups.length, ['группа', 'группы', 'групп'])}`;
}

/**
 * Обновляет счётчик подгрупп
 * @param {string} groupId - ID группы
 * @example
 * updateSubgroupCounter('group-123');
 */
export function updateSubgroupCounter(groupId) {
    const groupEl = document.getElementById(groupId);
    
    if (!groupEl) {
        return;
    }
    
    const subgroupCount = groupEl.querySelectorAll('.subgroup').length;
    const header = groupEl.querySelector('.group-header h4');
    
    if (header) {
        header.textContent = `Группа (${subgroupCount} ${pluralize(subgroupCount, ['подгруппа', 'подгруппы', 'подгрупп'])})`;
    }
}

/**
 * Переключает настройки группы
 * @param {string} groupId - ID группы
 * @example
 * toggleGroupSettings('group-123');
 */
export function toggleGroupSettings(groupId) {
    const settingsEl = document.getElementById(`${groupId}-settings`);
    
    if (!settingsEl) {
        return;
    }
    
    settingsEl.classList.toggle('hidden');
}

/**
 * Открывает модальное окно настроек группы
 * @param {string} groupId - ID группы
 * @example
 * openGroupSettingsModal('group-123');
 */
export function openGroupSettingsModal(groupId) {
    openModal('groupSettingsModal');
}

/**
 * Подсвечивает невалидные поля
 * @example
 * highlightInvalidFields();
 */
export function highlightInvalidFields() {
    const inputs = document.querySelectorAll('.trigger-input');
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('invalid');
        } else {
            input.classList.remove('invalid');
        }
    });
}

/**
 * Показывает превью regex группы
 * @param {string} groupId - ID группы
 * @example
 * showGroupPreview('group-123');
 */
export function showGroupPreview(groupId) {
    const group = linkedGroups.find(g => g.id === groupId);
    
    if (!group) {
        return;
    }
    
    const regex = buildGroupRegex(group, getLinkMode());
    showToast('info', `Regex группы: ${regex}`);
}

/**
 * Сворачивает/разворачивает группу
 * @param {string} groupId - ID группы
 * @example
 * collapseExpandGroup('group-123');
 */
export function collapseExpandGroup(groupId) {
    const groupEl = document.getElementById(groupId);
    
    if (!groupEl) {
        return;
    }
    
    groupEl.classList.toggle('collapsed');
}

/**
 * Генерирует ID группы
 * @returns {string} - ID
 * @example
 * const id = generateGroupId(); // => 'group-1234567890'
 */
export function generateGroupId() {
    return `group-${Date.now()}`;
}

/**
 * Генерирует ID подгруппы
 * @param {string} groupId - ID группы
 * @returns {string} - ID
 * @example
 * const id = generateSubgroupId('group-123'); // => 'subgroup-1234567890'
 */
export function generateSubgroupId(groupId) {
    return `subgroup-${Date.now()}`;
}

/**
 * Генерирует ID триггера
 * @param {string} subgroupId - ID подгруппы
 * @returns {string} - ID
 * @example
 * const id = generateTriggerId('subgroup-123'); // => 'trigger-1234567890'
 */
export function generateTriggerId(subgroupId) {
    return `trigger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Парсит ввод расстояния (min,max)
 * @param {string} input - Ввод вида "1,7"
 * @returns {Object} - { min, max }
 * @example
 * parseDistanceInput('1,7'); // => { min: 1, max: 7 }
 */
export function parseDistanceInput(input) {
    const parts = input.split(',').map(p => parseInt(p.trim()));
    
    if (parts.length !== 2 || parts.some(isNaN)) {
        return LINKEDTRIGGERSCONFIG.DEFAULTDISTANCE;
    }
    
    return {
        min: parts[0],
        max: parts[1]
    };
}

/**
 * Получает настройки группы по умолчанию
 * @returns {Object} - Настройки
 * @example
 * const settings = getDefaultGroupSettings();
 */
export function getDefaultGroupSettings() {
    return {
        types: [],
        distance: LINKEDTRIGGERSCONFIG.DEFAULTDISTANCE,
        useBoundaries: false
    };
}

if (typeof window !== 'undefined') {
    window.removeLinkedGroup = removeGroup;
    window.addLinkedSubgroup = addSubgroup;
    window.removeLinkedSubgroup = removeSubgroup;
    window.addLinkedTrigger = addTriggerField;
    window.removeLinkedTrigger = removeTriggerField;
}
