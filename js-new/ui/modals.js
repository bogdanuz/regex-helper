/**
 * RegexHelper v4.0 - UI Modals
 * Управление модальными окнами
 * @version 1.0
 * @date 11.02.2026
 */

/**
 * Открывает модальное окно по ID
 * @param {string} modalId - ID модального окна
 * @example
 * openModal('exportModal');
 */
export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error('openModal: модальное окно не найдено', modalId);
        return;
    }

    modal.style.display = 'flex';
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
}

/**
 * Закрывает модальное окно по ID
 * @param {string} modalId - ID модального окна
 * @example
 * closeModal('exportModal');
 */
export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error('closeModal: модальное окно не найдено', modalId);
        return;
    }

    modal.style.display = 'none';
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
}

/**
 * Показывает диалог подтверждения
 * @param {string} title - Заголовок диалога
 * @param {string} text - Текст сообщения
 * @param {Function} onYes - Callback при нажатии "Да"
 * @param {Function} [onNo] - Callback при нажатии "Нет" (опционально)
 * @example
 * showConfirm('Удалить?', 'Вы уверены?', () => console.log('Удалено'), () => console.log('Отменено'));
 */
export function showConfirm(title, text, onYes, onNo = null) {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmModalTitle');
    const textEl = document.getElementById('confirmModalText');
    const yesBtn = document.getElementById('confirmModalYes');
    const noBtn = document.getElementById('confirmModalNo');

    if (!modal || !titleEl || !textEl || !yesBtn || !noBtn) {
        console.warn('showConfirm: элементы не найдены, используется window.confirm');
        if (window.confirm(`${title}\n\n${text}`)) {
            if (typeof onYes === 'function') onYes();
        } else {
            if (typeof onNo === 'function') onNo();
        }
        return;
    }

    titleEl.textContent = title;
    textEl.textContent = text;

    modal.style.display = 'flex';
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';

    const newYesBtn = yesBtn.cloneNode(true);
    const newNoBtn = noBtn.cloneNode(true);
    yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
    noBtn.parentNode.replaceChild(newNoBtn, noBtn);

    newYesBtn.onclick = () => {
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        if (typeof onYes === 'function') onYes();
    };

    newNoBtn.onclick = () => {
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        if (typeof onNo === 'function') onNo();
    };

    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            if (typeof onNo === 'function') onNo();
        }
    };

    const escHandler = (e) => {
        if (e.key === 'Escape') {
            modal.style.display = 'none';
            modal.classList.remove('show');
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            if (typeof onNo === 'function') onNo();
            document.removeEventListener('keydown', escHandler);
        }
    };

    document.addEventListener('keydown', escHandler);
}

/**
 * Показывает диалог подтверждения очистки простых триггеров
 * @example
 * confirmClearSimpleTriggers();
 */
export function confirmClearSimpleTriggers() {
    const textarea = document.getElementById('simpleTriggers');
    if (!textarea) return;

    if (textarea.value.trim()) {
        showConfirm(
            'Очистить триггеры?',
            'Вы уверены, что хотите очистить все триггеры?',
            () => {
                textarea.value = '';
                if (typeof window.updateSimpleTriggerCount === 'function') {
                    window.updateSimpleTriggerCount();
                }
                if (typeof window.clearInlineError === 'function') {
                    window.clearInlineError('simpleTriggers');
                }
            }
        );
    }
}

/**
 * Показывает диалог подтверждения очистки результата
 * @example
 * confirmClearResult();
 */
export function confirmClearResult() {
    const textarea = document.getElementById('regexResult');
    const statsDiv = document.getElementById('resultStats');
    if (!textarea) return;

    if (textarea.value.trim()) {
        showConfirm(
            'Очистить результат?',
            'Вы уверены, что хотите очистить сгенерированный regex?',
            () => {
                textarea.value = '';
                if (statsDiv) {
                    statsDiv.innerHTML = '';
                    statsDiv.style.display = 'none';
                }
                const regexLengthSpan = document.getElementById('regexLength');
                if (regexLengthSpan) {
                    regexLengthSpan.textContent = '0';
                    regexLengthSpan.style.color = '';
                }
            }
        );
    }
}

