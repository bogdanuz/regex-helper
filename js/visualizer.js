// ============================================================================
// ФАЙЛ: js/visualizer.js
// ОПИСАНИЕ: Визуализатор regex с railroad diagrams
// ВЕРСИЯ: 1.0
// ДАТА: 10.02.2026
// ============================================================================

/*
 * ВИЗУАЛИЗАТОР REGEX
 * 
 * Функции:
 * - parseRegex(regex) - парсинг regex → AST
 * - renderDiagram(ast) - рендеринг railroad diagram (SVG)
 * - explainRegex(ast) - объяснение на русском
 * - renderExplanation(explanation) - рендеринг объяснения
 * - highlightSyntax(regex) - подсветка синтаксиса
 * - exportSVG() - экспорт диаграммы в SVG
 * - exportPNG() - конвертация SVG → PNG
 * - setupInteractivity() - hover, клик на элементы
 * - clearDiagram() - очистка
 * - zoomDiagram(scale) - масштабирование
 * - toggleTheme() - темная/светлая тема
 * 
 * Зависимости: errors.js, export.js, lib/railroad-diagrams.js
 */

// ============================================================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================================================

let currentDiagram = null;
let currentScale = 1.0;
let currentTheme = 'light';
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
        
        // Объяснение на русском
        const explanation = explainRegex(ast);
        renderExplanation(explanation);
        
        // Подсветка синтаксиса
        highlightSyntax(regex);
        
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
            return { type: 'any' };
        }
        
        if (ch === '^') {
            consume();
            return { type: 'start' };
        }
        
        if (ch === '$') {
            consume();
            return { type: 'end' };
        }
        
        // Escape последовательности
        if (ch === '\\') {
            consume();
            const next = consume();
            return { type: 'escape', value: '\\' + next };
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
            } else if (next === '<') {
                consume();
                if (peek() === '=') {
                    consume();
                    isLookbehind = true;
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
                content: { type: 'choice', alternatives }
            };
        } else {
            return {
                type: 'group',
                nonCapturing: isNonCapturing,
                lookahead: isLookahead,
                lookbehind: isLookbehind,
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
        
        return { type: 'char-class', value: '[' + (negated ? '^' : '') + chars + ']', negated };
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

// ============================================================================
// РЕНДЕРИНГ ДИАГРАММЫ
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
        container.innerHTML = diagram.toString();
        
        // Сохранение текущей диаграммы
        currentDiagram = container.querySelector('svg');
        
        // Применение масштаба и темы
        if (currentDiagram) {
            currentDiagram.style.transform = `scale(${currentScale})`;
            currentDiagram.setAttribute('data-theme', currentTheme);
        }
        
    } catch (error) {
        console.error('Ошибка рендеринга диаграммы:', error);
        throw error;
    }
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
            return Terminal(node.value);
        
        case 'escape':
            return Terminal(node.value);
        
        case 'any':
            return Terminal('.');
        
        case 'start':
            return Terminal('^');
        
        case 'end':
            return Terminal('$');
        
        case 'char-class':
            return Terminal(node.value);
        
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
                Comment('повтор ' + node.quantifier),
                astToRailroad(node.item)
            );
        
        case 'group':
            const content = astToRailroad(node.content);
            if (node.nonCapturing) {
                return Sequence(Comment('(?:...)'), content);
            } else if (node.lookahead) {
                return Sequence(Comment('(?=...)'), content);
            } else if (node.lookbehind) {
                return Sequence(Comment('(?<=...)'), content);
            } else {
                return Sequence(Comment('группа'), content);
            }
        
        case 'empty':
            return Skip();
        
        default:
            return Terminal('?');
    }
}

// ============================================================================
// ОБЪЯСНЕНИЕ НА РУССКОМ
// ============================================================================

/**
 * Генерация объяснения regex на русском языке
 * @param {Object} ast - AST дерево
 * @returns {Array} массив строк объяснения
 */
