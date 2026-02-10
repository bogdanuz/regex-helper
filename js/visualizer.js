// ============================================================================
// ФАЙЛ: js/visualizer.js
// ОПИСАНИЕ: Визуализатор regex с railroad-diagrams.js (УЛУЧШЕННЫЙ ПАРСЕР)
// ВЕРСИЯ: 4.1 (проверка готовности библиотеки + объединение литералов)
// ДАТА: 10.02.2026
// ============================================================================

/*
 * ВИЗУАЛИЗАТОР REGEX - ПРАВИЛЬНАЯ РЕАЛИЗАЦИЯ
 * 
 * Использует railroad-diagrams.js от Tab Atkins (GitHub gh-pages)
 * КЛЮЧЕВЫЕ УЛУЧШЕНИЯ:
 * - Проверка готовности библиотеки (асинхронная загрузка ES6)
 * - Объединение последовательных литералов
 * - Правильный парсинг групп и альтернаций
 * 
 * Функции:
 * - visualizeRegex(regex) - главная функция
 * - parseRegex(regex) - парсер с объединением литералов
 * - astToRailroad(ast) - конвертация в railroad элементы
 */

// ============================================================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================================================

let currentDiagram = null;
let currentScale = 1.0;
let currentRegex = '';
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let scrollLeft = 0;
let scrollTop = 0;

// ============================================================================
// ПРОВЕРКА ГОТОВНОСТИ БИБЛИОТЕКИ RAILROAD
// ============================================================================

let railroadReady = false;
let railroadCheckAttempts = 0;
const MAX_ATTEMPTS = 50; // 5 секунд (50 * 100ms)

// Проверяем каждые 100ms, пока библиотека не загрузится
const checkRailroad = setInterval(() => {
    railroadCheckAttempts++;
    
    if (typeof Diagram !== 'undefined' && 
        typeof Terminal !== 'undefined' && 
        typeof Sequence !== 'undefined' &&
        typeof Choice !== 'undefined' &&
        typeof Optional !== 'undefined') {
        
        railroadReady = true;
        clearInterval(checkRailroad);
        console.log('[Visualizer] ✅ Railroad библиотека готова');
        console.log('[Visualizer] Доступные функции:', {
            Diagram: typeof Diagram,
            Terminal: typeof Terminal,
            Sequence: typeof Sequence,
            Choice: typeof Choice,
            Optional: typeof Optional,
            OneOrMore: typeof OneOrMore,
            ZeroOrMore: typeof ZeroOrMore,
            NonTerminal: typeof NonTerminal,
            Comment: typeof Comment,
            Skip: typeof Skip,
            Stack: typeof Stack
        });
        
    } else if (railroadCheckAttempts >= MAX_ATTEMPTS) {
        clearInterval(checkRailroad);
        console.error('[Visualizer] ❌ Railroad библиотека не загрузилась за 5 секунд');
        console.error('[Visualizer] Проверьте:', {
            Diagram: typeof Diagram,
            Terminal: typeof Terminal
        });
    }
}, 100);

// ============================================================================
// ГЛАВНАЯ ФУНКЦИЯ ВИЗУАЛИЗАЦИИ
// ============================================================================

/**
 * Визуализация regex
 */
