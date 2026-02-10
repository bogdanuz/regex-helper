// ============================================================================
// ФАЙЛ: js/visualizer.js
// ОПИСАНИЕ: Визуализатор regex с railroad diagrams
// ВЕРСИЯ: 2.0 (улучшенная визуализация, без объяснения)
// ДАТА: 10.02.2026
// ============================================================================

/*
 * ВИЗУАЛИЗАТОР REGEX
 * 
 * Функции:
 * - parseRegex(regex) - парсинг regex → AST
 * - renderDiagram(ast) - рендеринг railroad diagram (SVG)
 * - exportSVG() - экспорт диаграммы в SVG
 * - exportPNG() - конвертация SVG → PNG (исправлено)
 * - setupInteractivity() - hover, клик на элементы
 * - clearDiagram() - очистка
 * - zoomDiagram(scale) - масштабирование
 * 
 * Зависимости: errors.js, lib/railroad-diagrams.js
 */

// ============================================================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================================================

let currentDiagram = null;
let currentScale = 1.0;
let currentRegex = '';

// ============================================================================
// ОСНОВНАЯ ФУНКЦИЯ ВИЗУАЛИЗАЦИИ
// ============================================================================

/**
 * Главная функция визуализации regex
 * @param {string} regex - регулярное выражение для визуализации
 */
function visualizeRegex(regex) {
    try {
        // Очистка предыдущей диаграммы
        clearDiagram();
        
        // Валидация
        if (!regex || regex.trim() === '') {
            showToast('error', 'Введите regex для визуализации');
            return;
        }
        
        // Проверка валидности regex
        try {
            new RegExp(regex);
        } catch (e) {
            showToast('error', 'Невалидный regex: ' + e.message);
            return;
        }
        
        // Сохранение текущего regex
        currentRegex = regex;
        
        // Парсинг regex
        const ast = parseRegex(regex);
        
        // Рендеринг диаграммы
        renderDiagram(ast);
        
        // Настройка интерактивности
        setupInteractivity();
        
        showToast('success', 'Диаграмма построена успешно');
        
    } catch (error) {
        console.error('Ошибка визуализации:', error);
        showToast('error', 'Ошибка визуализации: ' + error.message);
    }
}

// ============================================================================
// ПАРСИНГ REGEX
// ============================================================================

/**
 * Парсинг regex в AST (Abstract Syntax Tree)
 * @param {string} regex - регулярное выражение
 * @returns {Object} AST дерево
 */
