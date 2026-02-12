/**
 * RegexHelper v4.0 - Linked Triggers Converter
 * 
 * Модуль для обработки связанных триггеров (групп и подгрупп).
 * Поддерживает 3 режима связи: Individual, Common, Alternation.
 * Генерирует HTML-шаблоны для динамического создания групп/подгрупп.
 * 
 * @version 1.0
 * @date 12.02.2026
 */

import { generateId, pluralize, escapeHTML } from '../core/utils.js';
import { validateGroupCount, validateSubgroupCount, validateDistance, validateConnectionMode } from '../core/validator.js';
import { showToast, showInlineError, clearInlineError } from '../core/errors.js';
import { LINKEDTRIGGERSCONFIG } from '../core/config.js';
import { parseSimpleTriggers } from '../core/parser.js';
import { buildIndividualMode, buildCommonMode, buildAlternationMode } from './regexBuilder.js';

// TODO: Раскомментировать после создания этих модулей
// import { openModal, closeModal } from '../features/modals.js';
// import { initDragDrop, makeDraggable } from '../features/dragDrop.js';

/**
 * Глобальное состояние связанных триггеров
 */
let linkedTriggersState = {
  groups: [],
  connectionMode: 'individual', // 'individual', 'common', 'alternation'
  commonDistance: { min: 1, max: 7 }
};

/**
 * Инициализирует модуль связанных триггеров
 * @returns {void}
 * @example
 * initLinkedTriggers(); // вызывается в main.js
 */
export function initLinkedTriggers() {
  // Устанавливаем начальное состояние
  linkedTriggersState = {
    groups: [],
    connectionMode: 'individual',
    commonDistance: { min: 1, max: 7 }
  };

  // Обработчик кнопки "Добавить группу"
  const addGroupBtn = document.getElementById('btnAddGroup');
  if (addGroupBtn) {
    addGroupBtn.addEventListener('click', handleAddGroup);
  }

  // Обработчики режимов связи
  const modeRadios = document.querySelectorAll('input[name="connectionMode"]');
  modeRadios.forEach(radio => {
    radio.addEventListener('change', handleConnectionModeChange);
  });

  // Обработчик dropdown для Common режима
  const commonDistanceSelect = document.getElementById('commonDistance');
  if (commonDistanceSelect) {
    commonDistanceSelect.addEventListener('change', handleCommonDistanceChange);
  }

  console.log('[LinkedTriggers] Initialized');
}

/**
 * Добавляет новую группу
 * @returns {string|null} - ID созданной группы или null при ошибке
 * @example
 * const groupId = addLinkedGroup(); // 'group-1707764400000-abc123'
 */
export function addLinkedGroup() {
  // Проверка лимита групп
  if (linkedTriggersState.groups.length >= LINKEDTRIGGERSCONFIG.MAXGROUPS) {
    showToast('error', `Превышен лимит в ${LINKEDTRIGGERSCONFIG.MAXGROUPS} групп`);
    return null;
  }

  const groupId = generateId('group');
  const groupNumber = linkedTriggersState.groups.length + 1;

  const group = {
    id: groupId,
    number: groupNumber,
    subgroups: [],
    distance: { ...LINKEDTRIGGERSCONFIG.DEFAULTDISTANCE }
  };

  linkedTriggersState.groups.push(group);

  // Рендерим HTML
  renderGroup(group);

  // Добавляем первую подгруппу автоматически
  addSubgroup(groupId);

  return groupId;
}

/**
 * Удаляет группу по ID
 * @param {string} groupId - ID группы
 * @returns {boolean} - true при успехе
 * @example
 * removeGroup('group-123');
 */
export function removeGroup(groupId) {
  const index = linkedTriggersState.groups.findIndex(g => g.id === groupId);
  if (index === -1) return false;

  // Удаляем из состояния
  linkedTriggersState.groups.splice(index, 1);

  // Удаляем из DOM
  const groupElement = document.querySelector(`[data-group-id="${groupId}"]`);
  if (groupElement) {
    groupElement.remove();
  }

  // Обновляем нумерацию
  updateGroupNumbers();

  showToast('success', 'Группа удалена');
  return true;
}

/**
 * Добавляет подгруппу в группу
 * @param {string} groupId - ID группы
 * @returns {string|null} - ID созданной подгруппы или null при ошибке
 * @example
 * const subgroupId = addSubgroup('group-123'); // 'subgroup-1707764400000-xyz789'
 */