function visualizeRegex(regex) {
    try {
        clearDiagram();
        
        if (!regex || regex.trim() === '') {
            showToast('error', 'Введите regex для визуализации');
            return;
        }
        
        // Проверка валидности
        try {
            new RegExp(regex);
        } catch (e) {
            showToast('error', 'Невалидный regex: ' + e.message);
            return;
        }
        
        // ПРОВЕРКА ГОТОВНОСТИ БИБЛИОТЕКИ
        if (!railroadReady) {
            console.log('[Visualizer] Библиотека еще загружается, попытка:', railroadCheckAttempts);
            showToast('warning', 'Библиотека загружается, подождите...');
            
            // Повторная попытка через 500ms
            setTimeout(() => visualizeRegex(regex), 500);
            return;
        }
        
        // Проверка наличия функций
        if (typeof Diagram === 'undefined') {
            showToast('error', 'Библиотека railroad-diagrams не загружена');
            console.error('[Visualizer] Diagram не определен');
            return;
        }
        
        currentRegex = regex;
        
        // ПАРСИНГ С ОБЪЕДИНЕНИЕМ ЛИТЕРАЛОВ
        console.log('[Visualizer] Парсинг regex:', regex);
        const ast = parseRegex(regex);
        console.log('[Visualizer] AST:', ast);
        
        // КОНВЕРТАЦИЯ В RAILROAD
        const railroadElements = astToRailroad(ast);
        console.log('[Visualizer] Railroad elements:', railroadElements);
        
        // СОЗДАНИЕ ДИАГРАММЫ
        const diagram = Diagram(railroadElements);
        
        // РЕНДЕРИНГ
        const container = document.getElementById('diagramContainer');
        const svgString = diagram.toString();
        container.innerHTML = svgString;
        
        currentDiagram = container.querySelector('svg');
        
        // Применяем стили
        if (currentDiagram) {
            applyCustomStyles(currentDiagram);
            currentDiagram.style.transform = `scale(${currentScale})`;
            currentDiagram.style.transformOrigin = 'top left';
        }
        
        // Drag & scroll
        enableDragAndScroll(container);
        
        showToast('success', 'Диаграмма построена успешно');
        
    } catch (error) {
        console.error('[Visualizer] Ошибка визуализации:', error);
        console.error('[Visualizer] Stack:', error.stack);
        showToast('error', 'Ошибка: ' + error.message);
    }
}

// ============================================================================
// УЛУЧШЕННЫЙ ПАРСЕР (ОБЪЕДИНЯЕТ ЛИТЕРАЛЫ!)
// ============================================================================

/**
 * Парсинг regex с объединением последовательных литералов
 */