function parseRegex(regex) {
    let position = 0;
    
    function peek() {
        return regex[position];
    }
    
    function consume() {
        return regex[position++];
    }
    
    function parseSequence() {
        const items = [];
        
        while (position < regex.length && peek() !== ')' && peek() !== '|') {
            items.push(parseItem());
        }
        
        return items.length === 1 ? items[0] : { type: 'sequence', items };
    }
    
    function parseItem() {
        let item = parseAtom();
        
        // Квантификаторы
        if (peek() === '*') {
            consume();
            return { type: 'zero-or-more', item };
        } else if (peek() === '+') {
            consume();
            return { type: 'one-or-more', item };
        } else if (peek() === '?') {
            consume();
            return { type: 'optional', item };
        } else if (peek() === '{') {
            const quantifier = parseQuantifier();
            return { type: 'repeat', item, quantifier };
        }
        
        return item;
    }
    
    function parseAtom() {
        const ch = peek();
        
        // Группа
        if (ch === '(') {
            return parseGroup();
        }
        
        // Класс символов
        if (ch === '[') {
            return parseCharClass();
        }
        
        // Альтернация на верхнем уровне
        if (ch === '|') {
            consume();
            return { type: 'or' };
        }
        
        // Специальные символы
        if (ch === '.') {
            consume();
            return { type: 'any', label: 'любой символ' };
        }
        
        if (ch === '^') {
            consume();
            return { type: 'start', label: 'начало строки' };
        }
        
        if (ch === '$') {
            consume();
            return { type: 'end', label: 'конец строки' };
        }
        
        // Escape последовательности
        if (ch === '\\') {
            consume();
            const next = consume();
            return { type: 'escape', value: '\\' + next, label: getEscapeLabel('\\' + next) };
        }
        
        // Обычный символ
        if (ch && ch !== ')' && ch !== '|') {
            return { type: 'literal', value: consume() };
        }
        
        return null;
    }
    
    function parseGroup() {
        consume(); // (
        
        let isNonCapturing = false;
        let isLookahead = false;
        let isLookbehind = false;
        let isNegative = false;
        
        // Проверка типа группы
        if (peek() === '?') {
            consume();
            const next = peek();
            if (next === ':') {
                consume();
                isNonCapturing = true;
            } else if (next === '=') {
                consume();
                isLookahead = true;
            } else if (next === '!') {
                consume();
                isLookahead = true;
                isNegative = true;
            } else if (next === '<') {
                consume();
                if (peek() === '=') {
                    consume();
                    isLookbehind = true;
                } else if (peek() === '!') {
                    consume();
                    isLookbehind = true;
                    isNegative = true;
                }
            }
        }
        
        // Парсинг альтернаций внутри группы
        const alternatives = [];
        let current = [];
        
        while (position < regex.length && peek() !== ')') {
            if (peek() === '|') {
                consume();
                alternatives.push(current.length === 1 ? current[0] : { type: 'sequence', items: current });
                current = [];
            } else {
                current.push(parseItem());
            }
        }
        
        if (current.length > 0) {
            alternatives.push(current.length === 1 ? current[0] : { type: 'sequence', items: current });
        }
        
        consume(); // )
        
        if (alternatives.length > 1) {
            return {
                type: 'group',
                nonCapturing: isNonCapturing,
                lookahead: isLookahead,
                lookbehind: isLookbehind,
                negative: isNegative,
                content: { type: 'choice', alternatives }
            };
        } else {
            return {
                type: 'group',
                nonCapturing: isNonCapturing,
                lookahead: isLookahead,
                lookbehind: isLookbehind,
                negative: isNegative,
                content: alternatives[0]
            };
        }
    }
    
    function parseCharClass() {
        consume(); // [
        let negated = false;
        let chars = '';
        
        if (peek() === '^') {
            consume();
            negated = true;
        }
        
        while (position < regex.length && peek() !== ']') {
            if (peek() === '\\') {
                chars += consume();
                chars += consume();
            } else {
                chars += consume();
            }
        }
        
        consume(); // ]
        
        return { 
            type: 'char-class', 
            value: '[' + (negated ? '^' : '') + chars + ']', 
            negated,
            label: negated ? 'не ' + chars : chars
        };
    }
    
    function parseQuantifier() {
        consume(); // {
        let quantifier = '{';
        
        while (position < regex.length && peek() !== '}') {
            quantifier += consume();
        }
        
        consume(); // }
        quantifier += '}';
        
        return quantifier;
    }
    
    // Парсинг альтернаций на верхнем уровне
    const alternatives = [];
    let current = [];
    
    while (position < regex.length) {
        if (peek() === '|') {
            consume();
            alternatives.push(current.length === 1 ? current[0] : { type: 'sequence', items: current });
            current = [];
        } else {
            const item = parseItem();
            if (item) current.push(item);
        }
    }
    
    if (current.length > 0) {
        alternatives.push(current.length === 1 ? current[0] : { type: 'sequence', items: current });
    }
    
    if (alternatives.length > 1) {
        return { type: 'choice', alternatives };
    } else if (alternatives.length === 1) {
        return alternatives[0];
    } else {
        return { type: 'empty' };
    }
}

/**
 * Получить читаемую метку для escape последовательности
 */
function getEscapeLabel(escape) {
    const labels = {
        '\\d': 'цифра',
        '\\D': 'не цифра',
        '\\w': 'слово',
        '\\W': 'не слово',
        '\\s': 'пробел',
        '\\S': 'не пробел',
        '\\b': 'граница',
        '\\B': 'не граница',
        '\\n': 'перенос',
        '\\r': 'возврат',
        '\\t': 'таб',
        '\\0': 'null'
    };
    
    return labels[escape] || escape;
}

// ============================================================================
// РЕНДЕРИНГ ДИАГРАММЫ (УЛУЧШЕННЫЙ)
// ============================================================================

/**
 * Рендеринг railroad diagram из AST
 * @param {Object} ast - AST дерево
 */