/**
 * Показывает панель помощи для инструмента
 * @param {string} panelType - Тип панели: 'simple', 'linked', 'optimizer', etc.
 * @example
 * showPanelHelp('simple');
 */
export function showPanelHelp(panelType) {
    const content = getPanelHelpContent(panelType);
    
    const modal = document.getElementById('helpModal');
    const titleEl = document.getElementById('helpModalTitle');
    const bodyEl = document.getElementById('helpModalBody');

    if (!modal || !titleEl || !bodyEl) {
        alert(content.text);
        return;
    }

    titleEl.textContent = content.title;
    bodyEl.innerHTML = content.html;

    openModal('helpModal');
}

/**
 * Возвращает контент помощи для панели
 * @param {string} panelType - Тип панели
 * @returns {Object} - Объект с заголовком и HTML-контентом
 * @example
 * const help = getPanelHelpContent('simple');
 */
export function getPanelHelpContent(panelType) {
    const helpContent = {
        simple: {
            title: 'Простые триггеры',
            text: 'Введите слова или фразы (по одному на строку)',
            html: `
                <h4>Как использовать:</h4>
                <ul>
                    <li>Введите триггеры по одному на строку</li>
                    <li>Максимум 200 триггеров</li>
                    <li>Максимум 100 символов на триггер</li>
                    <li>Автоматически удаляются дубликаты</li>
                </ul>
                <h4>Пример:</h4>
                <div class="example-box">
                    <strong>Ввод:</strong><br>
                    яблоко<br>
                    груша<br>
                    банан
                </div>
            `
        },
        linked: {
            title: 'Связанные триггеры',
            text: 'Создайте группы триггеров с расстоянием между словами',
            html: `
                <h4>Режимы связи:</h4>
                <ul>
                    <li><strong>Individual</strong> - индивидуальное расстояние для каждой подгруппы</li>
                    <li><strong>Common</strong> - общее расстояние для всех подгрупп</li>
                    <li><strong>Alternation</strong> - простое объединение через |</li>
                </ul>
                <h4>Пример:</h4>
                <div class="example-box">
                    <strong>Группа 1:</strong><br>
                    Подгруппа 1: купить, приобрести<br>
                    Подгруппа 2: айфон, iphone<br>
                    <strong>Результат:</strong> (купить|приобрести).{1,7}(айфон|iphone)
                </div>
            `
        },
        optimizer: {
            title: 'Оптимизации',
            text: 'Выберите типы оптимизаций для улучшения regex',
            html: `
                <h4>Типы оптимизаций:</h4>
                <ul>
                    <li><strong>Type 1:</strong> Латиница/кириллица (д/d, о/o)</li>
                    <li><strong>Type 2:</strong> Общие корни (тест → тест(ер)?)</li>
                    <li><strong>Type 4:</strong> Склонения (дом → дом(а|у)?)</li>
                    <li><strong>Type 5:</strong> Удвоенные буквы (аллея → ал?лея)</li>
                    <li><strong>Type 6:</strong> Вариации (test → t.e.s.t)</li>
                </ul>
            `
        }
    };

    return helpContent[panelType] || {
        title: 'Помощь',
        text: 'Информация недоступна',
        html: '<p>Информация недоступна</p>'
    };
}

/**
 * Закрывает модальное окно правил (regulations)
 * @example
 * closeRegulationsModal();
 */
export function closeRegulationsModal() {
    closeModal('regulationsModal');
}

/**
 * Закрывает модальное окно настроек триггера
 * @example
 * closeTriggerSettingsModal();
 */
export function closeTriggerSettingsModal() {
    closeModal('triggerSettingsModal');
}

/**
 * Закрывает модальное окно настроек группы
 * @example
 * closeGroupSettingsModal();
 */
export function closeGroupSettingsModal() {
    closeModal('groupSettingsModal');
}