function parseRegex(regex) {
    let position = 0;
    
    function peek() { return regex[position]; }
    function consume() { return regex[position++]; }
    function isEnd() { return position >= regex.length; }
    
    // ГЛАВНАЯ ФУНКЦИЯ: Парсинг с объединением
    function parseSequence() {
        const items = [];
        
        while (!isEnd() && peek() !== ')' && peek() !== '|') {
            const item = parseItem();
            if (item) items.push(item);
        }
        
        // КЛЮЧЕВОЕ УЛУЧШЕНИЕ: Объединяем последовательные литералы
        const merged = mergeLiterals(items);
        
        return merged.length === 1 ? merged[0] : { type: 'sequence', items: merged };
    }
    
    /**
     * ОБЪЕДИНЕНИЕ ПОСЛЕДОВАТЕЛЬНЫХ ЛИТЕРАЛОВ
     * ["д", "р", "о", "н"] → "дрон"
     */
    function mergeLiterals(items) {
        const result = [];
        let literalBuffer = '';
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            // Если это простой литерал (проверяем, что следующий элемент не квантификатор)
            if (item.type === 'literal') {
                // Проверяем следующий элемент
                const nextItem = items[i + 1];
                const isNextQuantifier = nextItem && 
                    (nextItem.type === 'zero-or-more' || 
                     nextItem.type === 'one-or-more' || 
                     nextItem.type === 'optional' ||
                     nextItem.type === 'repeat');
                
                if (!isNextQuantifier) {
                    literalBuffer += item.value;
                } else {
                    // Сбрасываем буфер перед квантификатором
                    if (literalBuffer) {
                        result.push({ type: 'literal', value: literalBuffer });
                        literalBuffer = '';
                    }
                    result.push(item);
                }
            } else {
                // Сбрасываем буфер
                if (literalBuffer) {
                    result.push({ type: 'literal', value: literalBuffer });
                    literalBuffer = '';
                }
                result.push(item);
            }
        }
        
        // Добавляем остаток
        if (literalBuffer) {
            result.push({ type: 'literal', value: literalBuffer });
        }
        
        return result;
    }
    
    function parseItem() {
        let item = parseAtom();
        if (!item) return null;
        
        // Квантификаторы
        const ch = peek();
        if (ch === '*') {
            consume();
            return { type: 'zero-or-more', item };
        } else if (ch === '+') {
            consume();
            return { type: 'one-or-more', item };
        } else if (ch === '?') {
            consume();
            return { type: 'optional', item };
        } else if (ch === '{') {
            const quant = parseQuantifier();
            return { type: 'repeat', item, quantifier: quant };
        }
        
        return item;
    }
    
    function parseAtom() {
        const ch = peek();
        
        if (ch === '(') return parseGroup();
        if (ch === '[') return parseCharClass();
        if (ch === '|') { consume(); return { type: 'or' }; }
        if (ch === '.') { consume(); return { type: 'any' }; }
        if (ch === '^') { consume(); return { type: 'anchor-start' }; }
        if (ch === '$') { consume(); return { type: 'anchor-end' }; }
        
        if (ch === '\\') {
            consume();
            const next = consume();
            return { type: 'escape', value: '\\' + next };
        }
        
        if (ch && ch !== ')' && ch !== '|') {
            return { type: 'literal', value: consume() };
        }
        
        return null;
    }
    
    function parseGroup() {
        consume(); // (
        
        let nonCapturing = false;
        let lookahead = false;
        let lookbehind = false;
        let negative = false;
        
        if (peek() === '?') {
            consume();
            const type = peek();
            if (type === ':') { consume(); nonCapturing = true; }
            else if (type === '=') { consume(); lookahead = true; }
            else if (type === '!') { consume(); lookahead = true; negative = true; }
            else if (type === '<') {
                consume();
                if (peek() === '=') { consume(); lookbehind = true; }
                else if (peek() === '!') { consume(); lookbehind = true; negative = true; }
            }
        }
        
        const alternatives = [];
        let current = [];
        
        while (!isEnd() && peek() !== ')') {
            if (peek() === '|') {
                consume();
                if (current.length > 0) {
                    const merged = mergeLiterals(current);
                    alternatives.push(merged.length === 1 ? merged[0] : { type: 'sequence', items: merged });
                    current = [];
                }
            } else {
                const item = parseItem();
                if (item) current.push(item);
            }
        }
        
        if (current.length > 0) {
            const merged = mergeLiterals(current);
            alternatives.push(merged.length === 1 ? merged[0] : { type: 'sequence', items: merged });
        }
        
        consume(); // )
        
        const content = alternatives.length > 1 
            ? { type: 'choice', alternatives } 
            : alternatives[0];
        
        return {
            type: 'group',
            nonCapturing,
            lookahead,
            lookbehind,
            negative,
            content
        };
    }
    
    function parseCharClass() {
        consume(); // [
        let negated = peek() === '^';
        if (negated) consume();
        
        let chars = '';
        while (!isEnd() && peek() !== ']') {
            if (peek() === '\\') {
                chars += consume();
                chars += consume();
            } else {
                chars += consume();
            }
        }
        consume(); // ]
        
        return { type: 'char-class', value: chars, negated };
    }
    
    function parseQuantifier() {
        consume(); // {
        let q = '';
        while (!isEnd() && peek() !== '}') {
            q += consume();
        }
        consume(); // }
        return '{' + q + '}';
    }
    
    // ГЛАВНЫЙ ПАРСИНГ
    const alternatives = [];
    let current = [];
    
    while (!isEnd()) {
        if (peek() === '|') {
            consume();
            if (current.length > 0) {
                const merged = mergeLiterals(current);
                alternatives.push(merged.length === 1 ? merged[0] : { type: 'sequence', items: merged });
                current = [];
            }
        } else {
            const item = parseItem();
            if (item) current.push(item);
        }
    }
    
    if (current.length > 0) {
        const merged = mergeLiterals(current);
        alternatives.push(merged.length === 1 ? merged[0] : { type: 'sequence', items: merged });
    }
    
    if (alternatives.length > 1) {
        return { type: 'choice', alternatives };
    } else if (alternatives.length === 1) {
        return alternatives[0];
    }
    
    return { type: 'empty' };
}