function explainRegex(ast) {
    const explanations = [];
    
    function walk(node, depth = 0) {
        if (!node) return;
        
        const indent = '  '.repeat(depth);
        
        switch (node.type) {
            case 'literal':
                explanations.push(`${indent}• Символ "${node.value}"`);
                break;
            
            case 'escape':
                explanations.push(`${indent}• Спецсимвол: ${node.value} ${getEscapeExplanation(node.value)}`);
                break;
            
            case 'any':
                explanations.push(`${indent}• Любой символ (.)`);
                break;
            
            case 'start':
                explanations.push(`${indent}• Начало строки (^)`);
                break;
            
            case 'end':
                explanations.push(`${indent}• Конец строки ($)`);
                break;
            
            case 'char-class':
                explanations.push(`${indent}• Класс символов: ${node.value}`);
                break;
            
            case 'sequence':
                explanations.push(`${indent}• Последовательность:`);
                node.items.forEach(item => walk(item, depth + 1));
                break;
            
            case 'choice':
                explanations.push(`${indent}• Альтернатива (одно из):`);
                node.alternatives.forEach(alt => walk(alt, depth + 1));
                break;
            
            case 'optional':
                explanations.push(`${indent}• Опциональное (0 или 1 раз):`);
                walk(node.item, depth + 1);
                break;
            
            case 'zero-or-more':
                explanations.push(`${indent}• Ноль или более раз (*):`);
                walk(node.item, depth + 1);
                break;
            
            case 'one-or-more':
                explanations.push(`${indent}• Один или более раз (+):`);
                walk(node.item, depth + 1);
                break;
            
            case 'repeat':
                explanations.push(`${indent}• Повтор ${node.quantifier}:`);
                walk(node.item, depth + 1);
                break;
            
            case 'group':
                let groupType = 'Группа';
                if (node.nonCapturing) groupType = 'Незахватывающая группа (?:...)';
                if (node.lookahead) groupType = 'Проверка вперед (?=...)';
                if (node.lookbehind) groupType = 'Проверка назад (?<=...)';
                explanations.push(`${indent}• ${groupType}:`);
                walk(node.content, depth + 1);
                break;
            
            case 'empty':
                explanations.push(`${indent}• Пустое выражение`);
                break;
        }
    }
    
    walk(ast);
    
    return explanations;
}

/**
 * Получить объяснение escape последовательности
 * @param {string} escape - escape последовательность
 * @returns {string} объяснение
 */
function getEscapeExplanation(escape) {
    const explanations = {
        '\\d': '(цифра 0-9)',
        '\\D': '(не цифра)',
        '\\w': '(буква, цифра или _)',
        '\\W': '(не буква, цифра или _)',
        '\\s': '(пробельный символ)',
        '\\S': '(не пробельный символ)',
        '\\b': '(граница слова)',
        '\\B': '(не граница слова)',
        '\\n': '(перенос строки)',
        '\\r': '(возврат каретки)',
        '\\t': '(табуляция)',
        '\\0': '(null символ)',
        '\\\\': '(обратный слеш)',
        '\\.': '(точка)',
        '\\*': '(звездочка)',
        '\\+': '(плюс)',
        '\\?': '(вопросительный знак)',
        '\\[': '(открывающая скобка)',
        '\\]': '(закрывающая скобка)',
        '\\(': '(открывающая скобка)',
        '\\)': '(закрывающая скобка)',
        '\\{': '(открывающая фигурная скобка)',
        '\\}': '(закрывающая фигурная скобка)',
        '\\|': '(вертикальная черта)',
        '\\^': '(крышка)',
        '\\$': '(знак доллара)'
    };
    
    return explanations[escape] || '';
}

// ============================================================================
// РЕНДЕРИНГ ОБЪЯСНЕНИЯ
// ============================================================================

/**
 * Рендеринг объяснения в контейнер
 * @param {Array} explanation - массив строк объяснения
 */
