/**
 * RegexHelper v4.0 - UI Panels
 * Accordion для сворачивания панелей
 * @version 1.0
 * @date 12.02.2026
 */

/**
 * Переключает состояние accordion панели
 * @param {string} panelId - ID панели
 * @example
 * toggleAccordion('linkedTriggersPanel');
 */
export function toggleAccordion(panelId) {
    const panel = document.getElementById(panelId);

    if (!panel) {
        console.warn(`toggleAccordion: панель #${panelId} не найдена`);
        return;
    }

    panel.classList.toggle('collapsed');
}