// ============================================================================
// КОНВЕРТАЦИЯ AST → RAILROAD ЭЛЕМЕНТЫ
// ============================================================================

/**
 * Конвертация AST в railroad-diagrams элементы
 */
function astToRailroad(node) {
    if (!node) return Skip();
    
    switch (node.type) {
        case 'literal':
            // Теперь value - это целая строка, не одна буква!
            return Terminal(node.value);
        
        case 'escape':
            return NonTerminal(getEscapeLabel(node.value));
        
        case 'any':
            return NonTerminal('any character');
        
        case 'anchor-start':
            return NonTerminal('start of line');
        
        case 'anchor-end':
            return NonTerminal('end of line');
        
        case 'char-class':
            return renderCharClass(node);
        
        case 'sequence':
            return Sequence(...node.items.map(astToRailroad));
        
        case 'choice':
            return Choice(0, ...node.alternatives.map(astToRailroad));
        
        case 'optional':
            return Optional(astToRailroad(node.item));
        
        case 'zero-or-more':
            return ZeroOrMore(astToRailroad(node.item));
        
        case 'one-or-more':
            return OneOrMore(astToRailroad(node.item));
        
        case 'repeat':
            return Sequence(
                Comment(node.quantifier),
                astToRailroad(node.item)
            );
        
        case 'group':
            return renderGroup(node);
        
        case 'empty':
            return Skip();
        
        default:
            console.warn('[Visualizer] Неизвестный тип узла:', node.type);
            return Terminal('?');
    }
}

/**
 * Рендеринг класса символов
 */
function renderCharClass(node) {
    const prefix = node.negated ? 'None of' : 'One of';
    const chars = node.value;
    
    // Разбиваем на отдельные элементы
    const items = parseCharClassItems(chars);
    
    if (items.length <= 5) {
        return Stack(
            Comment(prefix),
            Choice(0, ...items.map(ch => Terminal(ch)))
        );
    } else {
        return NonTerminal(`${prefix}: ${chars}`);
    }
}

/**
 * Рендеринг группы
 */
function renderGroup(node) {
    let label = 'group';
    if (node.nonCapturing) label = 'non-capturing (?:)';
    else if (node.lookahead) label = node.negative ? 'negative lookahead (?!)' : 'positive lookahead (?=)';
    else if (node.lookbehind) label = node.negative ? 'negative lookbehind (?<!)' : 'positive lookbehind (?<=)';
    
    return Stack(
        Comment(label),
        astToRailroad(node.content)
    );
}

/**
 * Разбор элементов класса символов
 */
function parseCharClassItems(chars) {
    const items = [];
    let i = 0;
    
    while (i < chars.length) {
        if (chars[i] === '\\' && i + 1 < chars.length) {
            items.push(chars[i] + chars[i + 1]);
            i += 2;
        } else if (i + 2 < chars.length && chars[i + 1] === '-') {
            items.push(chars[i] + '-' + chars[i + 2]);
            i += 3;
        } else {
            items.push(chars[i]);
            i++;
        }
    }
    
    return items;
}

/**
 * Метки для escape последовательностей
 */
function getEscapeLabel(escape) {
    const labels = {
        '\\d': 'digit [0-9]',
        '\\D': 'not digit',
        '\\w': 'word [a-zA-Z0-9_]',
        '\\W': 'not word',
        '\\s': 'whitespace',
        '\\S': 'not whitespace',
        '\\b': 'word boundary',
        '\\B': 'not boundary',
        '\\n': 'line feed',
        '\\r': 'carriage return',
        '\\t': 'tab',
        '\\0': 'null'
    };
    return labels[escape] || escape;
}

