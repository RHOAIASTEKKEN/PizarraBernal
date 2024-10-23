// Elementos del DOM
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const sizeSelector = document.getElementById('sizeSelector');
const colorPicker = document.getElementById('colorPicker');
const backgroundInput = document.getElementById('backgroundInput');
const equationEditor = document.getElementById('equationEditor');
const equationPreview = document.getElementById('equationPreview');
const backgroundImage = document.getElementById('backgroundImage');
const marker = document.getElementById('marker');

let isMarkerActive = false;
let isDrawingLine = false;
let lineStartX, lineStartY;

// Activar el plumón
marker.addEventListener('click', () => {
    tool = 'marker';
    isMarkerActive = true;
});

const lineButton = document.getElementById('line');
lineButton.addEventListener('click', () => {
    tool = 'line';
});

// Cambiar la opacidad al escribir con el plumónz
canvas.addEventListener('mousemove', (e) => {
    if (isMarkerActive && e.buttons === 1) { // Solo si el plumón está activo y se está presionando el mouse
        ctx.globalAlpha = 0.1; // Cambia la opacidad del trazo
        // Aquí va el código de dibujo
    }
});

// Volver a la opacidad normal al dejar de usar el plumón
canvas.addEventListener('mouseup', () => {
    if (isMarkerActive) {
        ctx.globalAlpha = 1; // Restablece la opacidad normal
    }
});

// Función para verificar si MathJax está cargado
function isMathJaxLoaded() {
    return typeof MathJax !== 'undefined';
}

// Función para verificar si MathQuill está cargado
function isMathQuillLoaded() {
    return typeof MathQuill !== 'undefined';
}

// Función para verificar si el canvas está disponible
function isCanvasAvailable() {
    return !!document.getElementById('canvas');
}

// Función para manejar errores
function handleError(message) {
    console.error(message);
    alert(`Error: ${message}`);
}

// Función para inicializar MathQuill
function initMathQuill() {
    if (!isMathQuillLoaded()) {
        handleError('MathQuill no está cargado. Algunas funciones de ecuaciones no estarán disponibles.');
        return null;
    }
    try {
        var MQ = MathQuill.getInterface(2);
        return MQ.MathField(document.getElementById('mathField'), {
            spaceBehavesLikeTab: true,
            handlers: {
                edit: function () {
                    updateEquationPreview();
                }
            }
        });
    } catch (error) {
        handleError(`Error al inicializar MathQuill: ${error.message}`);
        return null;
    }
}

// Variables globales
let drawing = false;
let tool = 'pencil';
let size = 5;
let color = '#000000';
let startX, startY;
let drawingActions = [];
let selectedObject = null;
let offsetX, offsetY;
let isPositioningEquation = false;
let equationToInsert = null;
let equationSize = 2;

// Configurar MathQuill
var MQ = MathQuill.getInterface(2);
var mathField = MQ.MathField(document.getElementById('mathField'), {
    spaceBehavesLikeTab: true,
    handlers: {
        edit: function () {
            updateEquationPreview();
        }
    }
});

// Funciones de inicialización
function resizeCanvas() {
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * pixelRatio;
    canvas.height = window.innerHeight * 0.9 * pixelRatio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = (window.innerHeight * 0.9) + 'px';
    ctx.scale(pixelRatio, pixelRatio);
    redrawCanvas();
}

document.getElementById('equationSizeInput').addEventListener('input', (e) => {
    equationSize = parseFloat(e.target.value);
});

function loadBackgroundImage() {
    const savedImage = localStorage.getItem('backgroundImage');
    if (savedImage) {
        backgroundImage.src = savedImage;
    }
}

// Funciones de dibujo
// Funciones de dibujo
function drawAction(action) {
    ctx.globalAlpha = action.tool === 'marker' ? 0.2 : 1;
    if (action.tool === 'equation') {
        ctx.drawImage(action.img, action.x, action.y, action.width, action.height);
    } else {
        if (action.tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
        } else {
            ctx.globalCompositeOperation = 'source-over';
        }
        ctx.strokeStyle = action.color;
        ctx.lineWidth = action.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(action.startX, action.startY);
        ctx.lineTo(action.endX, action.endY);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
}

function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawingActions.forEach(drawAction);
}

// Funciones de manejo de eventos
// Funciones de manejo de eventos
function startDrawing(e) {
    if (isPositioningEquation) {
        insertEquationAtPosition(e.offsetX, e.offsetY);
        isPositioningEquation = false;
        canvas.style.cursor = 'default';
    } else if (tool === 'selection') {
        const clickedObject = getClickedObject(e.offsetX, e.offsetY);
        if (clickedObject) {
            selectedObject = clickedObject;
            offsetX = e.offsetX - selectedObject.startX;
            offsetY = e.offsetY - selectedObject.startY;
        }
    } else {
        drawing = true;
        [startX, startY] = [e.offsetX, e.offsetY];
        if (tool === 'line') {
            isDrawingLine = true;
            lineStartX = e.offsetX;
            lineStartY = e.offsetY;
        }
    }
}