export function addSubgroup(groupId) {
  const group = linkedTriggersState.groups.find(g => g.id === groupId);
  if (!group) return null;

  // Проверка лимита подгрупп
  if (group.subgroups.length >= LINKEDTRIGGERSCONFIG.MAXSUBGROUPS) {
    showToast('error', `Превышен лимит в ${LINKEDTRIGGERSCONFIG.MAXSUBGROUPS} подгрупп`);
    return null;
  }

  const subgroupId = generateId('subgroup');
  const subgroupNumber = group.subgroups.length + 1;

  const subgroup = {
    id: subgroupId,
    number: subgroupNumber,
    triggers: [],
    distance: null // null = использовать distance группы
  };

  group.subgroups.push(subgroup);

  // Рендерим HTML
  renderSubgroup(groupId, subgroup);

  return subgroupId;
}

/**
 * Удаляет подгруппу по ID
 * @param {string} groupId - ID группы
 * @param {string} subgroupId - ID подгруппы
 * @returns {boolean} - true при успехе
 * @example
 * removeSubgroup('group-123', 'subgroup-456');
 */
export function removeSubgroup(groupId, subgroupId) {
  const group = linkedTriggersState.groups.find(g => g.id === groupId);
  if (!group) return false;

  const index = group.subgroups.findIndex(s => s.id === subgroupId);
  if (index === -1) return false;

  // Нельзя удалить последнюю подгруппу
  if (group.subgroups.length === 1) {
    showToast('warning', 'Нельзя удалить последнюю подгруппу');
    return false;
  }

  // Удаляем из состояния
  group.subgroups.splice(index, 1);

  // Удаляем из DOM
  const subgroupElement = document.querySelector(`[data-subgroup-id="${subgroupId}"]`);
  if (subgroupElement) {
    subgroupElement.remove();
  }

  // Обновляем нумерацию
  updateSubgroupNumbers(groupId);

  showToast('success', 'Подгруппа удалена');
  return true;
}

/**
 * Устанавливает режим связи триггеров
 * @param {string} mode - Режим: 'individual', 'common', 'alternation'
 * @returns {void}
 * @example
 * setConnectionMode('common');
 */
export function setConnectionMode(mode) {
  if (!validateConnectionMode(mode)) {
    console.warn('Invalid connection mode:', mode);
    return;
  }

  linkedTriggersState.connectionMode = mode;

  // Обновляем UI
  updateConnectionModeUI();
}

/**
 * Возвращает текущий режим связи
 * @returns {string} - Режим связи
 * @example
 * const mode = getConnectionMode(); // 'individual'
 */
export function getConnectionMode() {
  return linkedTriggersState.connectionMode;
}

/**
 * Устанавливает общее расстояние для режима Common
 * @param {Object} distance - Объект с min и max
 * @returns {void}
 * @example
 * setCommonDistance({ min: 1, max: 10 });
 */
export function setCommonDistance(distance) {
  if (!validateDistance(distance)) {
    console.warn('Invalid distance:', distance);
    return;
  }

  linkedTriggersState.commonDistance = distance;
}

/**
 * Возвращает общее расстояние для режима Common
 * @returns {Object} - Объект с min и max
 * @example
 * const distance = getCommonDistance(); // { min: 1, max: 7 }
 */
export function getCommonDistance() {
  return linkedTriggersState.commonDistance;
}

/**
 * Устанавливает расстояние для конкретной группы
 * @param {string} groupId - ID группы
 * @param {Object} distance - Объект с min и max
 * @returns {void}
 * @example
 * setGroupDistance('group-123', { min: 3, max: 15 });
 */
export function setGroupDistance(groupId, distance) {
  const group = linkedTriggersState.groups.find(g => g.id === groupId);
  if (!group) return;

  if (!validateDistance(distance)) {
    console.warn('Invalid distance:', distance);
    return;
  }

  group.distance = distance;
}

/**
 * Обновляет триггеры в подгруппе из textarea
 * @param {string} groupId - ID группы
 * @param {string} subgroupId - ID подгруппы
 * @param {string} text - Текст из textarea
 * @returns {void}
 * @example
 * updateSubgroupTriggers('group-123', 'subgroup-456', 'привет\nмир');
 */