// ============================================================================
// СТИЛИЗАЦИЯ
// ============================================================================

/**
 * Применение кастомных стилей (как на regexper.com)
 */
function applyCustomStyles(svg) {
    svg.style.background = '#fff';
    svg.style.padding = '20px';
    
    // Пути
    const paths = svg.querySelectorAll('path');
    paths.forEach(path => {
        path.setAttribute('stroke', '#000');
        path.setAttribute('stroke-width', '2');
    });
    
    // Текст
    const texts = svg.querySelectorAll('text');
    texts.forEach(text => {
        text.setAttribute('font-family', 'Monaco, Menlo, Consolas, monospace');
        text.setAttribute('font-size', '14');
        text.setAttribute('fill', '#000');
    });
    
    // Терминалы (литералы) - зеленый
    const terminals = svg.querySelectorAll('g.terminal rect');
    terminals.forEach(rect => {
        rect.setAttribute('fill', '#dae9e5');
        rect.setAttribute('stroke', '#6b9080');
        rect.setAttribute('stroke-width', '2');
        rect.setAttribute('rx', '5');
    });
    
    // NonTerminal (escape) - желто-зеленый
    const nonTerminals = svg.querySelectorAll('g.non-terminal rect');
    nonTerminals.forEach(rect => {
        rect.setAttribute('fill', '#bada55');
        rect.setAttribute('stroke', '#769b3b');
        rect.setAttribute('stroke-width', '2');
        rect.setAttribute('rx', '5');
    });
    
    // Комментарии (метки) - серый
    const comments = svg.querySelectorAll('g.comment text');
    comments.forEach(text => {
        text.setAttribute('fill', '#666');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-style', 'italic');
    });
}

// ============================================================================
// DRAG & SCROLL
// ============================================================================

function enableDragAndScroll(container) {
    container.style.cursor = 'grab';
    container.style.overflow = 'auto';
    
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStartX = e.pageX - container.offsetLeft;
        dragStartY = e.pageY - container.offsetTop;
        scrollLeft = container.scrollLeft;
        scrollTop = container.scrollTop;
        container.style.cursor = 'grabbing';
        e.preventDefault();
    });
    
    container.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const y = e.pageY - container.offsetTop;
        const walkX = (x - dragStartX) * 1.5;
        const walkY = (y - dragStartY) * 1.5;
        container.scrollLeft = scrollLeft - walkX;
        container.scrollTop = scrollTop - walkY;
    });
    
    container.addEventListener('mouseup', () => {
        isDragging = false;
        container.style.cursor = 'grab';
    });
    
    container.addEventListener('mouseleave', () => {
        isDragging = false;
        container.style.cursor = 'grab';
    });
    
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        container.scrollLeft += e.deltaX;
        container.scrollTop += e.deltaY;
    }, { passive: false });
}

// ============================================================================
// МОДАЛЬНОЕ ОКНО
// ============================================================================

