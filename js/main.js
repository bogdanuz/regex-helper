/**
 * ═══════════════════════════════════════════════════════════════════
 * REGEXHELPER v4.0 - main.js
 * Точка входа приложения (инициализация модулей)
 * ═══════════════════════════════════════════════════════════════════
 */

import { LinkedTriggersManager } from './modules/LinkedTriggersManager.js';
import { BadgeManager } from './modules/BadgeManager.js';
import { DistanceSelector } from './modules/DistanceSelector.js';

/**
 * @class RegexHelperApp
 * @description Главный класс приложения
 */
class RegexHelperApp {
    constructor() {
        this.linkedTriggersManager = null;
        this.badgeManager = null;
        this.distanceSelector = null;

        this.init();
    }

    /**
     * Инициализация приложения
     */
    init() {
        console.log('RegexHelper v4.0 — Инициализация...');

        // Дождаться загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initModules());
        } else {
            this.initModules();
        }
    }

    /**
     * Инициализация модулей
     */
    initModules() {
        try {
            // 1. Инициализация LinkedTriggersManager
            this.linkedTriggersManager = new LinkedTriggersManager();
            console.log('✅ LinkedTriggersManager инициализирован');

            // 2. Инициализация BadgeManager
            this.badgeManager = new BadgeManager();
            console.log('✅ BadgeManager инициализирован');

            // 3. Инициализация DistanceSelector
            this.distanceSelector = new DistanceSelector();
            console.log('✅ DistanceSelector инициализирован');

            // 4. Подключить модули друг к другу
            this.connectModules();

            // 5. Инициализация UI
            this.initUI();

            console.log('🚀 RegexHelper v4.0 готов к работе!');

        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
            this.showCriticalError(error);
        }
    }

    /**
     * Подключить модули друг к другу
     */
    connectModules() {
        // Связать LinkedTriggersManager и BadgeManager
        // Когда триггеры обновляются → автоматически обновлять badge

        // Связать DistanceSelector и LinkedTriggersManager
        // Когда distance меняется → обновить данные в LinkedTriggersManager

        // TODO: Реализовать связи в следующих чатах (ЧАТ 4-5)
    }

    /**
     * Инициализация UI элементов
     */
    initUI() {
        // Smooth scroll для навигации
        this.initSmoothScroll();

        // Кнопка "Конвертировать" (пока заглушка)
        const convertBtn = document.querySelector('.btn-convert');
        if (convertBtn) {
            convertBtn.addEventListener('click', () => this.handleConvert());
        }

        // Кнопка "Очистить" (пока заглушка)
        const clearBtn = document.querySelector('.btn-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.handleClear());
        }

        // Добавить первую группу по умолчанию
        if (this.linkedTriggersManager) {
            this.linkedTriggersManager.addGroup();
        }
    }

    /**
     * Инициализация smooth scroll для навигации
     */
    initSmoothScroll() {
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // Обновить active класс
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        });
    }

    /**
     * Обработчик кнопки "Конвертировать"
     */
    handleConvert() {
        console.log('🔄 Конвертация...');

        // Валидация
        const validation = this.linkedTriggersManager.validate();

        if (!validation.valid) {
            alert('Ошибки валидации:\n' + validation.errors.join('\n'));
            return;
        }

        // TODO: Реализовать конвертацию в ЧАТ 4
        alert('Конвертация будет реализована в ЧАТ 4');

        // Получить данные
        const groups = this.linkedTriggersManager.getAllGroups();
        console.log('Группы:', groups);
    }

    /**
     * Обработчик кнопки "Очистить"
     */
    handleClear() {
        if (!confirm('Очистить все группы и подгруппы?')) return;

        console.log('🗑️ Очистка...');

        // Очистить контейнер групп
        const container = document.querySelector('.groups-container');
        if (container) {
            container.innerHTML = '';
        }

        // Сбросить данные в LinkedTriggersManager
        if (this.linkedTriggersManager) {
            this.linkedTriggersManager.groups = [];
            this.linkedTriggersManager.groupIdCounter = 0;
            this.linkedTriggersManager.subgroupIdCounter = 0;

            // Добавить одну группу по умолчанию
            this.linkedTriggersManager.addGroup();
        }
    }

    /**
     * Показать критическую ошибку
     * @param {Error} error - Объект ошибки
     */
    showCriticalError(error) {
        const errorHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #1A2332;
                border: 2px solid #FF4444;
                border-radius: 8px;
                padding: 24px;
                z-index: 10000;
                max-width: 500px;
            ">
                <h2 style="color: #FF4444; margin: 0 0 16px 0;">
                    ❌ Критическая ошибка
                </h2>
                <p style="color: #FFFFFF; margin: 0 0 16px 0;">
                    Не удалось инициализировать приложение.
                </p>
                <pre style="
                    background: #0A0E1A;
                    padding: 12px;
                    border-radius: 4px;
                    color: #FF4444;
                    font-size: 12px;
                    overflow-x: auto;
                ">${error.message}</pre>
                <button onclick="location.reload()" style="
                    background: #00D4FF;
                    color: #0A0E1A;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 16px;
                ">
                    🔄 Перезагрузить страницу
                </button>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', errorHTML);
    }

    /**
     * Получить экземпляр LinkedTriggersManager
     * @returns {LinkedTriggersManager}
     */
    getLinkedTriggersManager() {
        return this.linkedTriggersManager;
    }

    /**
     * Получить экземпляр BadgeManager
     * @returns {BadgeManager}
     */
    getBadgeManager() {
        return this.badgeManager;
    }

    /**
     * Получить экземпляр DistanceSelector
     * @returns {DistanceSelector}
     */
    getDistanceSelector() {
        return this.distanceSelector;
    }
}

// ═══════════════════════════════════════════════════════════════════
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ═══════════════════════════════════════════════════════════════════

const app = new RegexHelperApp();

// Экспорт в глобальную область для доступа из консоли и тестов
window.RegexHelper = app;

// Экспорт для модулей (если потребуется)
export default app;

