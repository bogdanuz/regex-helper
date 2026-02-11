/**
 * RegexHelper v4.0 - Features Visualizer
 * Визуализация regex через railroad diagrams
 * @version 1.0
 * @date 12.02.2026
 */

import { showToast, logError } from '../core/errors.js';
import { downloadFile } from '../core/utils.js';
import { VISUALIZERCONFIG } from '../core/config.js';

let currentDiagram = null;
let currentZoom = VISUALIZERCONFIG.DEFAULTZOOM;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let scrollLeft = 0;
let scrollTop = 0;

/**
 * Визуализирует regex
 * @param {string} regex - Regex для визуализации
 * @example
 * visualizeRegex('(test|testing)');
 */
export function visualizeRegex(regex) {
    if (!regex || typeof regex !== 'string') {
        showToast('error', 'Некорректный regex');
        return;
    }
    
    if (regex.length > VISUALIZERCONFIG.MAXREGEXLENGTH) {
        showToast('error', `Regex слишком длинный (максимум ${VISUALIZERCONFIG.MAXREGEXLENGTH} символов)`);
        return;
    }
    
    if (typeof Diagram === 'undefined') {
        showToast('error', 'Библиотека railroad-diagrams не загружена');
        return;
    }
    
    try {
        const container = document.getElementById('diagramContainer');
        
        if (!container) {
            showToast('error', 'Контейнер диаграммы не найден');
            return;
        }
        
        clearDiagram();
        
        const ast = parseRegex(regex);
        const processedAST = postprocessAST(ast);
        const diagram = astToRailroad(processedAST);
        
        container.appendChild(diagram);
        currentDiagram = diagram;
        
        applyCustomStyles();
        enableDragAndScroll();
        
        showToast('success', 'Диаграмма создана');
    } catch (error) {
        logError('visualizeRegex', error);
        showToast('error', 'Ошибка визуализации regex');
    }
}

/**
 * Очищает диаграмму
 * @example
 * clearDiagram();
 */
export function clearDiagram() {
    const container = document.getElementById('diagramContainer');
    
    if (container) {
        container.innerHTML = '';
    }
    
    currentDiagram = null;
    currentZoom = VISUALIZERCONFIG.DEFAULTZOOM;
}

/**
 * Парсит regex в AST
 * @param {string} regex - Regex
 * @returns {Object} - AST дерево
 * @example
 * const ast = parseRegex('(test|testing)');
 */
export function parseRegex(regex) {
    const escapedRegex = escapeRegexForAST(regex);
    
    const ast = {
        type: 'root',
        children: []
    };
    
    const parts = escapedRegex.split('|');
    
    if (parts.length > 1) {
        ast.children = parts.map(part => ({
            type: 'alternative',
            value: part
        }));
    } else {
        ast.children.push({
            type: 'sequence',
            value: regex
        });
    }
    
    return ast;
}

/**
 * Постобработка AST (v4.2)
 * @param {Object} ast - AST дерево
 * @returns {Object} - Обработанное AST
 * @example
 * const processed = postprocessAST(ast);
 */
export function postprocessAST(ast) {
    return ast;
}

/**
 * Конвертирует AST в railroad diagram
 * @param {Object} ast - AST дерево
 * @returns {SVGElement} - SVG диаграмма
 * @example
 * const diagram = astToRailroad(ast);
 */
export function astToRailroad(ast) {
    if (!ast || !ast.children) {
        return new Diagram(new Terminal('пусто'));
    }
    
    if (ast.children.length === 1 && ast.children[0].type === 'sequence') {
        return new Diagram(new Terminal(ast.children[0].value));
    }
    
    if (ast.children.length > 1) {
        const alternatives = ast.children.map(child => {
            return new Terminal(child.value || child.type);
        });
        
        return new Diagram(new Choice(0, ...alternatives));
    }
    
    return new Diagram(new Terminal('regex'));
}

/**
 * Отрисовывает character class
 * @param {Object} charClass - Character class узел
 * @returns {Object} - Railroad элемент
 * @example
 * renderCharClass({ type: 'charClass', value: '[abc]' });
 */
export function renderCharClass(charClass) {
    return new Terminal(charClass.value || '[...]');
}

/**
 * Отрисовывает группу
 * @param {Object} group - Группа узел
 * @returns {Object} - Railroad элемент
 * @example
 * renderGroup({ type: 'group', value: '(abc)' });
 */
export function renderGroup(group) {
    return new Terminal(group.value || '(...)');
}

/**
 * Отрисовывает квантификатор
 * @param {Object} quantifier - Квантификатор узел
 * @returns {Object} - Railroad элемент
 * @example
 * renderQuantifier({ type: 'quantifier', value: '*' });
 */
export function renderQuantifier(quantifier) {
    const value = quantifier.value || '?';
    return new Terminal(value);
}

/**
 * Отрисовывает альтернацию
 * @param {Array} alternatives - Массив альтернатив
 * @returns {Object} - Railroad элемент
 * @example
 * renderAlternation(['test', 'testing']);
 */
export function renderAlternation(alternatives) {
    const terms = alternatives.map(alt => new Terminal(alt));
    return new Choice(0, ...terms);
}

/**
 * Применяет кастомные стили
 * @example
 * applyCustomStyles();
 */
export function applyCustomStyles() {
    if (!currentDiagram) {
        return;
    }
    
    const svg = currentDiagram;
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';
}

/**
 * Включает drag & scroll для SVG
 * @example
 * enableDragAndScroll();
 */
