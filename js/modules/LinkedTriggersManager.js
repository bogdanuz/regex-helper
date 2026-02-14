/**
 * ═══════════════════════════════════════════════════════════════════
 * REGEXHELPER v4.0 - LinkedTriggersManager.js
 * Управление группами, подгруппами и триггерами (CRUD операции)
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * @class LinkedTriggersManager
 * @description Управляет структурой связанных триггеров
 * 
 * Структура данных:
 * groups = [
 *   {
 *     id: 'group-1',
 *     name: 'Группа 1',
 *     params: { latinCyrillic: false, declensions: false, commonRoot: false },
 *     subgroups: [
 *       {
 *         id: 'subgroup-1-1',
 *         name: 'Подгруппа 1.1',
 *         params: { ... },
 *         triggers: ['триггер1', 'триггер2'],
 *         distanceToNext: null // или '.{1,10}'
 *       }
 *     ],
 *     distanceToNextGroup: null
 *   }
 * ]
 */
export class LinkedTriggersManager {
    constructor() {
        this.groups = [];
        this.MAX_GROUPS = 15;
        this.MAX_SUBGROUPS = 15;
        this.MAX_TRIGGERS = 100;

        // DOM элементы
        this.container = document.querySelector('.groups-container');
        this.addGroupBtn = document.querySelector('.btn-add-group');

        // Счётчики для ID
        this.groupIdCounter = 0;
        this.subgroupIdCounter = 0;

        this.init();
    }

    /**
     * Инициализация менеджера
     */
    init() {
        if (!this.container) {
            console.warn('LinkedTriggersManager: .groups-container не найден');
            return;
        }

        // Bind событий
        this.addGroupBtn?.addEventListener('click', () => this.addGroup());

        // Делегирование событий для динамических элементов
        this.container.addEventListener('click', (e) => this.handleClick(e));
        this.container.addEventListener('input', (e) => this.handleInput(e));
    }

    // ═══════════════════════════════════════════════════════════════
    // ГРУППЫ (CRUD)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Добавить группу
     * @returns {Object|null} Созданная группа или null
     */
    addGroup() {
        // Проверка лимита
        if (this.groups.length >= this.MAX_GROUPS) {
            this.showError(`Максимум ${this.MAX_GROUPS} групп`);
            return null;
        }

        this.groupIdCounter++;
        const groupNumber = this.groups.length + 1;

        const group = {
            id: `group-${this.groupIdCounter}`,
            name: `Группа ${groupNumber}`,
            params: {
                latinCyrillic: false,
                declensions: false,
                commonRoot: false,
                optionalChars: false,
                prefix: false
            },
            subgroups: [],
            distanceToNextGroup: null
        };

        this.groups.push(group);
        this.renderGroup(group);

        return group;
    }

    /**
     * Удалить группу
     * @param {string} groupId - ID группы
     */
    deleteGroup(groupId) {
        const index = this.groups.findIndex(g => g.id === groupId);
        if (index === -1) return;

        // Подтверждение удаления
        if (!confirm('Удалить группу и все её подгруппы?')) return;

        this.groups.splice(index, 1);

        // Удалить из DOM
        const groupElement = document.querySelector(`[data-group-id="${groupId}"]`);
        if (groupElement) {
            groupElement.remove();
        }

        // Перенумеровать оставшиеся группы
        this.renumberGroups();
    }

    /**
     * Получить группу по ID
     * @param {string} groupId - ID группы
     * @returns {Object|null}
     */
    getGroup(groupId) {
        return this.groups.find(g => g.id === groupId) || null;
    }

