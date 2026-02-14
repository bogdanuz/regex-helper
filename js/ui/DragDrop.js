/**
 * ═══════════════════════════════════════════════════════════════════
 * REGEXHELPER v4.0 - DragDrop.js (FINAL VERSION)
 * Drag & Drop система для параметров (Type 1-6)
 * ✅ ИСПРАВЛЕНО: Реализован findTriggerById(), добавлены зависимости
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * @class DragDrop
 * @description Управляет drag & drop триггеров на drop zones (параметры)
 */
export class DragDrop {
    constructor() {
        this.badgeManager = null;
        this.linkedTriggersManager = null; // ✅ ДОБАВЛЕНО
        this.simpleTriggers = null;         // ✅ ДОБАВЛЕНО
        this.draggingElement = null;
        this.draggingTriggerId = null;

        this.init();
    }

    /**
     * ✅ ИСПРАВЛЕНО: Установить зависимости с linkedTriggersManager
     * @param {Object} dependencies - {badgeManager, linkedTriggersManager, simpleTriggers}
     */
    setDependencies(dependencies) {
        this.badgeManager = dependencies.badgeManager;
        this.linkedTriggersManager = dependencies.linkedTriggersManager; // ✅ ДОБАВЛЕНО
        this.simpleTriggers = dependencies.simpleTriggers;               // ✅ ДОБАВЛЕНО
    }

    /**
     * Инициализация drag & drop
     */
    init() {
        this.initDraggableTriggers();
        this.initDropZones();
    }

    // ═══════════════════════════════════════════════════════════════
    // DRAGGABLE ТРИГГЕРЫ
    // ═══════════════════════════════════════════════════════════════

    /**
     * Инициализация draggable триггеров
     */
    initDraggableTriggers() {
        const triggers = document.querySelectorAll('.draggable-trigger');

        triggers.forEach(trigger => {
            // Добавить атрибут draggable
            trigger.setAttribute('draggable', true);

            // Обработчики drag
            trigger.addEventListener('dragstart', (e) => this.handleDragStart(e, trigger));
            trigger.addEventListener('dragend', (e) => this.handleDragEnd(e, trigger));
        });
    }

    /**
     * Обработчик начала перетаскивания
     * @param {DragEvent} e - Событие dragstart
     * @param {HTMLElement} trigger - Триггер элемент
     */
    handleDragStart(e, trigger) {
        this.draggingElement = trigger;
        this.draggingTriggerId = trigger.dataset.triggerId;

        // Установить данные для передачи
        e.dataTransfer.setData('text/plain', this.draggingTriggerId);
        e.dataTransfer.effectAllowed = 'copy';

        // Добавить класс для визуального эффекта
        trigger.classList.add('dragging');

        console.log(`DragDrop: начало перетаскивания триггера "${this.draggingTriggerId}"`);
    }

    /**
     * Обработчик окончания перетаскивания
     * @param {DragEvent} e - Событие dragend
     * @param {HTMLElement} trigger - Триггер элемент
     */
    handleDragEnd(e, trigger) {
        // Убрать класс dragging
        trigger.classList.remove('dragging');

        console.log(`DragDrop: окончание перетаскивания триггера "${this.draggingTriggerId}"`);

        // Сбросить состояние
        this.draggingElement = null;
        this.draggingTriggerId = null;
    }