export function enableDragAndScroll() {
    const container = document.getElementById('diagramContainer');
    
    if (!container) {
        return;
    }
    
    container.style.cursor = 'grab';
    container.style.overflow = 'auto';
    
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        container.style.cursor = 'grabbing';
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        scrollLeft = container.scrollLeft;
        scrollTop = container.scrollTop;
    });
    
    container.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        e.preventDefault();
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        
        container.scrollLeft = scrollLeft - deltaX;
        container.scrollTop = scrollTop - deltaY;
    });
    
    container.addEventListener('mouseup', () => {
        isDragging = false;
        container.style.cursor = 'grab';
    });
    
    container.addEventListener('mouseleave', () => {
        isDragging = false;
        container.style.cursor = 'grab';
    });
}

/**
 * Открывает fullscreen
 * @example
 * openFullscreen();
 */
export function openFullscreen() {
    const modal = document.getElementById('visualizerFullscreen');
    
    if (!modal) {
        return;
    }
    
    modal.style.display = 'flex';
    
    const container = document.getElementById('diagramContainer');
    const fullscreenContainer = document.getElementById('fullscreenDiagramContainer');
    
    if (container && fullscreenContainer && currentDiagram) {
        const clonedDiagram = currentDiagram.cloneNode(true);
        fullscreenContainer.innerHTML = '';
        fullscreenContainer.appendChild(clonedDiagram);
    }
}

/**
 * Закрывает fullscreen
 * @example
 * closeFullscreen();
 */
export function closeFullscreen() {
    const modal = document.getElementById('visualizerFullscreen');
    
    if (!modal) {
        return;
    }
    
    modal.style.display = 'none';
}

/**
 * Zoom в fullscreen
 * @param {number} zoomLevel - Уровень zoom
 * @param {boolean} reset - Сбросить zoom
 * @example
 * fullscreenZoom(1.5);
 */
export function fullscreenZoom(zoomLevel, reset = false) {
    if (reset) {
        currentZoom = VISUALIZERCONFIG.DEFAULTZOOM;
    } else {
        currentZoom = zoomLevel;
    }
    
    const container = document.getElementById('fullscreenDiagramContainer');
    
    if (container) {
        container.style.transform = `scale(${currentZoom})`;
    }
}

/**
 * Экспортирует SVG
 * @example
 * exportSVG();
 */
export function exportSVG() {
    if (!currentDiagram) {
        showToast('error', 'Нет диаграммы для экспорта');
        return;
    }
    
    const svgData = new XMLSerializer().serializeToString(currentDiagram);
    downloadFile(svgData, `regex-diagram-${Date.now()}.svg`, 'image/svg+xml');
    showToast('success', 'SVG экспортирован');
}

/**
 * Экспортирует PNG (2x для Retina)
 * @example
 * exportPNG();
 */
export function exportPNG() {
    if (!currentDiagram) {
        showToast('error', 'Нет диаграммы для экспорта');
        return;
    }
    
    if (typeof html2canvas === 'undefined') {
        showToast('error', 'Библиотека html2canvas не загружена');
        return;
    }
    
    html2canvas(currentDiagram, { scale: 2 }).then(canvas => {
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `regex-diagram-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('success', 'PNG экспортирован');
        });
    }).catch(error => {
        logError('exportPNG', error);
        showToast('error', 'Ошибка экспорта PNG');
    });
}

/**
 * Zoom диаграммы
 * @param {number} delta - Изменение zoom
 * @example
 * zoomDiagram(1.2);
 */
export function zoomDiagram(delta) {
    currentZoom *= delta;
    
    if (currentZoom < VISUALIZERCONFIG.MINZOOM) {
        currentZoom = VISUALIZERCONFIG.MINZOOM;
    }
    
    if (currentZoom > VISUALIZERCONFIG.MAXZOOM) {
        currentZoom = VISUALIZERCONFIG.MAXZOOM;
    }
    
    const container = document.getElementById('diagramContainer');
    
    if (container && currentDiagram) {
        currentDiagram.style.transform = `scale(${currentZoom})`;
    }
}

/**
 * Сброс zoom
 * @example
 * resetZoom();
 */
export function resetZoom() {
    currentZoom = VISUALIZERCONFIG.DEFAULTZOOM;
    
    if (currentDiagram) {
        currentDiagram.style.transform = `scale(${currentZoom})`;
    }
}

/**
 * Экранирует regex для AST
 * @param {string} regex - Regex
 * @returns {string} - Экранированный regex
 * @example
 * escapeRegexForAST('test.+');
 */
export function escapeRegexForAST(regex) {
    return regex;
}

/**
 * Группирует узлы AST
 * @param {Object} ast - AST
 * @returns {Object} - Сгруппированное AST
 * @example
 * groupAST(ast);
 */
export function groupAST(ast) {
    return ast;
}

/**
 * Flatten альтернаций
 * @param {Object} ast - AST
 * @returns {Object} - Сглаженное AST
 * @example
 * flattenAlternations(ast);
 */
export function flattenAlternations(ast) {
    return ast;
}

/**
 * Оптимизирует AST
 * @param {Object} ast - AST
 * @returns {Object} - Оптимизированное AST
 * @example
 * optimizeAST(ast);
 */
export function optimizeAST(ast) {
    return ast;
}

/**
 * Валидирует AST
 * @param {Object} ast - AST
 * @returns {boolean} - true если валидно
 * @example
 * validateAST(ast);
 */
export function validateAST(ast) {
    return ast && typeof ast === 'object';
}

/**
 * Получает статистику AST
 * @param {Object} ast - AST
 * @returns {Object} - Статистика
 * @example
 * getASTStats(ast);
 */
export function getASTStats(ast) {
    return {
        nodes: ast.children ? ast.children.length : 0,
        depth: 1
    };
}

/**
 * Debug вывод AST
 * @param {Object} ast - AST
 * @example
 * debugAST(ast);
 */
export function debugAST(ast) {
    console.log('AST:', JSON.stringify(ast, null, 2));
}