    /**
     * Перенумеровать группы после удаления
     */
    renumberGroups() {
        this.groups.forEach((group, index) => {
            group.name = `Группа ${index + 1}`;
            const groupElement = document.querySelector(`[data-group-id="${group.id}"]`);
            if (groupElement) {
                const titleElement = groupElement.querySelector('.group-title');
                if (titleElement) {
                    titleElement.textContent = group.name;
                }
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // ПОДГРУППЫ (CRUD)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Добавить подгруппу в группу
     * @param {string} groupId - ID группы
     * @returns {Object|null} Созданная подгруппа или null
     */
    addSubgroup(groupId) {
        const group = this.getGroup(groupId);
        if (!group) return null;

        // Проверка лимита
        if (group.subgroups.length >= this.MAX_SUBGROUPS) {
            this.showError(`Максимум ${this.MAX_SUBGROUPS} подгрупп в группе`);
            return null;
        }

        this.subgroupIdCounter++;
        const groupNumber = this.groups.indexOf(group) + 1;
        const subgroupNumber = group.subgroups.length + 1;

        const subgroup = {
            id: `subgroup-${groupNumber}-${this.subgroupIdCounter}`,
            name: `Подгруппа ${groupNumber}.${subgroupNumber}`,
            params: {
                latinCyrillic: false,
                declensions: false,
                commonRoot: false,
                optionalChars: false,
                prefix: false
            },
            triggers: [],
            distanceToNext: null // Distance до следующей подгруппы
        };

        group.subgroups.push(subgroup);
        this.renderSubgroup(groupId, subgroup);

        return subgroup;
    }

    /**
     * Удалить подгруппу
     * @param {string} groupId - ID группы
     * @param {string} subgroupId - ID подгруппы
     */
    deleteSubgroup(groupId, subgroupId) {
        const group = this.getGroup(groupId);
        if (!group) return;

        const index = group.subgroups.findIndex(s => s.id === subgroupId);
        if (index === -1) return;

        // Подтверждение удаления
        if (!confirm('Удалить подгруппу и все её триггеры?')) return;

        group.subgroups.splice(index, 1);

        // Удалить из DOM
        const subgroupElement = document.querySelector(`[data-subgroup-id="${subgroupId}"]`);
        if (subgroupElement) {
            subgroupElement.remove();
        }

        // Перенумеровать подгруппы
        this.renumberSubgroups(groupId);
    }

    /**
     * Получить подгруппу по ID
     * @param {string} groupId - ID группы
     * @param {string} subgroupId - ID подгруппы
     * @returns {Object|null}
     */
    getSubgroup(groupId, subgroupId) {
        const group = this.getGroup(groupId);
        if (!group) return null;
        return group.subgroups.find(s => s.id === subgroupId) || null;
    }

    /**
     * Перенумеровать подгруппы после удаления
     * @param {string} groupId - ID группы
     */
    renumberSubgroups(groupId) {
        const group = this.getGroup(groupId);
        if (!group) return;

        const groupNumber = this.groups.indexOf(group) + 1;

        group.subgroups.forEach((subgroup, index) => {
            subgroup.name = `Подгруппа ${groupNumber}.${index + 1}`;
            const subgroupElement = document.querySelector(`[data-subgroup-id="${subgroup.id}"]`);
            if (subgroupElement) {
                const titleElement = subgroupElement.querySelector('.subgroup-title');
                if (titleElement) {
                    titleElement.textContent = subgroup.name;
                }
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // ТРИГГЕРЫ (CRUD)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Добавить триггер в подгруппу
     * @param {string} groupId - ID группы
     * @param {string} subgroupId - ID подгруппы
     * @param {string} text - Текст триггера (опционально)
     * @returns {boolean} Успех операции
     */
    addTrigger(groupId, subgroupId, text = '') {
        const subgroup = this.getSubgroup(groupId, subgroupId);
        if (!subgroup) return false;

        // Проверка лимита
        if (subgroup.triggers.length >= this.MAX_TRIGGERS) {
            this.showError(`Максимум ${this.MAX_TRIGGERS} триггеров в подгруппе`);
            return false;
        }

        subgroup.triggers.push(text);
        this.renderTrigger(groupId, subgroupId, subgroup.triggers.length - 1, text);

        return true;
    }

    /**
     * Удалить триггер
     * @param {string} groupId - ID группы
     * @param {string} subgroupId - ID подгруппы
     * @param {number} triggerIndex - Индекс триггера
     */
    deleteTrigger(groupId, subgroupId, triggerIndex) {
        const subgroup = this.getSubgroup(groupId, subgroupId);
        if (!subgroup) return;

        subgroup.triggers.splice(triggerIndex, 1);

        // Перерисовать все триггеры подгруппы
        this.rerenderTriggers(groupId, subgroupId);
    }

    /**
     * Обновить текст триггера
     * @param {string} groupId - ID группы
     * @param {string} subgroupId - ID подгруппы
     * @param {number} triggerIndex - Индекс триггера
     * @param {string} text - Новый текст
     */
    updateTrigger(groupId, subgroupId, triggerIndex, text) {
        const subgroup = this.getSubgroup(groupId, subgroupId);
        if (!subgroup) return;

        subgroup.triggers[triggerIndex] = text.trim();
    }

    // ═══════════════════════════════════════════════════════════════
    // РЕНДЕРИНГ
    // ═══════════════════════════════════════════════════════════════

    /**
     * Отрендерить группу
     * @param {Object} group - Объект группы
     */
    renderGroup(group) {
        const groupElement = document.createElement('div');
        groupElement.className = 'group';
        groupElement.dataset.groupId = group.id;

        groupElement.innerHTML = `
            <div class="group-header">
                <span class="group-number">${group.name}</span>
                <h3 class="group-title">${group.name}</h3>
                <div class="badges-container"></div>
                <div class="group-actions">
                    <button class="btn-icon" title="Добавить подгруппу" data-action="add-subgroup">
                        ➕
                    </button>
                    <button class="btn-icon btn-danger" title="Удалить группу" data-action="delete-group">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="group-body">
                <div class="subgroups-container" data-group-id="${group.id}"></div>
                <button class="btn-add-subgroup" data-action="add-subgroup">
                    + Добавить подгруппу
                </button>
            </div>
        `;

        this.container.appendChild(groupElement);
    }

    /**
     * Отрендерить подгруппу
     * @param {string} groupId - ID группы
     * @param {Object} subgroup - Объект подгруппы
     */
    renderSubgroup(groupId, subgroup) {
        const subgroupsContainer = document.querySelector(`[data-group-id="${groupId}"] .subgroups-container`);
        if (!subgroupsContainer) return;

        const subgroupElement = document.createElement('div');
        subgroupElement.className = 'subgroup';
        subgroupElement.dataset.subgroupId = subgroup.id;
        subgroupElement.dataset.groupId = groupId;

        subgroupElement.innerHTML = `
            <div class="subgroup-header">
                <span class="subgroup-title">${subgroup.name}</span>
                <div class="badges-container"></div>
                <div class="subgroup-actions">
                    <button class="btn-icon btn-sm" title="Добавить триггер" data-action="add-trigger">
                        ➕
                    </button>
                    <button class="btn-icon btn-sm btn-danger" title="Удалить подгруппу" data-action="delete-subgroup">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="subgroup-body">
                <div class="triggers-list"></div>
                <button class="btn-add-trigger" data-action="add-trigger">
                    + Добавить триггер
                </button>
            </div>
            <div class="distance-selector">
                <label>Расстояние до следующей подгруппы:</label>
                <select class="distance-dropdown" data-action="change-distance">
                    <option value="null" selected>Нет distance</option>
                    <option value="alternation">Рядом (|)</option>
                    <option value="custom">Точное расстояние (.{мин,макс})</option>
                    <option value="any">Любое расстояние (.?)</option>
                    <option value="paragraph">Конец абзаца (\.)</option>
                    <option value="line">Конец строки ($)</option>
                </select>
            </div>
        `;

        subgroupsContainer.appendChild(subgroupElement);
    }

    /**
     * Отрендерить триггер
     * @param {string} groupId - ID группы
     * @param {string} subgroupId - ID подгруппы
     * @param {number} index - Индекс триггера
     * @param {string} text - Текст триггера
     */
    renderTrigger(groupId, subgroupId, index, text) {
        const triggersList = document.querySelector(
            `[data-subgroup-id="${subgroupId}"] .triggers-list`
        );
        if (!triggersList) return;

        const triggerElement = document.createElement('div');
        triggerElement.className = 'trigger-item';
        triggerElement.dataset.triggerIndex = index;

        triggerElement.innerHTML = `
            <input 
                type="text" 
                class="trigger-input" 
                placeholder="Введите триггер"
                value="${text}"
                data-action="update-trigger"
                data-trigger-index="${index}"
            />
            <button 
                class="btn-icon btn-sm btn-danger" 
                title="Удалить триггер"
                data-action="delete-trigger"
                data-trigger-index="${index}"
            >
                ✕
            </button>
        `;

        triggersList.appendChild(triggerElement);
    }

    /**
     * Перерисовать все триггеры подгруппы
     * @param {string} groupId - ID группы
     * @param {string} subgroupId - ID подгруппы
     */
    rerenderTriggers(groupId, subgroupId) {
        const subgroup = this.getSubgroup(groupId, subgroupId);
        if (!subgroup) return;

        const triggersList = document.querySelector(
            `[data-subgroup-id="${subgroupId}"] .triggers-list`
        );
        if (!triggersList) return;

        triggersList.innerHTML = '';

        subgroup.triggers.forEach((text, index) => {
            this.renderTrigger(groupId, subgroupId, index, text);
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // ОБРАБОТЧИКИ СОБЫТИЙ
    // ═══════════════════════════════════════════════════════════════

    /**
     * Обработчик кликов (делегирование)
     * @param {Event} e - Событие клика
     */
    handleClick(e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;
        const groupElement = target.closest('[data-group-id]');
        const subgroupElement = target.closest('[data-subgroup-id]');

        const groupId = groupElement?.dataset.groupId;
        const subgroupId = subgroupElement?.dataset.subgroupId;

        switch (action) {
            case 'add-subgroup':
                if (groupId) this.addSubgroup(groupId);
                break;

            case 'delete-group':
                if (groupId) this.deleteGroup(groupId);
                break;

            case 'add-trigger':
                if (groupId && subgroupId) this.addTrigger(groupId, subgroupId);
                break;

            case 'delete-subgroup':
                if (groupId && subgroupId) this.deleteSubgroup(groupId, subgroupId);
                break;

            case 'delete-trigger':
                const triggerIndex = parseInt(target.dataset.triggerIndex);
                if (groupId && subgroupId && !isNaN(triggerIndex)) {
                    this.deleteTrigger(groupId, subgroupId, triggerIndex);
                }
                break;
        }
    }

    /**
     * Обработчик ввода (для триггеров)
     * @param {Event} e - Событие input
     */
    handleInput(e) {
        const target = e.target;
        if (target.dataset.action !== 'update-trigger') return;

        const subgroupElement = target.closest('[data-subgroup-id]');
        const groupElement = target.closest('[data-group-id]');

        const groupId = groupElement?.dataset.groupId;
        const subgroupId = subgroupElement?.dataset.subgroupId;
        const triggerIndex = parseInt(target.dataset.triggerIndex);

        if (groupId && subgroupId && !isNaN(triggerIndex)) {
            this.updateTrigger(groupId, subgroupId, triggerIndex, target.value);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // УТИЛИТЫ
    // ═══════════════════════════════════════════════════════════════

    /**
     * Показать ошибку (toast)
     * @param {string} message - Сообщение об ошибке
     */
    showError(message) {
        // TODO: Интеграция с системой уведомлений (ЧАТ 5)
        alert(message);
    }

    /**
     * Получить все группы
     * @returns {Array} Массив групп
     */
    getAllGroups() {
        return this.groups;
    }

    /**
     * Валидация данных перед конвертацией
     * @returns {Object} {valid: boolean, errors: Array}
     */
    validate() {
        const errors = [];

        // Проверка: есть ли хотя бы одна группа
        if (this.groups.length === 0) {
            errors.push('Добавьте хотя бы одну группу');
        }

        // Проверка каждой группы
        this.groups.forEach((group, gIndex) => {
            if (group.subgroups.length === 0) {
                errors.push(`${group.name}: нет подгрупп`);
            }

            // Проверка каждой подгруппы
            group.subgroups.forEach((subgroup, sIndex) => {
                if (subgroup.triggers.length === 0) {
                    errors.push(`${subgroup.name}: нет триггеров`);
                }

                // Проверка каждого триггера
                subgroup.triggers.forEach((trigger, tIndex) => {
                    if (!trigger || trigger.trim() === '') {
                        errors.push(
                            `${subgroup.name}, триггер ${tIndex + 1}: пустой триггер`
                        );
                    }
                });
            });
        });

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

