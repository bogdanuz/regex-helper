/**
 * ═══════════════════════════════════════════════════════════════════
 * REGEXHELPER v4.0 - main.js (FIXED VERSION - Правильные импорты)
 * Точка входа приложения RegexHelper v4.0
 * Инициализация всех модулей и глобальных обработчиков
 * ✅ ИСПРАВЛЕНО: Все импорты приведены в соответствие с экспортами
 * ═══════════════════════════════════════════════════════════════════
 */

// ============================================================================
// ИМПОРТЫ МОДУЛЕЙ (✅ ИСПРАВЛЕНО: именованные импорты вместо default)
// ============================================================================

// Менеджеры основных функций
import { LinkedTriggersManager } from './modules/LinkedTriggersManager.js';
import { BadgeManager } from './modules/BadgeManager.js';
import { DistanceSelector } from './modules/DistanceSelector.js';
import { SimpleTriggers } from './modules/SimpleTriggers.js';
import { Converter } from './modules/Converter.js';
import { OutputManager } from './modules/OutputManager.js';

// UI модули
import { DragDrop } from './ui/DragDrop.js';
import InlinePopupManager from './ui/InlinePopup.js';
import { ModalManager } from './ui/Modals.js';
import { NotificationManager } from './ui/Notifications.js';
import TooltipManager from './ui/Tooltips.js';

// Утилиты
import * as Validation from './utils/validation.js';
import * as Escape from './utils/escape.js';
import * as Storage from './utils/storage.js';

// Менеджеры истории и экспорта
import HistoryManager from './modules/HistoryManager.js';
import ExportManager from './modules/ExportManager.js';

// Параметры
import * as LatinCyrillic from './params/LatinCyrillic.js';
import * as CommonRoot from './params/CommonRoot.js';
import * as Declensions from './params/Declensions.js';
import * as OptionalChars from './params/OptionalChars.js';
import * as Prefix from './params/Prefix.js';

// ============================================================================
// ГЛАВНЫЙ КЛАСС ПРИЛОЖЕНИЯ
// ============================================================================

class RegexHelperApp {
    constructor() {
        // Менеджеры
        this.linkedTriggersManager = null;
        this.badgeManager = null;
        this.distanceSelector = null;
        this.simpleTriggers = null;
        this.converter = null;
        this.outputManager = null;

        // UI менеджеры
        this.dragDropManager = null;
        this.inlinePopupManager = null;
        this.modalManager = null;
        this.notificationManager = null;
        this.tooltipManager = null;

        // История и экспорт
        this.historyManager = null;
        this.exportManager = null;

        // Инициализация
        this.init();
    }

    /**
     * Инициализация приложения
     */
    async init() {
        try {
            console.log('🚀 RegexHelper v4.0 запускается...');

            // ✅ Проверка разрешения экрана
            this.checkScreenResolution();

            // Слушаем изменение размера окна
            window.addEventListener('resize', () => this.checkScreenResolution());

            // Проверка поддержки браузера
            if (!this.checkBrowserSupport()) {
                this.showBrowserWarning();
                return;
            }

            // Инициализация менеджеров (порядок важен!)
            await this.initManagers();

            // Навешивание глобальных обработчиков
            this.attachGlobalEventListeners();

            // Восстановление сохранённых данных
            this.restoreSavedData();

            // Автосохранение
            this.setupAutoSave();

            // Smooth scroll для навигации
            this.setupSmoothScroll();

            console.log('✅ RegexHelper v4.0 успешно запущен!');

            // Показываем приветственное уведомление
            if (this.notificationManager) {
                this.notificationManager.success('RegexHelper v4.0 готов к работе!');
            }

        } catch (error) {
            console.error('❌ Критическая ошибка инициализации:', error);
            this.handleCriticalError(error);
        }
    }

    /**
     * ✅ НОВОЕ: Проверка разрешения экрана и показ предупреждений
     */
    checkScreenResolution() {
        const width = window.innerWidth;

        if (width < 1024) {
            // ❌ NOT SUPPORTED - показываем overlay
            this.showUnsupportedScreen();
        } else if (width < 1280) {
            // ⚠️ WARNING - показываем toast (один раз за сессию)
            if (!sessionStorage.getItem('resolution-warning-shown')) {
                if (this.notificationManager) {
                    this.notificationManager.warning(
                        'Для оптимальной работы рекомендуется разрешение от 1280px. Текущее: ' + width + 'px',
                        { duration: 10000 }
                    );
                }
                sessionStorage.setItem('resolution-warning-shown', 'true');
            }
        } else {
            // ✅ OPTIMAL - скрываем overlay если был показан
            this.hideUnsupportedScreen();
        }
    }