function renderDiagram(ast) {
    try {
        const container = document.getElementById('diagramContainer');
        if (!container) {
            throw new Error('Контейнер диаграммы не найден');
        }
        
        // Конвертация AST в railroad элементы
        const diagramElements = astToRailroad(ast);
        
        // Создание диаграммы
        const diagram = Diagram(diagramElements);
        
        // Рендеринг SVG
        const svgString = diagram.toString();
        container.innerHTML = svgString;
        
        // Сохранение текущей диаграммы
        currentDiagram = container.querySelector('svg');
        
        // Применение улучшенных стилей
        if (currentDiagram) {
            applyImprovedStyles(currentDiagram);
            currentDiagram.style.transform = `scale(${currentScale})`;
            currentDiagram.style.transformOrigin = 'top left';
        }
        
    } catch (error) {
        console.error('Ошибка рендеринга диаграммы:', error);
        throw error;
    }
}

/**
 * Применение улучшенных стилей к SVG (как на regexper.com)
 */
function applyImprovedStyles(svg) {
    // Фон
    svg.style.background = '#fff';
    svg.style.padding = '20px';
    svg.style.borderRadius = '8px';
    
    // Стили путей
    const paths = svg.querySelectorAll('path');
    paths.forEach(path => {
        path.setAttribute('stroke', '#000');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
    });
    
    // Стили текста
    const texts = svg.querySelectorAll('text');
    texts.forEach(text => {
        text.setAttribute('font-family', 'monospace');
        text.setAttribute('font-size', '14');
        text.setAttribute('fill', '#000');
    });
    
    // Стили прямоугольников (терминалы)
    const rects = svg.querySelectorAll('rect');
    rects.forEach(rect => {
        const parent = rect.parentElement;
        if (parent && parent.classList.contains('terminal')) {
            rect.setAttribute('fill', '#dae9e5');
            rect.setAttribute('stroke', '#6b9080');
            rect.setAttribute('stroke-width', '2');
            rect.setAttribute('rx', '4');
        } else if (parent && parent.classList.contains('non-terminal')) {
            rect.setAttribute('fill', '#cbdadb');
            rect.setAttribute('stroke', '#88a5b0');
            rect.setAttribute('stroke-width', '2');
            rect.setAttribute('rx', '4');
        }
    });
}

/**
 * Конвертация AST в railroad элементы
 * @param {Object} node - узел AST
 * @returns {Object} railroad элемент
 */
function astToRailroad(node) {
    if (!node) return Skip();
    
    switch (node.type) {
        case 'literal':
            return Terminal(node.value, {class: 'literal'});
        
        case 'escape':
            // Используем NonTerminal для escape последовательностей (синий фон)
            return NonTerminal(node.label || node.value, {class: 'escape'});
        
        case 'any':
            return NonTerminal(node.label || 'любой', {class: 'any'});
        
        case 'start':
            return NonTerminal(node.label || '^', {class: 'anchor'});
        
        case 'end':
            return NonTerminal(node.label || '$', {class: 'anchor'});
        
        case 'char-class':
            return NonTerminal(node.label || node.value, {class: 'char-class'});
        
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
                NonTerminal(node.quantifier),
                astToRailroad(node.item)
            );
        
        case 'group':
            const content = astToRailroad(node.content);
            let groupLabel = 'группа';
            
            if (node.nonCapturing) {
                groupLabel = '(?:)';
            } else if (node.lookahead) {
                groupLabel = node.negative ? '(?!)' : '(?=)';
            } else if (node.lookbehind) {
                groupLabel = node.negative ? '(?<!)' : '(?<=)';
            }
            
            return Sequence(
                NonTerminal(groupLabel),
                content
            );
        
        case 'empty':
            return Skip();
        
        default:
            return Terminal('?');
    }
}

// ============================================================================
// ЭКСПОРТ SVG
// ============================================================================

/**
 * Экспорт диаграммы в SVG файл
 */
