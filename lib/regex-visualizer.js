/**
 * ============================================================================
 * REGEX VISUALIZER LIBRARY
 * Личная библиотека для визуализации regex (как Regexper)
 * Версия: 1.0
 * Автор: Создано для bogdanuz/regex-helper
 * Лицензия: MIT
 * ============================================================================
 * 
 * Использование:
 * const visualizer = new RegexVisualizer();
 * const svg = visualizer.render('\\d+[a-z]*');
 * document.body.appendChild(svg);
 */

(function(window) {
    'use strict';

    // ========================================================================
    // КОНСТАНТЫ ВИЗУАЛИЗАЦИИ (КАК НА REGEXPER.COM)
    // ========================================================================
    
    const COLORS = {
        LITERAL: '#dae9e5',        // Литералы - светло-зеленый
        LITERAL_STROKE: '#6b9080', // Обводка литералов
        ESCAPE: '#bada55',          // Escape - зеленый
        ESCAPE_STROKE: '#769b3b',   // Обводка escape
        CHARSET: '#cbdadb',         // Character sets - серо-голубой
        CHARSET_STROKE: '#88a5b0',  // Обводка character sets
        GROUP: '#e0e0e0',           // Группы - светло-серый
        GROUP_STROKE: '#999',       // Обводка групп (пунктир)
        PATH: '#000',               // Линии - черный
        TEXT: '#000',               // Текст - черный
        BACKGROUND: '#fff',         // Фон - белый
        ANCHOR: '#f5e6d3',          // Якоря (^, $) - бежевый
        ANCHOR_STROKE: '#c9a66b'    // Обводка якорей
    };
    
    const SIZES = {
        BOX_PADDING: 12,
        BOX_HEIGHT: 32,
        BOX_RADIUS: 6,
        FONT_SIZE: 14,
        LABEL_FONT_SIZE: 11,
        LINE_WIDTH: 2,
        SPACING: 20,
        CHOICE_SPACING: 60,
        LOOP_HEIGHT: 50,
        GROUP_PADDING: 15
    };

    // ========================================================================
    // ГЛАВНЫЙ КЛАСС
    // ========================================================================
    
    class RegexVisualizer {
        constructor() {
            this.currentX = 0;
            this.currentY = 0;
            this.elements = [];
        }
        
        /**
         * Главный метод: парсинг и рендеринг regex в SVG
         * @param {string} regex - регулярное выражение
         * @returns {SVGElement} - SVG элемент с диаграммой
         */
        render(regex) {
            this.elements = [];
            this.currentX = SIZES.SPACING;
            this.currentY = 100;
            
            try {
                // Парсинг
                const parser = new RegexParser();
                const ast = parser.parse(regex);
                
                // Рендеринг
                this.renderNode(ast);
                
                // Создание SVG
                return this.createSVG();
                
            } catch (error) {
                console.error('Ошибка визуализации:', error);
                return this.createErrorSVG(error.message);
            }
        }
        
        /**
         * Рендеринг узла AST
         */
        renderNode(node) {
            if (!node) return;
            
            const handlers = {
                'literal': () => this.renderLiteral(node),
                'escape': () => this.renderEscape(node),
                'any': () => this.renderAny(),
                'anchor-start': () => this.renderAnchor('^', 'start'),
                'anchor-end': () => this.renderAnchor('$', 'end'),
                'char-class': () => this.renderCharClass(node),
                'sequence': () => this.renderSequence(node),
                'choice': () => this.renderChoice(node),
                'optional': () => this.renderOptional(node),
                'zero-or-more': () => this.renderZeroOrMore(node),
                'one-or-more': () => this.renderOneOrMore(node),
                'repeat': () => this.renderRepeat(node),
                'group': () => this.renderGroup(node),
                'empty': () => {}
            };
            
            const handler = handlers[node.type];
            if (handler) {
                handler();
            } else {
                console.warn('Неизвестный тип узла:', node.type);
            }
        }
        
        /**
         * Рендеринг литерала
         */
        renderLiteral(node) {
            const text = `"${node.value}"`;
            const width = this.calculateTextWidth(text) + SIZES.BOX_PADDING * 2;
            
            this.addBox(
                this.currentX,
                this.currentY,
                width,
                SIZES.BOX_HEIGHT,
                text,
                COLORS.LITERAL,
                COLORS.LITERAL_STROKE
            );
            
            this.currentX += width + SIZES.SPACING;
        }
        
        /**
         * Рендеринг escape последовательности
         */
        renderEscape(node) {
            const label = this.getEscapeLabel(node.value);
            const width = this.calculateTextWidth(label) + SIZES.BOX_PADDING * 2;
            
            this.addBox(
                this.currentX,
                this.currentY,
                width,
                SIZES.BOX_HEIGHT,
                label,
                COLORS.ESCAPE,
                COLORS.ESCAPE_STROKE
            );
            
            this.currentX += width + SIZES.SPACING;
        }
        
        /**
         * Рендеринг "любой символ" (.)
         */
        renderAny() {
            const text = 'any character';
            const width = this.calculateTextWidth(text) + SIZES.BOX_PADDING * 2;
            
            this.addBox(
                this.currentX,
                this.currentY,
                width,
                SIZES.BOX_HEIGHT,
                text,
                COLORS.ESCAPE,
                COLORS.ESCAPE_STROKE
            );
            
            this.currentX += width + SIZES.SPACING;
        }
        
        /**
         * Рендеринг якоря (^ или $)
         */
        renderAnchor(symbol, type) {
            const label = type === 'start' ? 'start of line' : 'end of line';
            const width = this.calculateTextWidth(label) + SIZES.BOX_PADDING * 2;
            
            this.addBox(
                this.currentX,
                this.currentY,
                width,
                SIZES.BOX_HEIGHT,
                label,
                COLORS.ANCHOR,
                COLORS.ANCHOR_STROKE
            );
            
            this.currentX += width + SIZES.SPACING;
        }
        
        /**
         * Рендеринг класса символов [...]
         */
        renderCharClass(node) {
            const prefix = node.negated ? 'None of:' : 'One of:';
            const chars = node.value;
            
            // Разбиваем на отдельные символы
            const items = this.parseCharClassItems(chars);
            
            const totalWidth = Math.max(
                this.calculateTextWidth(prefix) + SIZES.BOX_PADDING * 2,
                items.reduce((sum, item) => sum + this.calculateTextWidth(item) + SIZES.BOX_PADDING, 0)
            );
            
            // Метка "One of:"
            this.addText(
                this.currentX + totalWidth / 2,
                this.currentY - SIZES.BOX_HEIGHT,
                prefix,
                SIZES.LABEL_FONT_SIZE,
                'middle'
            );
            
            // Боксы для каждого символа
            let itemX = this.currentX;
            items.forEach(item => {
                const itemWidth = this.calculateTextWidth(item) + SIZES.BOX_PADDING;
                
                this.addBox(
                    itemX,
                    this.currentY,
                    itemWidth,
                    SIZES.BOX_HEIGHT,
                    item,
                    COLORS.CHARSET,
                    COLORS.CHARSET_STROKE
                );
                
                itemX += itemWidth + 5;
            });
            
            this.currentX += totalWidth + SIZES.SPACING;
        }
        
        /**
         * Рендеринг последовательности
         */
        renderSequence(node) {
            node.items.forEach(item => {
                this.renderNode(item);
            });
        }
        
        /**
         * Рендеринг выбора (альтернация)
         */
        renderChoice(node) {
            const startX = this.currentX;
            const startY = this.currentY;
            const alternatives = node.alternatives;
            
            const paths = [];
            let maxWidth = 0;
            
            // Рендерим каждую альтернативу
            alternatives.forEach((alt, i) => {
                this.currentX = startX + 40;
                this.currentY = startY + (i - (alternatives.length - 1) / 2) * SIZES.CHOICE_SPACING;
                
                const pathStartX = this.currentX;
                this.renderNode(alt);
                const pathEndX = this.currentX;
                
                paths.push({
                    y: this.currentY,
                    startX: pathStartX,
                    endX: pathEndX
                });
                
                maxWidth = Math.max(maxWidth, pathEndX - startX);
            });
            
            // Рисуем линии к альтернативам и от них
            paths.forEach((path, i) => {
                if (i !== Math.floor(alternatives.length / 2)) {
                    // Линия к альтернативе
                    this.addPath(
                        `M ${startX} ${startY} C ${startX + 20} ${startY}, ${startX + 20} ${path.y}, ${path.startX} ${path.y}`,
                        COLORS.PATH
                    );
                    
                    // Линия от альтернативы
                    this.addPath(
                        `M ${path.endX} ${path.y} C ${startX + maxWidth - 20} ${path.y}, ${startX + maxWidth - 20} ${startY}, ${startX + maxWidth} ${startY}`,
                        COLORS.PATH
                    );
                } else {
                    // Прямая линия для центральной альтернативы
                    this.addPath(
                        `M ${startX} ${startY} L ${path.startX} ${path.y}`,
                        COLORS.PATH
                    );
                    this.addPath(
                        `M ${path.endX} ${path.y} L ${startX + maxWidth} ${startY}`,
                        COLORS.PATH
                    );
                }
            });
            
            this.currentX = startX + maxWidth + SIZES.SPACING;
            this.currentY = startY;
        }
        
        /**
         * Рендеринг опционального элемента (?)
         */
        renderOptional(node) {
            const startX = this.currentX;
            const startY = this.currentY;
            
            // Верхний путь (обход)
            this.addPath(
                `M ${startX} ${startY} C ${startX + 20} ${startY}, ${startX + 20} ${startY - 40}, ${startX + 40} ${startY - 40}`,
                COLORS.PATH
            );
            
            // Нижний путь (через элемент)
            this.currentX = startX + 40;
            this.renderNode(node.item);
            const endX = this.currentX;
            
            // Соединение
            this.addPath(
                `M ${startX + 40} ${startY - 40} C ${endX - 20} ${startY - 40}, ${endX - 20} ${startY}, ${endX} ${startY}`,
                COLORS.PATH
            );
            
            this.currentX = endX;
        }
        
        /**
         * Рендеринг zero-or-more (*)
         */
        renderZeroOrMore(node) {
            const startX = this.currentX;
            const startY = this.currentY;
            
            // Верхний путь (обход)
            this.addPath(
                `M ${startX} ${startY} C ${startX + 20} ${startY}, ${startX + 20} ${startY - 40}, ${startX + 40} ${startY - 40}`,
                COLORS.PATH
            );
            
            // Элемент
            this.currentX = startX + 40;
            this.renderNode(node.item);
            const endX = this.currentX;
            
            // Петля назад
            this.addPath(
                `M ${endX} ${startY} C ${endX + 10} ${startY}, ${endX + 10} ${startY - SIZES.LOOP_HEIGHT}, ${startX + 40} ${startY - SIZES.LOOP_HEIGHT}`,
                COLORS.PATH
            );
            
            // Стрелка на петле
            this.addArrow(startX + 50, startY - SIZES.LOOP_HEIGHT, 'left');
            
            // Соединение верхнего пути
            this.addPath(
                `M ${startX + 40} ${startY - 40} C ${endX - 20} ${startY - 40}, ${endX - 20} ${startY}, ${endX} ${startY}`,
                COLORS.PATH
            );
            
            this.currentX = endX;
        }
        
        /**
         * Рендеринг one-or-more (+)
         */
        renderOneOrMore(node) {
            const startX = this.currentX;
            const startY = this.currentY;
            
            // Элемент
            this.renderNode(node.item);
            const endX = this.currentX;
            
            // Петля назад
            this.addPath(
                `M ${endX} ${startY} C ${endX + 10} ${startY}, ${endX + 10} ${startY - SIZES.LOOP_HEIGHT}, ${startX} ${startY - SIZES.LOOP_HEIGHT} C ${startX - 10} ${startY - SIZES.LOOP_HEIGHT}, ${startX - 10} ${startY}, ${startX} ${startY}`,
                COLORS.PATH
            );
            
            // Стрелка на петле
            this.addArrow(startX + 10, startY - SIZES.LOOP_HEIGHT, 'left');
            
            this.currentX = endX;
        }
        
        /**
         * Рендеринг повтора {n,m}
         */
        renderRepeat(node) {
            const startX = this.currentX;
            
            // Метка квантификатора
            this.addText(
                startX,
                this.currentY - 25,
                node.quantifier,
                SIZES.LABEL_FONT_SIZE,
                'start'
            );
            
            this.renderNode(node.item);
        }
        
        /**
         * Рендеринг группы
         */
        renderGroup(node) {
            const startX = this.currentX;
            const startY = this.currentY;
            
            // Метка группы
            let label = 'group';
            if (node.nonCapturing) label = '(?:)';
            else if (node.lookahead) label = node.negative ? '(?!)' : '(?=)';
            else if (node.lookbehind) label = node.negative ? '(?<!)' : '(?<=)';
            
            this.addText(
                startX,
                startY - 60,
                label,
                SIZES.LABEL_FONT_SIZE,
                'start'
            );
            
            // Рендерим содержимое с отступом
            this.currentX = startX + SIZES.GROUP_PADDING;
            this.renderNode(node.content);
            const endX = this.currentX + SIZES.GROUP_PADDING;
            
            // Пунктирный контур
            this.addRect(
                startX - 5,
                startY - 70,
                endX - startX + 10,
                150,
                'none',
                COLORS.GROUP_STROKE,
                true
            );
            
            this.currentX = endX;
        }
        
        // ====================================================================
        // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ РЕНДЕРИНГА
        // ====================================================================
        
        addBox(x, y, width, height, text, fill, stroke) {
            this.elements.push({
                type: 'rect',
                x: x,
                y: y - height / 2,
                width: width,
                height: height,
                rx: SIZES.BOX_RADIUS,
                fill: fill,
                stroke: stroke,
                strokeWidth: SIZES.LINE_WIDTH
            });
            
            this.addText(x + width / 2, y + 5, text, SIZES.FONT_SIZE, 'middle');
        }
        
        addRect(x, y, width, height, fill, stroke, dashed = false) {
            this.elements.push({
                type: 'rect',
                x: x,
                y: y,
                width: width,
                height: height,
                fill: fill,
                stroke: stroke,
                strokeWidth: SIZES.LINE_WIDTH,
                dashed: dashed
            });
        }
        
        addText(x, y, text, fontSize, anchor) {
            this.elements.push({
                type: 'text',
                x: x,
                y: y,
                text: text,
                fontSize: fontSize,
                anchor: anchor,
                fill: COLORS.TEXT
            });
        }
        
        addPath(d, stroke) {
            this.elements.push({
                type: 'path',
                d: d,
                stroke: stroke,
                strokeWidth: SIZES.LINE_WIDTH,
                fill: 'none'
            });
        }
        
        addArrow(x, y, direction) {
            const size = 6;
            const d = direction === 'left' 
                ? `M ${x} ${y} L ${x + size} ${y - size / 2} L ${x + size} ${y + size / 2} Z`
                : `M ${x} ${y} L ${x - size} ${y - size / 2} L ${x - size} ${y + size / 2} Z`;
            
            this.elements.push({
                type: 'path',
                d: d,
                fill: COLORS.PATH,
                stroke: 'none'
            });
        }
        
        // ====================================================================
        // СОЗДАНИЕ SVG
        // ====================================================================
        
        createSVG() {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('class', 'regex-diagram');
            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            
            // Вычисляем размеры
            let minX = Infinity, minY = Infinity;
            let maxX = -Infinity, maxY = -Infinity;
            
            this.elements.forEach(el => {
                if (el.type === 'rect') {
                    minX = Math.min(minX, el.x);
                    minY = Math.min(minY, el.y);
                    maxX = Math.max(maxX, el.x + el.width);
                    maxY = Math.max(maxY, el.y + el.height);
                } else if (el.type === 'text') {
                    minX = Math.min(minX, el.x - 50);
                    minY = Math.min(minY, el.y - 10);
                    maxX = Math.max(maxX, el.x + 50);
                    maxY = Math.max(maxY, el.y + 10);
                }
            });
            
            const width = maxX - minX + SIZES.SPACING * 2;
            const height = maxY - minY + SIZES.SPACING * 2;
            
            svg.setAttribute('width', width);
            svg.setAttribute('height', height);
            svg.setAttribute('viewBox', `${minX - SIZES.SPACING} ${minY - SIZES.SPACING} ${width} ${height}`);
            
            // Фон
            const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bg.setAttribute('x', minX - SIZES.SPACING);
            bg.setAttribute('y', minY - SIZES.SPACING);
            bg.setAttribute('width', width);
            bg.setAttribute('height', height);
            bg.setAttribute('fill', COLORS.BACKGROUND);
            svg.appendChild(bg);
            
            // Добавляем элементы
            this.elements.forEach(el => {
                const element = this.createSVGElement(el);
                if (element) svg.appendChild(element);
            });
            
            return svg;
        }
        
        createSVGElement(el) {
            if (el.type === 'rect') {
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', el.x);
                rect.setAttribute('y', el.y);
                rect.setAttribute('width', el.width);
                rect.setAttribute('height', el.height);
                if (el.rx) rect.setAttribute('rx', el.rx);
                rect.setAttribute('fill', el.fill);
                rect.setAttribute('stroke', el.stroke);
                rect.setAttribute('stroke-width', el.strokeWidth);
                if (el.dashed) rect.setAttribute('stroke-dasharray', '5,5');
                return rect;
                
            } else if (el.type === 'text') {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', el.x);
                text.setAttribute('y', el.y);
                text.setAttribute('text-anchor', el.anchor);
                text.setAttribute('font-family', 'Monaco, Menlo, Consolas, monospace');
                text.setAttribute('font-size', el.fontSize);
                text.setAttribute('fill', el.fill);
                text.textContent = el.text;
                return text;
                
            } else if (el.type === 'path') {
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', el.d);
                if (el.stroke) path.setAttribute('stroke', el.stroke);
                if (el.strokeWidth) path.setAttribute('stroke-width', el.strokeWidth);
                path.setAttribute('fill', el.fill || 'none');
                return path;
            }
            
            return null;
        }
        
        createErrorSVG(message) {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', 400);
            svg.setAttribute('height', 100);
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', 200);
            text.setAttribute('y', 50);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'red');
            text.textContent = 'Ошибка: ' + message;
            
            svg.appendChild(text);
            return svg;
        }
        
        // ====================================================================
        // УТИЛИТЫ
        // ====================================================================
        
        calculateTextWidth(text) {
            return text.length * (SIZES.FONT_SIZE * 0.6);
        }
        
        getEscapeLabel(escape) {
            const labels = {
                '\\d': 'digit 0-9',
                '\\D': 'not digit',
                '\\w': 'word character',
                '\\W': 'not word character',
                '\\s': 'whitespace',
                '\\S': 'not whitespace',
                '\\b': 'word boundary',
                '\\B': 'not word boundary',
                '\\n': 'line feed',
                '\\r': 'carriage return',
                '\\t': 'tab',
                '\\0': 'null'
            };
            return labels[escape] || escape;
        }
        
        parseCharClassItems(chars) {
            const items = [];
            let i = 0;
            
            while (i < chars.length) {
                if (chars[i] === '\\') {
                    items.push(chars[i] + chars[i + 1]);
                    i += 2;
                } else if (chars[i + 1] === '-' && chars[i + 2]) {
                    items.push(chars[i] + '-' + chars[i + 2]);
                    i += 3;
                } else {
                    items.push(chars[i]);
                    i++;
                }
            }
            
            return items;
        }
    }

    // ========================================================================
    // ПАРСЕР REGEX
    // ========================================================================
    
    class RegexParser {
        constructor() {
            this.regex = '';
            this.position = 0;
        }
        
        parse(regex) {
            this.regex = regex;
            this.position = 0;
            return this.parseAlternation();
        }
        
        peek() { return this.regex[this.position]; }
        consume() { return this.regex[this.position++]; }
        isEnd() { return this.position >= this.regex.length; }
        
        parseAlternation() {
            const alternatives = [];
            let current = [];
            
            while (!this.isEnd()) {
                if (this.peek() === '|') {
                    this.consume();
                    alternatives.push(this.makeSequence(current));
                    current = [];
                } else if (this.peek() === ')') {
                    break;
                } else {
                    const item = this.parseItem();
                    if (item) current.push(item);
                }
            }
            
            if (current.length > 0) {
                alternatives.push(this.makeSequence(current));
            }
            
            if (alternatives.length > 1) {
                return { type: 'choice', alternatives };
            } else if (alternatives.length === 1) {
                return alternatives[0];
            }
            
            return { type: 'empty' };
        }
        
        parseItem() {
            let item = this.parseAtom();
            if (!item) return null;
            
            const ch = this.peek();
            if (ch === '*') {
                this.consume();
                return { type: 'zero-or-more', item };
            } else if (ch === '+') {
                this.consume();
                return { type: 'one-or-more', item };
            } else if (ch === '?') {
                this.consume();
                return { type: 'optional', item };
            } else if (ch === '{') {
                const quant = this.parseQuantifier();
                return { type: 'repeat', item, quantifier: quant };
            }
            
            return item;
        }
        
        parseAtom() {
            const ch = this.peek();
            
            if (ch === '(') return this.parseGroup();
            if (ch === '[') return this.parseCharClass();
            if (ch === '.') { this.consume(); return { type: 'any' }; }
            if (ch === '^') { this.consume(); return { type: 'anchor-start' }; }
            if (ch === '$') { this.consume(); return { type: 'anchor-end' }; }
            
            if (ch === '\\') {
                this.consume();
                const next = this.consume();
                return { type: 'escape', value: '\\' + next };
            }
            
            if (ch && ch !== ')' && ch !== '|') {
                return { type: 'literal', value: this.consume() };
            }
            
            return null;
        }
        
        parseGroup() {
            this.consume(); // (
            
            let nonCapturing = false;
            let lookahead = false;
            let lookbehind = false;
            let negative = false;
            
            if (this.peek() === '?') {
                this.consume();
                const type = this.peek();
                if (type === ':') { this.consume(); nonCapturing = true; }
                else if (type === '=') { this.consume(); lookahead = true; }
                else if (type === '!') { this.consume(); lookahead = true; negative = true; }
                else if (type === '<') {
                    this.consume();
                    if (this.peek() === '=') { this.consume(); lookbehind = true; }
                    else if (this.peek() === '!') { this.consume(); lookbehind = true; negative = true; }
                }
            }
            
            const content = this.parseAlternation();
            
            this.consume(); // )
            
            return {
                type: 'group',
                nonCapturing,
                lookahead,
                lookbehind,
                negative,
                content
            };
        }
        
        parseCharClass() {
            this.consume(); // [
            let negated = this.peek() === '^';
            if (negated) this.consume();
            
            let chars = '';
            while (!this.isEnd() && this.peek() !== ']') {
                if (this.peek() === '\\') {
                    chars += this.consume();
                    chars += this.consume();
                } else {
                    chars += this.consume();
                }
            }
            this.consume(); // ]
            
            return { type: 'char-class', value: chars, negated };
        }
        
        parseQuantifier() {
            this.consume(); // {
            let q = '';
            while (!this.isEnd() && this.peek() !== '}') {
                q += this.consume();
            }
            this.consume(); // }
            return '{' + q + '}';
        }
        
        makeSequence(items) {
            if (items.length === 0) return { type: 'empty' };
            if (items.length === 1) return items[0];
            return { type: 'sequence', items };
        }
    }

    // ========================================================================
    // ЭКСПОРТ
    // ========================================================================
    
    window.RegexVisualizer = RegexVisualizer;

})(window);