    /**
     * Показать overlay для неподдерживаемых разрешений (<1024px)
     */
    showUnsupportedScreen() {
        let overlay = document.getElementById('unsupported-overlay');

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'unsupported-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0, 0, 0, 0.95);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #FFFFFF;
                text-align: center;
                padding: 20px;
            `;

            overlay.innerHTML = `
                <div style="max-width: 600px;">
                    <h1 style="font-size: 32px; margin-bottom: 20px;">⚠️ Разрешение не поддерживается</h1>
                    <p style="font-size: 18px; margin-bottom: 20px;">
                        RegexHelper v4.0 требует минимальное разрешение <strong>1024px</strong>.
                    </p>
                    <p style="font-size: 16px; color: #A0AEC0;">
                        Ваше текущее разрешение: <strong>${window.innerWidth}px</strong>
                    </p>
                    <p style="font-size: 14px; color: #718096; margin-top: 20px;">
                        Пожалуйста, увеличьте окно браузера или используйте устройство с большим экраном.
                    </p>
                </div>
            `;

            document.body.appendChild(overlay);
        }

        overlay.style.display = 'flex';
    }

    /**
     * Скрыть overlay
     */
    hideUnsupportedScreen() {
        const overlay = document.getElementById('unsupported-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    /**
     * Инициализация всех менеджеров
     */
    async initManagers() {
        // 1. UI менеджеры (первыми, т.к. нужны для уведомлений)
        this.notificationManager = new NotificationManager();
        window.NotificationManager = this.notificationManager; // Глобальный доступ

        this.modalManager = new ModalManager();
        window.ModalManager = this.modalManager; // Глобальный доступ

        this.tooltipManager = new TooltipManager();
        this.inlinePopupManager = new InlinePopupManager();

        // 2. Основные менеджеры
        this.linkedTriggersManager = new LinkedTriggersManager();
        window.LinkedTriggersManager = this.linkedTriggersManager; // Глобальный доступ

        this.badgeManager = new BadgeManager();
        this.distanceSelector = new DistanceSelector();
        this.simpleTriggers = new SimpleTriggers();
        this.outputManager = new OutputManager();

        // 3. Конвертер (требует все предыдущие модули)
        this.converter = new Converter();
        this.converter.setDependencies({
            linkedTriggersManager: this.linkedTriggersManager,
            simpleTriggers: this.simpleTriggers,
            distanceSelector: this.distanceSelector
        });

        // 4. Drag & Drop (требует все предыдущие модули)
        this.dragDropManager = new DragDrop();
        this.dragDropManager.setDependencies({
            badgeManager: this.badgeManager,
            linkedTriggersManager: this.linkedTriggersManager,
            simpleTriggers: this.simpleTriggers
        });

        // 5. История и экспорт
        this.historyManager = new HistoryManager();
        window.HistoryManager = this.historyManager; // Глобальный доступ

        this.exportManager = new ExportManager();
        window.ExportManager = this.exportManager; // Глобальный доступ

        console.log('✅ Все менеджеры инициализированы');
    }

    /**
     * Глобальные обработчики событий
     */
    attachGlobalEventListeners() {
        // Кнопка "Конвертировать"
        const convertBtn = document.getElementById('convert-btn');
        if (convertBtn) {
            convertBtn.addEventListener('click', () => this.handleConvert());
        }

        // Кнопка "Очистить всё"
        const clearAllBtn = document.getElementById('clear-all-btn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.handleClearAll());
        }

        // Переключение между Простыми и Связанными триггерами
        const triggerModeTabs = document.querySelectorAll('[data-trigger-mode]');
        triggerModeTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const mode = e.target.dataset.triggerMode;
                this.switchTriggerMode(mode);
            });
        });

        // Обработка ошибок глобально
        window.addEventListener('error', (e) => {
            console.error('Глобальная ошибка:', e.error);
            this.handleError(e.error);
        });

        // Предупреждение перед закрытием (если есть несохранённые данные)
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = 'У вас есть несохранённые изменения. Закрыть страницу?';
            }
        });
    }

    /**
     * Обработка конвертации
     */
    async handleConvert() {
        try {
            // Определяем режим (простые или связанные триггеры)
            const mode = this.getCurrentTriggerMode();

            let result = null;

            if (mode === 'simple') {
                // Конвертация простых триггеров
                const triggers = this.simpleTriggers.getTriggers();
                const params = this.getSimpleTriggersParams();
                result = this.converter.convertSimpleTriggers(triggers, params);
            } else {
                // Конвертация связанных триггеров
                const groups = this.linkedTriggersManager.getAllGroups();
                result = this.converter.convertLinkedTriggers(groups);
            }

            if (result) {
                // Обновляем вывод
                this.outputManager.updateOutput(result);

                // Добавляем в историю
                this.addToHistory({
                    triggers: mode === 'simple' ? this.simpleTriggers.getTriggers() : [],
                    groups: mode === 'linked' ? this.linkedTriggersManager.getAllGroups() : [],
                    result: result,
                    type: mode,
                    timestamp: Date.now()
                });

                // Уведомление
                this.notificationManager.success('Конвертация выполнена успешно!');

            } else {
                // Ошибка конвертации
                this.notificationManager.error('Ошибка конвертации');
            }

        } catch (error) {
            console.error('Ошибка конвертации:', error);
            this.notificationManager.error('Ошибка конвертации: ' + error.message);
        }
    }

    /**
     * Получить параметры для простых триггеров
     * @returns {Object} Параметры
     */
    getSimpleTriggersParams() {
        // TODO: Реализовать получение параметров из UI
        return {
            latinCyrillic: false,
            declensions: false,
            commonRoot: false,
            optionalChars: null,
            prefix: null
        };
    }

    /**
     * Добавление конвертации в историю
     */
    addToHistory(conversionData) {
        if (this.historyManager) {
            this.historyManager.addToHistory(conversionData);
        }
    }

    /**
     * Очистка всех данных
     */
    handleClearAll() {
        const confirmed = confirm('Очистить ВСЕ данные (триггеры, параметры, результат)? Это действие нельзя отменить.');

        if (!confirmed) return;

        try {
            // Очищаем связанные триггеры
            if (this.linkedTriggersManager) {
                this.linkedTriggersManager.clearAll();
            }

            // Очищаем простые триггеры
            if (this.simpleTriggers) {
                this.simpleTriggers.clear();
            }

            // Очищаем результат
            if (this.outputManager) {
                this.outputManager.clear();
            }

            // Очищаем localStorage (кроме истории)
            Storage.saveSimpleTriggers([]);
            Storage.saveLinkedStructure({ groups: [] });

            this.notificationManager.success('Все данные очищены');

        } catch (error) {
            console.error('Ошибка очистки:', error);
            this.notificationManager.error('Ошибка очистки данных');
        }
    }

    /**
     * Переключение режима триггеров
     */
    switchTriggerMode(mode) {
        const simplePanel = document.getElementById('simple-triggers-panel');
        const linkedPanel = document.getElementById('linked-triggers-panel');

        if (mode === 'simple') {
            if (simplePanel) simplePanel.style.display = 'block';
            if (linkedPanel) linkedPanel.style.display = 'none';
        } else {
            if (simplePanel) simplePanel.style.display = 'none';
            if (linkedPanel) linkedPanel.style.display = 'block';
        }

        // Обновляем активный таб
        document.querySelectorAll('[data-trigger-mode]').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.triggerMode === mode);
        });
    }

    /**
     * Получение текущего режима триггеров
     */
    getCurrentTriggerMode() {
        const activeTab = document.querySelector('[data-trigger-mode].active');
        return activeTab ? activeTab.dataset.triggerMode : 'simple';
    }

    /**
     * Восстановление сохранённых данных
     */
    restoreSavedData() {
        try {
            // Восстанавливаем простые триггеры
            const savedSimple = Storage.getSimpleTriggers();
            if (savedSimple && savedSimple.length > 0 && this.simpleTriggers) {
                this.simpleTriggers.setTriggers(savedSimple);
            }

            // Восстанавливаем структуру связанных триггеров
            const savedLinked = Storage.getLinkedStructure();
            if (savedLinked && savedLinked.groups && savedLinked.groups.length > 0 && this.linkedTriggersManager) {
                this.linkedTriggersManager.importStructure(savedLinked.groups);
            }

            console.log('✅ Сохранённые данные восстановлены');

        } catch (error) {
            console.error('Ошибка восстановления данных:', error);
        }
    }

    /**
     * Автосохранение каждые 30 секунд
     */
    setupAutoSave() {
        setInterval(() => {
            this.autoSave();
        }, 30000); // 30 секунд
    }

    /**
     * Автосохранение данных
     */
    autoSave() {
        try {
            // Сохраняем простые триггеры
            if (this.simpleTriggers) {
                const triggers = this.simpleTriggers.getTriggers();
                Storage.saveSimpleTriggers(triggers);
            }

            // Сохраняем структуру связанных триггеров
            if (this.linkedTriggersManager) {
                const structure = {
                    groups: this.linkedTriggersManager.getAllGroups()
                };
                Storage.saveLinkedStructure(structure);
            }

            console.log('💾 Автосохранение выполнено');

        } catch (error) {
            console.error('Ошибка автосохранения:', error);
        }
    }

    /**
     * Проверка наличия несохранённых изменений
     */
    hasUnsavedChanges() {
        // TODO: реализовать проверку изменений
        return false;
    }

    /**
     * Smooth scroll для навигации
     */
    setupSmoothScroll() {
        const navLinks = document.querySelectorAll('nav a[href^="#"]');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    /**
     * Проверка поддержки браузера
     */
    checkBrowserSupport() {
        // Проверка localStorage
        if (typeof Storage === 'undefined') {
            console.error('localStorage не поддерживается');
            return false;
        }

        // Проверка ES6 модулей
        if (typeof Symbol === 'undefined') {
            console.error('ES6 не поддерживается');
            return false;
        }

        // Проверка Clipboard API
        if (!navigator.clipboard) {
            console.warn('Clipboard API не поддерживается (будет использован fallback)');
        }

        return true;
    }

    /**
     * Показ предупреждения о несовместимости браузера
     */
    showBrowserWarning() {
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            padding: 20px;
            background: #FF4444;
            color: white;
            text-align: center;
            z-index: 10000;
            font-size: 16px;
        `;
        warning.textContent = '⚠️ Ваш браузер не поддерживается. Используйте современный браузер (Chrome, Firefox, Edge).';
        document.body.prepend(warning);
    }