function renderExplanation(explanation) {
    const container = document.getElementById('explanationContainer');
    if (!container) return;
    
    container.innerHTML = `
        <h3>📝 Объяснение на русском:</h3>
        <div class="explanation-content">
            ${explanation.map(line => `<div>${line}</div>`).join('')}
        </div>
    `;
}

// ============================================================================
// ПОДСВЕТКА СИНТАКСИСА
// ============================================================================

/**
 * Подсветка синтаксиса regex в textarea
 * @param {string} regex - регулярное выражение
 */
function highlightSyntax(regex) {
    // Простая подсветка (можно расширить)
    const textarea = document.getElementById('visualizerRegex');
    if (!textarea) return;
    
    // Добавляем класс для визуального эффекта
    textarea.classList.add('syntax-highlighted');
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
        
        // Получение SVG content
        const svgContent = currentDiagram.outerHTML;
        
        // Создание blob
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        
        // Создание ссылки для скачивания
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `regex-diagram-${Date.now()}.svg`;
        link.click();
        
        // Освобождение памяти
        URL.revokeObjectURL(url);
        
        showToast('success', 'SVG экспортирован');
        
    } catch (error) {
        console.error('Ошибка экспорта SVG:', error);
        showToast('error', 'Ошибка экспорта SVG: ' + error.message);
    }
}

// ============================================================================
// ЭКСПОРТ PNG
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
        
        // Получение размеров SVG
        const svgRect = currentDiagram.getBoundingClientRect();
        const svgWidth = svgRect.width;
        const svgHeight = svgRect.height;
        
        // Создание canvas
        const canvas = document.createElement('canvas');
        canvas.width = svgWidth * 2; // Увеличиваем для качества
        canvas.height = svgHeight * 2;
        const ctx = canvas.getContext('2d');
        
        // Создание Image из SVG
        const svgBlob = new Blob([currentDiagram.outerHTML], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);
        
        const img = new Image();
        img.onload = function() {
            // Рисуем на canvas
            ctx.fillStyle = currentTheme === 'dark' ? '#1a1a1a' : '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Конвертация в PNG
            canvas.toBlob(function(blob) {
                const pngUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = pngUrl;
                link.download = `regex-diagram-${Date.now()}.png`;
                link.click();
                
                URL.revokeObjectURL(url);
                URL.revokeObjectURL(pngUrl);
                
                showToast('success', 'PNG экспортирован');
            });
        };
        
        img.onerror = function() {
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
    const elements = currentDiagram.querySelectorAll('g');
    elements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            this.style.opacity = '0.8';
        });
        
        el.addEventListener('mouseleave', function() {
            this.style.opacity = '1';
        });
    });
}

// ============================================================================
// ОЧИСТКА ДИАГРАММЫ
// ============================================================================

/**
 * Очистка диаграммы и объяснения
 */
function clearDiagram() {
    const diagramContainer = document.getElementById('diagramContainer');
    const explanationContainer = document.getElementById('explanationContainer');
    
    if (diagramContainer) {
        diagramContainer.innerHTML = '';
    }
    
    if (explanationContainer) {
        explanationContainer.innerHTML = '';
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
// ПЕРЕКЛЮЧЕНИЕ ТЕМЫ
// ============================================================================

/**
 * Переключение темы (светлая/темная)
 */
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    if (currentDiagram) {
        currentDiagram.setAttribute('data-theme', currentTheme);
    }
    
    // Применение темы к контейнерам
    const diagramContainer = document.getElementById('diagramContainer');
    const explanationContainer = document.getElementById('explanationContainer');
    
    if (diagramContainer) {
        diagramContainer.setAttribute('data-theme', currentTheme);
    }
    
    if (explanationContainer) {
        explanationContainer.setAttribute('data-theme', currentTheme);
    }
    
    showToast('info', `Тема: ${currentTheme === 'light' ? 'Светлая' : 'Темная'}`);
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