function draw(e) {
    if (tool === 'selection' && selectedObject) {
        const dx = e.offsetX - offsetX - selectedObject.startX;
        const dy = e.offsetY - offsetY - selectedObject.startY;
        selectedObject.startX += dx;
        selectedObject.startY += dy;
        selectedObject.endX += dx;
        selectedObject.endY += dy;
        redrawCanvas();
    } else if (drawing) {
        if (tool === 'line' && isDrawingLine) {
            redrawCanvas();
            drawLine(ctx, lineStartX, lineStartY, e.offsetX, e.offsetY, color, size);
        } else {
            const action = {
                tool,
                color: tool === 'eraser' ? 'rgba(0,0,0,1)' : color,
                size,
                startX,
                startY,
                endX: e.offsetX,
                endY: e.offsetY
            };
            drawingActions.push(action);
            drawAction(action);
            [startX, startY] = [e.offsetX, e.offsetY];
        }
    }
}

function drawLine(context, x1, y1, x2, y2, color, lineWidth) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.stroke();
}

function stopDrawing(e) {
    if (isDrawingLine) {
        const action = {
            tool: 'line',
            color: color,
            size: size,
            startX: lineStartX,
            startY: lineStartY,
            endX: e.offsetX,
            endY: e.offsetY
        };
        drawingActions.push(action);
        isDrawingLine = false;
    }
    drawing = false;
    selectedObject = null;
}


function getClickedObject(x, y) {
    const tolerance = 10;
    for (let i = drawingActions.length - 1; i >= 0; i--) {
        const action = drawingActions[i];
        if (action.tool === 'line') {
            const distanceToLine = distanceToSegment(x, y, action.startX, action.startY, action.endX, action.endY);
            if (distanceToLine < tolerance) {
                return action;
            }
        } else {
            const distanceStart = Math.sqrt(
                Math.pow(x - action.startX, 2) + Math.pow(y - action.startY, 2)
            );
            const distanceEnd = Math.sqrt(
                Math.pow(x - action.endX, 2) + Math.pow(y - action.endY, 2)
            );
            if (distanceStart < tolerance || distanceEnd < tolerance) {
                return action;
            }
        }
    }
    return null;
}

// Función para calcular la distancia de un punto a un segmento de línea
function distanceToSegment(x, y, x1, y1, x2, y2) {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq != 0) //in case of 0 length line
        param = dot / len_sq;

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    }
    else if (param > 1) {
        xx = x2;
        yy = y2;
    }
    else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

function updateEquationPreview() {
    if (!isMathJaxLoaded()) {
        handleError('MathJax no está cargado. La vista previa de la ecuación no está disponible.');
        return;
    }
    try {
        const latex = mathField.latex();
        const coloredLatex = applyColorToEquation(latex, color);
        MathJax.texReset();
        MathJax.typesetClear();
        equationPreview.innerHTML = '';
        MathJax.tex2svgPromise(coloredLatex).then((node) => {
            equationPreview.appendChild(node);
            return MathJax.typesetPromise([equationPreview]);
        }).catch((err) => handleError(`Error al renderizar la ecuación: ${err.message}`));
    } catch (error) {
        handleError(`Error al actualizar la vista previa de la ecuación: ${error.message}`);
    }
}

function prepareEquationInsertion() {
    if (!isMathJaxLoaded()) {
        handleError('MathJax no está cargado. No se puede insertar la ecuación.');
        return;
    }
    try {
        const latex = mathField.latex();
        const coloredLatex = applyColorToEquation(latex, color);
        MathJax.tex2svgPromise(coloredLatex).then((node) => {
            const svg = node.querySelector('svg');
            if (!svg) {
                throw new Error('No se pudo generar el SVG de la ecuación');
            }
            const svgData = new XMLSerializer().serializeToString(svg);
            const img = new Image();
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            img.onload = () => {
                equationToInsert = {
                    img: img,
                    width: img.width,
                    height: img.height
                };
                URL.revokeObjectURL(url);
                isPositioningEquation = true;
                canvas.style.cursor = 'crosshair';
                equationEditor.style.display = 'none';
            };
            img.onerror = () => {
                handleError('Error al cargar la imagen de la ecuación');
            };
            img.src = url;
        }).catch((err) => handleError(`Error al preparar la inserción de la ecuación: ${err.message}`));
    } catch (error) {
        handleError(`Error al preparar la inserción de la ecuación: ${error.message}`);
    }
}