    /**
     * Обработка ошибок
     */
    handleError(error) {
        console.error('Ошибка:', error);

        if (this.notificationManager) {
            this.notificationManager.error('Произошла ошибка: ' + error.message);
        } else {
            alert('Ошибка: ' + error.message);
        }
    }

    /**
     * Обработка критических ошибок
     */
    handleCriticalError(error) {
        console.error('Критическая ошибка:', error);

        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 500px;
            text-align: center;
        `;
        errorDiv.innerHTML = `
            <h2 style="color: #FF4444; margin-bottom: 20px;">❌ Критическая ошибка</h2>
            <p style="margin-bottom: 20px;">Приложение не может быть запущено.</p>
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">${error.message}</p>
            <button onclick="location.reload()" style="
                padding: 12px 24px;
                background: #00D4FF;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
            ">Перезагрузить страницу</button>
        `;
        document.body.appendChild(errorDiv);
    }
}

// ============================================================================
// ЗАПУСК ПРИЛОЖЕНИЯ
// ============================================================================

// Экспорт для глобального доступа
window.RegexHelper = null;

// Экспорт утилит для консоли
window.RegexHelperUtils = {
    Validation,
    Escape,
    Storage
};

// Экспорт параметров для консоли
window.RegexHelperParams = {
    LatinCyrillic,
    CommonRoot,
    Declensions,
    OptionalChars,
    Prefix
};

// Инициализация при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.RegexHelper = new RegexHelperApp();
    });
} else {
    // DOM уже загружен
    window.RegexHelper = new RegexHelperApp();
}

// Экспорт класса для импорта в других модулях (если понадобится)
export default RegexHelperApp;