    // ═══════════════════════════════════════════════════════════════
    // DROP ZONES (ПАРАМЕТРЫ)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Инициализация drop zones
     */
    initDropZones() {
        const dropZones = document.querySelectorAll('.drop-zone');

        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => this.handleDragOver(e, zone));
            zone.addEventListener('dragleave', (e) => this.handleDragLeave(e, zone));
            zone.addEventListener('drop', (e) => this.handleDrop(e, zone));
        });
    }

    /**
     * Обработчик dragover (триггер над drop zone)
     * @param {DragEvent} e - Событие dragover
     * @param {HTMLElement} zone - Drop zone элемент
     */
    handleDragOver(e, zone) {
        // Важно! Без preventDefault drop не сработает
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';

        // Добавить класс для визуального эффекта
        if (!zone.classList.contains('drag-over')) {
            zone.classList.add('drag-over');
        }
    }

    /**
     * Обработчик dragleave (триггер покинул drop zone)
     * @param {DragEvent} e - Событие dragleave
     * @param {HTMLElement} zone - Drop zone элемент
     */
    handleDragLeave(e, zone) {
        // Убрать класс drag-over
        zone.classList.remove('drag-over');
    }

    /**
     * Обработчик drop (триггер брошен на drop zone)
     * @param {DragEvent} e - Событие drop
     * @param {HTMLElement} zone - Drop zone элемент
     */
    handleDrop(e, zone) {
        e.preventDefault();

        // Убрать класс drag-over
        zone.classList.remove('drag-over');

        // Получить данные
        const triggerId = e.dataTransfer.getData('text/plain');
        const param = zone.dataset.param;

        if (!triggerId || !param) {
            console.error('DragDrop: отсутствуют triggerId или param');
            return;
        }

        console.log(`DragDrop: триггер "${triggerId}" брошен на параметр "${param}"`);

        // Применить параметр к триггеру
        this.applyParamToTrigger(triggerId, param);

        // Обновить UI drop zone
        this.updateDropZoneUI(zone, triggerId);

        // Обновить badges (если badge manager подключён)
        if (this.badgeManager) {
            this.badgeManager.updateBadges();
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // ПРИМЕНЕНИЕ ПАРАМЕТРОВ
    // ═══════════════════════════════════════════════════════════════

    /**
     * Применить параметр к триггеру
     * @param {string} triggerId - ID триггера
     * @param {string} param - Параметр (latinCyrillic, declensions, commonRoot, optional, prefix)
     */
    applyParamToTrigger(triggerId, param) {
        // Найти триггер в данных
        const trigger = this.findTriggerById(triggerId);

        if (!trigger) {
            console.error(`DragDrop: триггер с ID "${triggerId}" не найден`);
            return;
        }

        // Для связанных триггеров применяем параметр к подгруппе
        if (trigger.type === 'linked') {
            const group = this.linkedTriggersManager.getGroup(trigger.groupId);
            if (!group) return;

            const subgroup = group.subgroups.find(s => s.id === trigger.subgroupId);
            if (!subgroup) return;

            // Применяем параметр
            switch (param) {
                case 'latinCyrillic':
                    subgroup.params.latinCyrillic = true;
                    break;
                case 'declensions':
                    subgroup.params.declensions = true;
                    break;
                case 'commonRoot':
                    subgroup.params.commonRoot = true;
                    break;
                case 'optional':
                case 'prefix':
                    // Открываем inline popup для настройки
                    this.openInlinePopup(triggerId, param);
                    return;
                default:
                    console.warn(`DragDrop: Неизвестный параметр "${param}"`);
            }

            console.log(`✅ Параметр "${param}" применён к триггеру ${triggerId}`);
        }

        // Для простых триггеров параметры применяются глобально
        // (реализация зависит от архитектуры)

        // Обновляем UI
        if (this.badgeManager) {
            this.badgeManager.updateBadges();
        }
    }

    /**
     * ✅ ИСПРАВЛЕНО: Реализован findTriggerById()
     * @param {string} triggerId - ID триггера
     * @returns {Object|null} Объект триггера или null
     */
    findTriggerById(triggerId) {
        // 1. Ищем в SimpleTriggers (формат: "simple-0", "simple-1", ...)
        if (triggerId.startsWith('simple-')) {
            const index = parseInt(triggerId.split('-')[1]);
            const triggers = this.simpleTriggers.getTriggers();

            if (index >= 0 && index < triggers.length) {
                return {
                    id: triggerId,
                    text: triggers[index],
                    type: 'simple',
                    params: {} // Параметры в простых триггерах отдельно не хранятся
                };
            }
        }

        // 2. Ищем в LinkedTriggersManager (формат: "group-1-subgroup-1-trigger-0")
        if (triggerId.includes('group-')) {
            const match = triggerId.match(/group-(\d+)-subgroup-(\d+)-trigger-(\d+)/);
            if (!match) return null;

            const [_, groupId, subgroupId, triggerIndex] = match;
            const group = this.linkedTriggersManager.getGroup(`group-${groupId}`);
            if (!group) return null;

            const subgroup = group.subgroups.find(s => s.id === `subgroup-${subgroupId}`);
            if (!subgroup) return null;

            const triggerText = subgroup.triggers[parseInt(triggerIndex)];
            if (!triggerText) return null;

            return {
                id: triggerId,
                text: triggerText,
                type: 'linked',
                params: subgroup.params || {},
                groupId: `group-${groupId}`,
                subgroupId: `subgroup-${subgroupId}`
            };
        }

        console.warn(`DragDrop: Триггер с ID "${triggerId}" не найден`);
        return null;
    }

    /**
     * Открыть inline popup для дополнительных параметров
     * @param {string} triggerId - ID триггера
     * @param {string} paramType - Тип параметра (optional, prefix)
     */
    openInlinePopup(triggerId, paramType) {
        console.log(`🔵 Открытие inline popup для ${paramType}`);

        // Диспатчим событие для InlinePopup.js
        document.dispatchEvent(new CustomEvent('openInlinePopup', {
            detail: { triggerId, paramType }
        }));
    }

    // ═══════════════════════════════════════════════════════════════
    // UI ОБНОВЛЕНИЕ
    // ═══════════════════════════════════════════════════════════════

    /**
     * Обновить UI drop zone после drop
     * @param {HTMLElement} zone - Drop zone элемент
     * @param {string} triggerId - ID триггера
     */
    updateDropZoneUI(zone, triggerId) {
        const dropZoneBody = zone.querySelector('.drop-zone-body');

        if (!dropZoneBody) {
            console.warn('DragDrop: .drop-zone-body не найден');
            return;
        }

        // Создать элемент триггера в drop zone
        const triggerEl = document.createElement('div');
        triggerEl.className = 'dropped-trigger';
        triggerEl.textContent = triggerId;
        triggerEl.dataset.triggerId = triggerId;

        // Добавить кнопку удаления
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn-icon btn-danger';
        removeBtn.innerHTML = '×';
        removeBtn.title = 'Убрать параметр';
        removeBtn.addEventListener('click', () => this.removeParamFromTrigger(triggerId, zone.dataset.param));

        triggerEl.appendChild(removeBtn);
        dropZoneBody.appendChild(triggerEl);

        // Анимация появления
        setTimeout(() => triggerEl.classList.add('visible'), 10);
    }

    /**
     * Убрать параметр от триггера
     * @param {string} triggerId - ID триггера
     * @param {string} param - Параметр
     */
    removeParamFromTrigger(triggerId, param) {
        const trigger = this.findTriggerById(triggerId);

        if (!trigger) {
            console.error(`DragDrop: триггер с ID "${triggerId}" не найден`);
            return;
        }

        // Убрать параметр
        if (trigger.params && trigger.params[param]) {
            trigger.params[param] = false;
        }

        // Обновить UI
        const dropZone = document.querySelector(`.drop-zone[data-param="${param}"]`);
        if (dropZone) {
            const droppedTrigger = dropZone.querySelector(`.dropped-trigger[data-trigger-id="${triggerId}"]`);
            if (droppedTrigger) {
                droppedTrigger.remove();
            }
        }

        // Обновить badges
        if (this.badgeManager) {
            this.badgeManager.updateBadges();
        }

        console.log(`DragDrop: параметр "${param}" убран от триггера "${triggerId}"`);
    }

    /**
     * Перерендерить все drop zones (для обновления UI)
     */
    reRenderDropZones() {
        const dropZones = document.querySelectorAll('.drop-zone');

        dropZones.forEach(zone => {
            const dropZoneBody = zone.querySelector('.drop-zone-body');
            if (dropZoneBody) {
                dropZoneBody.innerHTML = '';
            }
        });

        // TODO: Перерендерить триггеры в drop zones на основе данных
    }
}