export function updateSubgroupTriggers(groupId, subgroupId, text) {
  const group = linkedTriggersState.groups.find(g => g.id === groupId);
  if (!group) return;

  const subgroup = group.subgroups.find(s => s.id === subgroupId);
  if (!subgroup) return;

  // Парсим триггеры
  const triggers = parseSimpleTriggers(text);
  subgroup.triggers = triggers;

  // Обновляем счетчик
  updateSubgroupCounter(subgroupId, triggers.length);
}

/**
 * Конвертирует связанные триггеры в regex
 * @returns {string} - Итоговый regex
 * @example
 * const regex = convertLinkedTriggersToRegex(); // 'hello.{1,7}world|test'
 */
export function convertLinkedTriggersToRegex() {
  if (linkedTriggersState.groups.length === 0) return '';

  const mode = linkedTriggersState.connectionMode;

  // Фильтруем группы с пустыми подгруппами
  const validGroups = linkedTriggersState.groups.map(group => {
    return {
      ...group,
      subgroups: group.subgroups.filter(s => s.triggers.length > 0)
    };
  }).filter(group => group.subgroups.length > 0);

  if (validGroups.length === 0) return '';

  // Строим regex в зависимости от режима
  switch (mode) {
    case 'individual':
      const individualPatterns = buildIndividualMode(validGroups);
      return individualPatterns.join('|');

    case 'common':
      return buildCommonMode(validGroups, linkedTriggersState.commonDistance);

    case 'alternation':
      return buildAlternationMode(validGroups);

    default:
      return '';
  }
}

/**
 * Возвращает все группы
 * @returns {Array} - Массив групп
 * @example
 * const groups = getAllGroups();
 */
export function getAllGroups() {
  return linkedTriggersState.groups;
}

/**
 * Очищает все группы
 * @returns {void}
 * @example
 * clearAllGroups();
 */
export function clearAllGroups() {
  linkedTriggersState.groups = [];

  // Очищаем DOM
  const container = document.getElementById('linkedGroupsContainer');
  if (container) {
    container.innerHTML = '';
  }
}

/**
 * Проверяет, есть ли хотя бы одна группа с триггерами
 * @returns {boolean} - true, если есть триггеры
 * @example
 * if (hasLinkedTriggers()) { convert(); }
 */
export function hasLinkedTriggers() {
  return linkedTriggersState.groups.some(group => 
    group.subgroups.some(subgroup => subgroup.triggers.length > 0)
  );
}

/**
 * Экспортирует состояние связанных триггеров
 * @returns {Object} - Состояние для экспорта
 * @example
 * const exported = exportLinkedTriggersState();
 */
export function exportLinkedTriggersState() {
  return JSON.parse(JSON.stringify(linkedTriggersState));
}

/**
 * Импортирует состояние связанных триггеров
 * @param {Object} state - Состояние для импорта
 * @returns {void}
 * @example
 * importLinkedTriggersState(savedState);
 */
export function importLinkedTriggersState(state) {
  if (!state || typeof state !== 'object') return;

  linkedTriggersState = JSON.parse(JSON.stringify(state));

  // Перерендериваем UI
  renderAllGroups();
}

// ============================================================================
// HTML RENDERING
// ============================================================================

/**
 * Рендерит группу в DOM
 * @param {Object} group - Объект группы
 * @returns {void}
 * @private
 */
function renderGroup(group) {
  const container = document.getElementById('linkedGroupsContainer');
  if (!container) return;

  const groupHTML = createGroupHTML(group);
  container.insertAdjacentHTML('beforeend', groupHTML);

  // Добавляем обработчики событий
  attachGroupEventListeners(group.id);
}

/**
 * Создает HTML для группы
 * @param {Object} group - Объект группы
 * @returns {string} - HTML-строка
 * @private
 */
