// ============================================================================
// ФАЙЛ: js/visualizer.js
// ОПИСАНИЕ: Интерфейс для визуализатора regex
// ВЕРСИЯ: 3.0 (использует lib/regex-visualizer.js)
// ДАТА: 10.02.2026
// ============================================================================

/*
 * ВИЗУАЛИЗАТОР REGEX - ИНТЕРФЕЙС
 * 
 * Использует библиотеку RegexVisualizer из lib/regex-visualizer.js
 * Функции интерфейса:
 * - visualizeRegex(regex) - главная функция
 * - exportSVG() - экспорт SVG
 * - exportPNG() - экспорт PNG
 * - openFullscreen() - модальное окно
 * - zoomDiagram() - масштабирование
 */

// ============================================================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================================================

let visualizer = null;
let currentDiagram = null;
let currentScale = 1.0;
let currentRegex = '';
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let scrollLeft = 0;
let scrollTop = 0;

// ============================================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================================

/**
 * Инициализация визуализатора (вызывается автоматически)
 */
function initVisualizer() {
    if (typeof RegexVisualizer === 'undefined') {
        console.error('[Visualizer] Библиотека RegexVisualizer не загружена!');
        return;
    }
    
    visualizer = new RegexVisualizer();
    console.log('[Visualizer] Инициализирован (v3.0)');
}

// Автоинициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisualizer);
} else {
    initVisualizer();
}

// ============================================================================
// ГЛАВНАЯ ФУНКЦИЯ ВИЗУАЛИЗАЦИИ
// ============================================================================

/**
 * Визуализация regex
 * @param {string} regex - регулярное выражение
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
        
        if (!visualizer) {
            showToast('error', 'Визуализатор не инициализирован');
            return;
        }
        
        currentRegex = regex;
        
        // Рендеринг через библиотеку
        const svg = visualizer.render(regex);
        
        const container = document.getElementById('diagramContainer');
        if (!container) {
            throw new Error('Контейнер диаграммы не найден');
        }
        
        container.innerHTML = '';
        container.appendChild(svg);
        
        currentDiagram = svg;
        currentScale = 1.0;
        
        // Включаем drag & scroll
        enableDragAndScroll(container);
        
        showToast('success', 'Диаграмма построена успешно');
        
    } catch (error) {
        console.error('Ошибка визуализации:', error);
        showToast('error', 'Ошибка: ' + error.message);
    }
}

// ============================================================================
// DRAG & SCROLL
// ============================================================================

/**
 * Включить drag and scroll для контейнера
 */
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
    
    // Скролл колесиком (горизонтальный и вертикальный)
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        container.scrollLeft += e.deltaX;
        container.scrollTop += e.deltaY;
    }, { passive: false });
}

// ============================================================================
// МОДАЛЬНОЕ ОКНО НА ВЕСЬ ЭКРАН
// ============================================================================

/**
 * Открыть модальное окно на весь экран
 */
function openFullscreen() {
    if (!currentDiagram) {
        showToast('warning', 'Сначала создайте диаграмму');
        return;
    }
    
    // Создаем модальное окно
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
    
    // Клонируем диаграмму
    const diagramClone = currentDiagram.cloneNode(true);
    diagramClone.style.transform = ''; // Сброс transform
    
    const fullscreenDiagram = document.getElementById('fullscreenDiagram');
    fullscreenDiagram.appendChild(diagramClone);
    
    // Включаем drag & scroll
    enableDragAndScroll(fullscreenDiagram);
    
    // Блокируем скролл body
    document.body.style.overflow = 'hidden';
}

/**
 * Закрыть модальное окно
 */
function closeFullscreen() {
    const modal = document.getElementById('fullscreenModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

/**
 * Zoom в модальном окне
 */
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

/**
 * Экспорт SVG
 */
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
        console.error('Ошибка экспорта SVG:', error);
        showToast('error', 'Ошибка экспорта SVG');
    }
}

/**
 * Экспорт PNG
 */
function exportPNG() {
    if (!currentDiagram) {
        showToast('warning', 'Сначала создайте диаграмму');
        return;
    }
    
    try {
        const svgClone = currentDiagram.cloneNode(true);
        svgClone.style.transform = '';
        
        const bbox = currentDiagram.getBBox ? currentDiagram.getBBox() : { width: 800, height: 400 };
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
        console.error('Ошибка экспорта PNG:', error);
        showToast('error', 'Ошибка экспорта PNG');
    }
}

// ============================================================================
// МАСШТАБИРОВАНИЕ
// ============================================================================

/**
 * Масштабирование диаграммы
 */
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

/**
 * Очистка диаграммы
 */
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