function insertEquationAtPosition(x, y) {
    // Verificaciones silenciosas
    if (!equationToInsert || !isCanvasAvailable()) {
        return false; // Retorna false en lugar de mostrar error
    }

    try {
        const scaledWidth = equationToInsert.width * equationSize;
        const scaledHeight = equationToInsert.height * equationSize;
        
        ctx.drawImage(equationToInsert.img, x, y, scaledWidth, scaledHeight);
        
        drawingActions.push({
            tool: 'equation',
            img: equationToInsert.img,
            x: x,
            y: y,
            width: scaledWidth,
            height: scaledHeight
        });
        
        equationToInsert = null;
        return true; // Indica éxito sin mostrar mensaje
    } catch (error) {
        console.log(`Error silencioso: ${error.message}`); // Log silencioso para debugging
        return false;
    }
}

// Event listeners
window.addEventListener('resize', resizeCanvas);
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

document.getElementById('pencil').addEventListener('click', () => tool = 'pencil');
document.getElementById('eraser').addEventListener('click', () => tool = 'eraser');
marker.addEventListener('click', () => tool = 'marker');
document.getElementById('backgroundBtn').addEventListener('click', () => backgroundInput.click());
document.getElementById('equationBtn').addEventListener('click', () => equationEditor.style.display = 'block');
document.getElementById('line').addEventListener('click', () => tool = 'line');
document.getElementById('selection').addEventListener('click', () => tool = 'selection');
document.getElementById('insertEquation').addEventListener('click', () => {
    prepareEquationInsertion();
    insertEquationAtPosition(50, 50);
});
document.getElementById('positionEquation').addEventListener('click', prepareEquationInsertion);
document.getElementById('cancelEquation').addEventListener('click', () => {
    equationEditor.style.display = 'none';
    isPositioningEquation = false;
    canvas.style.cursor = 'default';
});

sizeSelector.addEventListener('input', () => size = sizeSelector.value);
colorPicker.addEventListener('input', () => {
    color = colorPicker.value;
    updateEquationPreview();
});

backgroundInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target.result;
                // Comprobar el tamaño del resultado
                if (result.length > 5 * 1024 * 1024) { // 5 MB
                    throw new Error("La imagen es demasiado grande para guardar en localStorage");
                }
                backgroundImage.src = result;
                localStorage.setItem('backgroundImage', result);
                console.log("Imagen guardada con éxito en localStorage");
            } catch (error) {
                console.error("Error al guardar la imagen:", error);
                alert("No se pudo guardar la imagen. Puede ser demasiado grande o tener un formato no compatible.");
            }
        };
        reader.onerror = (error) => {
            console.error("Error al leer el archivo:", error);
            alert("Hubo un error al leer el archivo. Por favor, intenta con otra imagen.");
        };
        reader.readAsDataURL(file);
    }
});

document.querySelectorAll('.equation-button').forEach(button => {
    button.addEventListener('click', () => {
        mathField.cmd(button.dataset.latex);
        mathField.focus();
    });
});

// Inicialización
resizeCanvas();
loadBackgroundImage();

// Función para limpiar el canvas
function borrarCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawingActions = []; // Limpiar el historial de acciones
}

// Asigna el evento click al botón para borrar el canvas
document.getElementById('borrarCanvas').addEventListener('click', borrarCanvas);


function applyColorToEquation(latex, color) {
    // Convertir el color hexadecimal a valores RGB
    const hex = color.replace(/^#/, '');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    // Aplicar el color usando el formato RGB
    return `\\color{rgb(${r},${g},${b})}{${latex}}`;
}

function updateSizeDisplay() {
    const sizeSelector = document.getElementById('sizeSelector');
    const sizeDisplay = document.getElementById('sizeDisplay');

    // Set initial value
    sizeSelector.value = 5;
    sizeDisplay.textContent = sizeSelector.value;

    // Update the display and global size variable when the value changes
    sizeSelector.addEventListener('input', () => {
        size = parseInt(sizeSelector.value);
        sizeDisplay.textContent = size;
    });

    // Set initial global size
    size = 5;
}

// Llama a esta función después de que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', updateSizeDisplay);

// Inicialización con manejo de errores
document.addEventListener('DOMContentLoaded', function () {
    if (!isCanvasAvailable()) {
        handleError('El canvas no está disponible. La pizarra no funcionará correctamente.');
        return;
    }

    try {
        resizeCanvas();
        loadBackgroundImage();
        const mathField = initMathQuill();
        if (!mathField) {
            handleError('No se pudo inicializar el editor de ecuaciones');
        }
    } catch (error) {
        handleError(`Error durante la inicialización: ${error.message}`);
    }
});

// Event listeners con manejo de errores
document.getElementById('insertEquation').addEventListener('click', () => {
    try {
        prepareEquationInsertion();
        insertEquationAtPosition(50, 50);
    } catch (error) {
        handleError(`Error al insertar la ecuación: ${error.message}`);
    }
});

document.getElementById('positionEquation').addEventListener('click', () => {
    try {
        prepareEquationInsertion();
    } catch (error) {
        handleError(`Error al posicionar la ecuación: ${error.message}`);
    }
});