function createGroupHTML(group) {
  return `
    <div class="linked-group" data-group-id="${group.id}">
      <div class="linked-group-header">
        <span class="drag-handle" title="Перетащить">≡</span>
        <h4 class="linked-group-title">Группа ${group.number}</h4>
        <div class="group-actions">
          <button class="btn-icon btn-add-subgroup" data-action="add-subgroup" title="Добавить подгруппу">+</button>
          <button class="btn-icon btn-icon-danger" data-action="remove-group" title="Удалить группу">×</button>
        </div>
      </div>
      <div class="linked-group-body">
        <div class="subgroups-container" data-group-id="${group.id}"></div>
        
        ${linkedTriggersState.connectionMode === 'individual' ? `
          <div class="group-distance">
            <label>Расстояние:</label>
            <select class="distance-dropdown" data-group-id="${group.id}">
              <option value="1,7" ${group.distance.min === 1 && group.distance.max === 7 ? 'selected' : ''}>До 7 слов (.{1,7})</option>
              <option value="1,10" ${group.distance.min === 1 && group.distance.max === 10 ? 'selected' : ''}>До 10 слов (.{1,10})</option>
              <option value="0,30" ${group.distance.min === 0 && group.distance.max === 30 ? 'selected' : ''}>До 30 слов (.{0,30})</option>
              <option value="0,Infinity">Любое расстояние (.*)</option>
              <option value="0,0">Без пробелов (.)</option>
              <option value="custom">Свое значение...</option>
            </select>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Рендерит подгруппу в DOM
 * @param {string} groupId - ID группы
 * @param {Object} subgroup - Объект подгруппы
 * @returns {void}
 * @private
 */
function renderSubgroup(groupId, subgroup) {
  const container = document.querySelector(`[data-group-id="${groupId}"] .subgroups-container`);
  if (!container) return;

  const subgroupHTML = createSubgroupHTML(groupId, subgroup);
  container.insertAdjacentHTML('beforeend', subgroupHTML);

  // Добавляем обработчики событий
  attachSubgroupEventListeners(groupId, subgroup.id);
}

/**
 * Создает HTML для подгруппы
 * @param {string} groupId - ID группы
 * @param {Object} subgroup - Объект подгруппы
 * @returns {string} - HTML-строка
 * @private
 */
function createSubgroupHTML(groupId, subgroup) {
  return `
    <div class="linked-subgroup" data-subgroup-id="${subgroup.id}">
      <div class="linked-subgroup-header">
        <span class="drag-handle" title="Перетащить">≡</span>
        <h5 class="linked-subgroup-title">Подгруппа ${subgroup.number}</h5>
        <span class="subgroup-counter" data-subgroup-id="${subgroup.id}">0 триггеров</span>
        <div class="subgroup-actions">
          <button class="btn-icon btn-icon-danger" data-action="remove-subgroup" title="Удалить подгруппу">×</button>
        </div>
      </div>
      <div class="linked-subgroup-body">
        <textarea 
          class="triggers-input" 
          data-group-id="${groupId}"
          data-subgroup-id="${subgroup.id}"
          placeholder="Введите триггеры (каждый с новой строки)"
          rows="4"
        ></textarea>
      </div>
    </div>
  `;
}

/**
 * Перерендеривает все группы
 * @returns {void}
 * @private
 */
function renderAllGroups() {
  const container = document.getElementById('linkedGroupsContainer');
  if (!container) return;

  container.innerHTML = '';

  linkedTriggersState.groups.forEach(group => {
    renderGroup(group);
    group.subgroups.forEach(subgroup => {
      renderSubgroup(group.id, subgroup);
      
      // Восстанавливаем триггеры в textarea
      const textarea = document.querySelector(`[data-subgroup-id="${subgroup.id}"] .triggers-input`);
      if (textarea && subgroup.triggers.length > 0) {
        textarea.value = subgroup.triggers.join('\n');
        updateSubgroupCounter(subgroup.id, subgroup.triggers.length);
      }
    });
  });
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Обработчик кнопки "Добавить группу"
 * @returns {void}
 * @private
 */
function handleAddGroup() {
  addLinkedGroup();
}

/**
 * Обработчик изменения режима связи
 * @param {Event} event - Event объект
 * @returns {void}
 * @private
 */
function handleConnectionModeChange(event) {
  const mode = event.target.value;
  setConnectionMode(mode);
}

/**
 * Обработчик изменения общего расстояния (режим Common)
 * @param {Event} event - Event объект
 * @returns {void}
 * @private
 */
function handleCommonDistanceChange(event) {
  const value = event.target.value;
  const [min, max] = value.split(',').map(Number);
  setCommonDistance({ min, max });
}

/**
 * Добавляет обработчики событий для группы
 * @param {string} groupId - ID группы
 * @returns {void}
 * @private
 */
function attachGroupEventListeners(groupId) {
  const groupElement = document.querySelector(`[data-group-id="${groupId}"]`);
  if (!groupElement) return;

  // Кнопка "Добавить подгруппу"
  const addSubgroupBtn = groupElement.querySelector('[data-action="add-subgroup"]');
  if (addSubgroupBtn) {
    addSubgroupBtn.addEventListener('click', () => addSubgroup(groupId));
  }

  // Кнопка "Удалить группу"
  const removeGroupBtn = groupElement.querySelector('[data-action="remove-group"]');
  if (removeGroupBtn) {
    removeGroupBtn.addEventListener('click', () => {
      // TODO: Добавить confirm через modals.js
      removeGroup(groupId);
    });
  }

  // Dropdown расстояния
  const distanceSelect = groupElement.querySelector('.distance-dropdown');
  if (distanceSelect) {
    distanceSelect.addEventListener('change', (e) => {
      const value = e.target.value;
      if (value === 'custom') {
        // TODO: Открыть модальное окно для ввода custom distance
        return;
      }
      const [min, max] = value.split(',').map(v => v === 'Infinity' ? Infinity : Number(v));
      setGroupDistance(groupId, { min, max });
    });
  }
}

/**
 * Добавляет обработчики событий для подгруппы
 * @param {string} groupId - ID группы
 * @param {string} subgroupId - ID подгруппы
 * @returns {void}
 * @private
 */
function attachSubgroupEventListeners(groupId, subgroupId) {
  const subgroupElement = document.querySelector(`[data-subgroup-id="${subgroupId}"]`);
  if (!subgroupElement) return;

  // Кнопка "Удалить подгруппу"
  const removeBtn = subgroupElement.querySelector('[data-action="remove-subgroup"]');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      removeSubgroup(groupId, subgroupId);
    });
  }

  // Textarea
  const textarea = subgroupElement.querySelector('.triggers-input');
  if (textarea) {
    let debounceTimer;
    textarea.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        updateSubgroupTriggers(groupId, subgroupId, textarea.value);
      }, 300);
    });
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Обновляет нумерацию групп
 * @returns {void}
 * @private
 */
