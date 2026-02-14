/**
 * ═══════════════════════════════════════════════════════════════════
 * REGEXHELPER v4.0 - Modals.js
 * Управление модальными окнами (настройки параметров, история)
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * @class Modals
 * @description Управляет открытием/закрытием модальных окон
 */
export class Modals {
    constructor() {
        this.currentModal = null;
        this.modalStack = []; // Стек открытых модалов (для вложенных)

        this.init();
    }

    /**
     * Инициализация
     */
    init() {
        // Закрытие модала по клику на overlay
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });

        // Закрытие модала по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal();
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // ОТКРЫТИЕ МОДАЛОВ
    // ═══════════════════════════════════════════════════════════════

    /**
     * Открыть модальное окно
     * @param {string} modalType - Тип модала ('settings', 'history', 'help')
     * @param {Object} data - Данные для модала
     */
    openModal(modalType, data = {}) {
        // Если уже есть открытый модал, закрыть его
        if (this.currentModal) {
            this.closeModal();
        }

        // Создать модал
        let modal;

        switch (modalType) {
            case 'settings':
                modal = this.createSettingsModal(data);
                break;
            case 'history':
                modal = this.createHistoryModal(data);
                break;
            case 'help':
                modal = this.createHelpModal(data);
                break;
            default:
                console.error(`Modals: неизвестный тип модала "${modalType}"`);
                return;
        }

        // Добавить модал в DOM
        document.body.appendChild(modal);

        // Сохранить текущий модал
        this.currentModal = modal;
        this.modalStack.push(modal);

        // Анимация появления
        setTimeout(() => modal.classList.add('open'), 10);

        // Заблокировать скролл body
        document.body.style.overflow = 'hidden';

        console.log(`Modals: открыт модал "${modalType}"`);
    }

    /**
     * Создать модал настроек параметров
     * @param {Object} data - {groupId, subgroupId, triggerId}
     * @returns {HTMLElement} Модал элемент
     */
    createSettingsModal(data) {
        const { groupId, subgroupId, triggerId } = data;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'modal-settings';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        // Header
        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
            <h2>Настройки параметров</h2>
            <button class="btn-close" title="Закрыть">×</button>
        `;
        header.querySelector('.btn-close').addEventListener('click', () => this.closeModal());

        // Body с табами
        const body = document.createElement('div');
        body.className = 'modal-body';

        // Табы
        const tabs = document.createElement('div');
        tabs.className = 'tabs';
        tabs.innerHTML = `
            <button class="tab active" data-tab="params">Параметры</button>
            <button class="tab" data-tab="triggers">Триггеры</button>
        `;

        tabs.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        body.appendChild(tabs);

        // Tab content: Параметры
        const paramsTab = this.createParamsTab(data);
        body.appendChild(paramsTab);

        // Tab content: Триггеры
        const triggersTab = this.createTriggersTab(data);
        body.appendChild(triggersTab);

        // Footer
        const footer = document.createElement('div');
        footer.className = 'modal-footer';
        footer.innerHTML = `
            <button class="btn-secondary">Отмена</button>
            <button class="btn-primary">Применить</button>
        `;
        footer.querySelector('.btn-secondary').addEventListener('click', () => this.closeModal());
        footer.querySelector('.btn-primary').addEventListener('click', () => this.applySettings(data));

        // Собрать модал
        modalContent.appendChild(header);
        modalContent.appendChild(body);
        modalContent.appendChild(footer);
        modal.appendChild(modalContent);

        return modal;
    }

    /**
     * Создать таб параметров (drag & drop zones)
     * @param {Object} data - Данные
     * @returns {HTMLElement} Таб элемент
     */
    createParamsTab(data) {
        const tab = document.createElement('div');
        tab.className = 'tab-content active';
        tab.id = 'tab-params';

        tab.innerHTML = `
            <div class="param-section">
                <h3>Drag & Drop зоны</h3>
                <p class="hint">Перетащите триггер на параметр для применения</p>

                <div class="drag-drop-container">
                    <div class="drop-zone" data-param="latinCyrillic">
                        <div class="drop-zone-header">Латиница/Кириллица</div>
                        <div class="drop-zone-body"></div>
                    </div>

                    <div class="drop-zone" data-param="declensions">
                        <div class="drop-zone-header">Склонения</div>
                        <div class="drop-zone-body"></div>
                    </div>

                    <div class="drop-zone" data-param="commonRoot">
                        <div class="drop-zone-header">Общий корень</div>
                        <div class="drop-zone-body"></div>
                    </div>

                    <div class="drop-zone" data-param="optional">
                        <div class="drop-zone-header">Опциональные символы</div>
                        <div class="drop-zone-body"></div>
                    </div>

                    <div class="drop-zone" data-param="prefix">
                        <div class="drop-zone-header">Префикс</div>
                        <div class="drop-zone-body"></div>
                    </div>
                </div>
            </div>
        `;

        return tab;
    }

    /**
     * Создать таб триггеров (draggable список)
     * @param {Object} data - Данные
     * @returns {HTMLElement} Таб элемент
     */
    createTriggersTab(data) {
        const tab = document.createElement('div');
        tab.className = 'tab-content';
        tab.id = 'tab-triggers';
        tab.style.display = 'none';

        tab.innerHTML = `
            <div class="triggers-list">
                <h3>Триггеры</h3>
                <p class="hint">Перетащите триггер на параметр во вкладке "Параметры"</p>

                <!-- TODO: Рендеринг триггеров из данных -->
                <div class="draggable-trigger" draggable="true" data-trigger-id="trigger1">
                    актёр
                </div>
                <div class="draggable-trigger" draggable="true" data-trigger-id="trigger2">
                    актриса
                </div>
            </div>
        `;

        return tab;
    }

    /**
     * Создать модал полной истории
     * @param {Object} data - {history}
     * @returns {HTMLElement} Модал элемент
     */
    createHistoryModal(data) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'modal-history';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content modal-large';

        // Header
        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
            <h2>История конвертаций</h2>
            <button class="btn-close" title="Закрыть">×</button>
        `;
        header.querySelector('.btn-close').addEventListener('click', () => this.closeModal());

        // Body
        const body = document.createElement('div');
        body.className = 'modal-body';

        // TODO: Рендеринг истории из данных
        body.innerHTML = `
            <div class="history-grid">
                <div class="history-card">
                    <div class="history-card-header">
                        <span class="history-date">14.02.2026, 15:30</span>
                        <span class="history-type">Связанные триггеры</span>
                    </div>
                    <div class="history-card-body">
                        <code>(?:актёр|актриса).{1,10}(?:играл|снимался)</code>
                    </div>
                    <div class="history-card-footer">
                        <button class="btn-icon" title="Копировать">📋</button>
                        <button class="btn-icon" title="Удалить">🗑️</button>
                    </div>
                </div>
            </div>
        `;

        // Footer
        const footer = document.createElement('div');
        footer.className = 'modal-footer';
        footer.innerHTML = `
            <button class="btn-secondary">Закрыть</button>
            <button class="btn-danger">Очистить всю историю</button>
        `;
        footer.querySelector('.btn-secondary').addEventListener('click', () => this.closeModal());
        footer.querySelector('.btn-danger').addEventListener('click', () => this.clearHistory());

        // Собрать модал
        modalContent.appendChild(header);
        modalContent.appendChild(body);
        modalContent.appendChild(footer);
        modal.appendChild(modalContent);

        return modal;
    }

    /**
     * Создать модал справки
     * @param {Object} data - Данные
     * @returns {HTMLElement} Модал элемент
     */
    createHelpModal(data) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'modal-help';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        // Header
        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
            <h2>Справка</h2>
            <button class="btn-close" title="Закрыть">×</button>
        `;
        header.querySelector('.btn-close').addEventListener('click', () => this.closeModal());

        // Body
        const body = document.createElement('div');
        body.className = 'modal-body';
        body.innerHTML = `
            <h3>Как использовать RegexHelper?</h3>
            <p>Подробная документация доступна в WIKI.</p>
            <!-- TODO: Добавить содержимое справки -->
        `;

        // Footer
        const footer = document.createElement('div');
        footer.className = 'modal-footer';
        footer.innerHTML = `
            <button class="btn-primary">Закрыть</button>
        `;
        footer.querySelector('.btn-primary').addEventListener('click', () => this.closeModal());

        // Собрать модал
        modalContent.appendChild(header);
        modalContent.appendChild(body);
        modalContent.appendChild(footer);
        modal.appendChild(modalContent);

        return modal;
    }

    // ═══════════════════════════════════════════════════════════════
    // ЗАКРЫТИЕ МОДАЛОВ
    // ═══════════════════════════════════════════════════════════════

    /**
     * Закрыть текущий модал
     */
    closeModal() {
        if (!this.currentModal) return;

        // Анимация закрытия
        this.currentModal.classList.remove('open');

        setTimeout(() => {
            // Удалить из DOM
            if (this.currentModal && this.currentModal.parentNode) {
                this.currentModal.remove();
            }

            // Убрать из стека
            this.modalStack.pop();

            // Если был вложенный модал, восстановить предыдущий
            if (this.modalStack.length > 0) {
                this.currentModal = this.modalStack[this.modalStack.length - 1];
            } else {
                this.currentModal = null;
                // Разблокировать скролл body
                document.body.style.overflow = '';
            }
        }, 300); // Длительность анимации

        console.log('Modals: модал закрыт');
    }

    // ═══════════════════════════════════════════════════════════════
    // ДЕЙСТВИЯ
    // ═══════════════════════════════════════════════════════════════

    /**
     * Переключить таб в модале
     * @param {string} tabName - Имя таба
     */
    switchTab(tabName) {
        if (!this.currentModal) return;

        // Убрать active у всех табов
        this.currentModal.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Убрать active у всех tab-content
        this.currentModal.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });

        // Активировать выбранный таб
        const activeTab = this.currentModal.querySelector(`.tab[data-tab="${tabName}"]`);
        const activeContent = this.currentModal.querySelector(`#tab-${tabName}`);

        if (activeTab) activeTab.classList.add('active');
        if (activeContent) {
            activeContent.classList.add('active');
            activeContent.style.display = 'block';
        }
    }

    /**
     * Применить настройки из модала
     * @param {Object} data - Данные
     */
    applySettings(data) {
        console.log('Modals: применение настроек', data);

        // TODO: Применить настройки к группе/подгруппе/триггеру

        this.closeModal();
    }

    /**
     * Очистить всю историю
     */
    clearHistory() {
        const confirm = window.confirm('Вы уверены, что хотите очистить всю историю?');

        if (confirm) {
            // TODO: Интеграция с History модулем
            console.log('Modals: очистка всей истории');
            this.closeModal();
        }
    }
}