function openFullscreen() {
    if (!currentDiagram) {
        showToast('warning', 'Сначала создайте диаграмму');
        return;
    }
    
    const modal = document.createElement('div');
    modal.id = 'fullscreenModal';
    modal.className = 'fullscreen-modal';
    modal.innerHTML = `
        <div class="fullscreen-content">
            <div class="fullscreen-header">
                <h3>📊 Визуализация Regex</h3>
                <div class="fullscreen-controls">
                    <button class="fs-btn" onclick="fullscreenZoom(1.2)">🔍+ Увеличить</button>
                    <button class="fs-btn" onclick="fullscreenZoom(0.8)">🔍− Уменьшить</button>
                    <button class="fs-btn" onclick="fullscreenZoom(1, true)">🔄 Сброс</button>
                    <button class="fullscreen-close-btn" onclick="closeFullscreen()">✕ Закрыть</button>
                </div>
            </div>
            <div class="fullscreen-diagram" id="fullscreenDiagram"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const diagramClone = currentDiagram.cloneNode(true);
    diagramClone.style.transform = '';
    
    const fullscreenDiagram = document.getElementById('fullscreenDiagram');
    fullscreenDiagram.appendChild(diagramClone);
    
    enableDragAndScroll(fullscreenDiagram);
    document.body.style.overflow = 'hidden';
}

function closeFullscreen() {
    const modal = document.getElementById('fullscreenModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

function fullscreenZoom(scale, reset = false) {
    const diagram = document.querySelector('#fullscreenDiagram svg');
    if (!diagram) return;
    
    let fsScale = parseFloat(diagram.dataset.scale || '1.0');
    
    if (reset) {
        fsScale = 1.0;
    } else {
        fsScale *= scale;
        fsScale = Math.max(0.3, Math.min(fsScale, 5.0));
    }
    
    diagram.dataset.scale = fsScale;
    diagram.style.transform = `scale(${fsScale})`;
    diagram.style.transformOrigin = 'top left';
    
    showToast('info', `Масштаб: ${Math.round(fsScale * 100)}%`);
}

// ============================================================================
// ЭКСПОРТ
// ============================================================================

function exportSVG() {
    if (!currentDiagram) {
        showToast('warning', 'Сначала создайте диаграмму');
        return;
    }
    
    try {
        const svgClone = currentDiagram.cloneNode(true);
        svgClone.style.transform = '';
        
        const svgContent = new XMLSerializer().serializeToString(svgClone);
        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `regex-diagram-${Date.now()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast('success', 'SVG экспортирован');
    } catch (error) {
        console.error('[Visualizer] Ошибка экспорта SVG:', error);
        showToast('error', 'Ошибка экспорта SVG');
    }
}

function exportPNG() {
    if (!currentDiagram) {
        showToast('warning', 'Сначала создайте диаграмму');
        return;
    }
    
    try {
        const svgClone = currentDiagram.cloneNode(true);
        svgClone.style.transform = '';
        
        const bbox = currentDiagram.getBBox();
        const width = bbox.width + 40;
        const height = bbox.height + 40;
        
        svgClone.setAttribute('width', width);
        svgClone.setAttribute('height', height);
        
        const svgData = new XMLSerializer().serializeToString(svgClone);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        const img = new Image();
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = width * 2;
            canvas.height = height * 2;
            
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.scale(2, 2);
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob(function(blob) {
                const pngUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = pngUrl;
                link.download = `regex-diagram-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                URL.revokeObjectURL(pngUrl);
                
                showToast('success', 'PNG экспортирован');
            }, 'image/png');
        };
        
        img.onerror = function() {
            showToast('error', 'Ошибка конвертации SVG в PNG');
            URL.revokeObjectURL(url);
        };
        
        img.src = url;
        
    } catch (error) {
        console.error('[Visualizer] Ошибка экспорта PNG:', error);
        showToast('error', 'Ошибка экспорта PNG');
    }
}

// ============================================================================
// МАСШТАБИРОВАНИЕ
// ============================================================================

function zoomDiagram(scale) {
    if (!currentDiagram) {
        showToast('warning', 'Сначала создайте диаграмму');
        return;
    }
    
    currentScale *= scale;
    currentScale = Math.max(0.3, Math.min(currentScale, 3.0));
    
    currentDiagram.style.transform = `scale(${currentScale})`;
    currentDiagram.style.transformOrigin = 'top left';
    
    showToast('info', `Масштаб: ${Math.round(currentScale * 100)}%`);
}

// ============================================================================
// ОЧИСТКА
// ============================================================================

function clearDiagram() {
    const container = document.getElementById('diagramContainer');
    if (container) {
        container.innerHTML = '';
        container.style.cursor = '';
    }
    currentDiagram = null;
    currentRegex = '';
    currentScale = 1.0;
}

// ============================================================================
// КОНЕЦ ФАЙЛА
// ============================================================================