function exportSVG() {
    try {
        if (!currentDiagram) {
            showToast('warning', 'Сначала создайте диаграмму');
            return;
        }
        
        // Клонируем SVG для экспорта
        const svgClone = currentDiagram.cloneNode(true);
        
        // Удаляем transform для экспорта
        svgClone.style.transform = '';
        
        // Получение SVG content
        const svgContent = new XMLSerializer().serializeToString(svgClone);
        
        // Создание blob
        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        
        // Создание ссылки для скачивания
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `regex-diagram-${Date.now()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Освобождение памяти
        URL.revokeObjectURL(url);
        
        showToast('success', 'SVG экспортирован');
        
    } catch (error) {
        console.error('Ошибка экспорта SVG:', error);
        showToast('error', 'Ошибка экспорта SVG: ' + error.message);
    }
}

// ============================================================================
// ЭКСПОРТ PNG (ИСПРАВЛЕНО)
// ============================================================================

/**
 * Экспорт диаграммы в PNG файл
 */
function exportPNG() {
    try {
        if (!currentDiagram) {
            showToast('warning', 'Сначала создайте диаграмму');
            return;
        }
        
        // Клонируем SVG
        const svgClone = currentDiagram.cloneNode(true);
        svgClone.style.transform = '';
        
        // Получаем размеры
        const bbox = currentDiagram.getBBox();
        const width = bbox.width + 40;
        const height = bbox.height + 40;
        
        // Устанавливаем размеры
        svgClone.setAttribute('width', width);
        svgClone.setAttribute('height', height);
        
        // Сериализуем SVG
        const svgData = new XMLSerializer().serializeToString(svgClone);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        // Создаем Image
        const img = new Image();
        
        img.onload = function() {
            // Создаем canvas
            const canvas = document.createElement('canvas');
            canvas.width = width * 2; // Увеличиваем для качества
            canvas.height = height * 2;
            
            const ctx = canvas.getContext('2d');
            
            // Белый фон
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Масштабируем и рисуем
            ctx.scale(2, 2);
            ctx.drawImage(img, 0, 0);
            
            // Конвертация в PNG
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
        
        img.onerror = function(e) {
            console.error('Ошибка загрузки изображения:', e);
            showToast('error', 'Ошибка конвертации SVG в PNG');
            URL.revokeObjectURL(url);
        };
        
        img.src = url;
        
    } catch (error) {
        console.error('Ошибка экспорта PNG:', error);
        showToast('error', 'Ошибка экспорта PNG: ' + error.message);
    }
}

// ============================================================================
// ИНТЕРАКТИВНОСТЬ
// ============================================================================

/**
 * Настройка интерактивности (hover, клик)
 */
function setupInteractivity() {
    if (!currentDiagram) return;
    
    // Hover эффекты для элементов диаграммы
    const groups = currentDiagram.querySelectorAll('g.terminal, g.non-terminal');
    groups.forEach(el => {
        el.addEventListener('mouseenter', function() {
            const rect = this.querySelector('rect');
            if (rect) {
                rect.setAttribute('fill-opacity', '0.8');
            }
        });
        
        el.addEventListener('mouseleave', function() {
            const rect = this.querySelector('rect');
            if (rect) {
                rect.setAttribute('fill-opacity', '1');
            }
        });
    });
}

// ============================================================================
// ОЧИСТКА ДИАГРАММЫ
// ============================================================================

/**
 * Очистка диаграммы
 */
function clearDiagram() {
    const diagramContainer = document.getElementById('diagramContainer');
    
    if (diagramContainer) {
        diagramContainer.innerHTML = '';
    }
    
    currentDiagram = null;
    currentRegex = '';
}

// ============================================================================
// МАСШТАБИРОВАНИЕ
// ============================================================================

/**
 * Масштабирование диаграммы
 * @param {number} scale - коэффициент масштабирования
 */
function zoomDiagram(scale) {
    if (!currentDiagram) {
        showToast('warning', 'Сначала создайте диаграмму');
        return;
    }
    
    // Ограничение масштаба
    currentScale *= scale;
    currentScale = Math.max(0.5, Math.min(currentScale, 3.0));
    
    // Применение масштаба
    currentDiagram.style.transform = `scale(${currentScale})`;
    currentDiagram.style.transformOrigin = 'top left';
    
    showToast('info', `Масштаб: ${Math.round(currentScale * 100)}%`);
}

// ============================================================================
// ПРИМЕРЫ REGEX
// ============================================================================

/**
 * Загрузка примера regex
 * @param {string} example - название примера
 */
function loadExample(example) {
    const examples = {
        'simple': '^[a-z]+$',
        'email': '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
        'phone': '\\+?\\d{1,3}[-.\\s]?\\(?\\d{1,4}\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}',
        'url': 'https?://[\\w\\-]+(\\.[\\w\\-]+)+[/#?]?.*$',
        'date': '\\d{2,4}[-/.]\\d{1,2}[-/.]\\d{1,2}',
        'hex': '#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})',
        'ip': '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b'
    };
    
    const regex = examples[example];
    if (regex) {
        document.getElementById('visualizerRegex').value = regex;
        visualizeRegex(regex);
    }
}

// ============================================================================
// КОНЕЦ ФАЙЛА
// ============================================================================