function updateGroupNumbers() {
  linkedTriggersState.groups.forEach((group, index) => {
    group.number = index + 1;
    const titleElement = document.querySelector(`[data-group-id="${group.id}"] .linked-group-title`);
    if (titleElement) {
      titleElement.textContent = `Группа ${group.number}`;
    }
  });
}

/**
 * Обновляет нумерацию подгрупп в группе
 * @param {string} groupId - ID группы
 * @returns {void}
 * @private
 */
function updateSubgroupNumbers(groupId) {
  const group = linkedTriggersState.groups.find(g => g.id === groupId);
  if (!group) return;

  group.subgroups.forEach((subgroup, index) => {
    subgroup.number = index + 1;
    const titleElement = document.querySelector(`[data-subgroup-id="${subgroup.id}"] .linked-subgroup-title`);
    if (titleElement) {
      titleElement.textContent = `Подгруппа ${subgroup.number}`;
    }
  });
}

/**
 * Обновляет счетчик триггеров в подгруппе
 * @param {string} subgroupId - ID подгруппы
 * @param {number} count - Количество триггеров
 * @returns {void}
 * @private
 */
function updateSubgroupCounter(subgroupId, count) {
  const counter = document.querySelector(`[data-subgroup-id="${subgroupId}"] .subgroup-counter`);
  if (!counter) return;

  counter.textContent = `${count} ${pluralize(count, ['триггер', 'триггера', 'триггеров'])}`;
}

/**
 * Обновляет UI при смене режима связи
 * @returns {void}
 * @private
 */
function updateConnectionModeUI() {
  const mode = linkedTriggersState.connectionMode;

  // Показываем/скрываем dropdown Common Distance
  const commonDistanceContainer = document.querySelector('.common-param-selector');
  if (commonDistanceContainer) {
    commonDistanceContainer.style.display = mode === 'common' ? 'block' : 'none';
  }

  // Показываем/скрываем dropdown для каждой группы (Individual mode)
  const groupDistanceContainers = document.querySelectorAll('.group-distance');
  groupDistanceContainers.forEach(container => {
    container.style.display = mode === 'individual' ? 'block' : 'none';
  });
}
