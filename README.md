# Pizarra Interactiva con Editor de Ecuaciones

Una aplicación web interactiva que permite a los usuarios dibujar, escribir ecuaciones matemáticas y manipular contenido en un lienzo digital. Esta herramienta es ideal para profesores, estudiantes y profesionales que necesitan crear contenido matemático de forma visual.

## 🌟 Características

- **Herramientas de Dibujo**:
  - Lápiz para dibujo a mano alzada
  - Plumón con opacidad reducida
  - Borrador
  - Herramienta de línea recta
  - Selección y manipulación de objetos

- **Editor de Ecuaciones**:
  - Soporte para fórmulas matemáticas complejas
  - Símbolos matemáticos predefinidos (x², √, ∫, Σ, π, θ, ∞)
  - Vista previa en tiempo real
  - Ajuste de tamaño de ecuaciones

- **Personalización**:
  - Selector de colores
  - Control de grosor de trazo
  - Fondo personalizable
  - Borrado completo del canvas

## 🛠️ Tecnologías Utilizadas

- HTML5 Canvas
- JavaScript (ES6+)
- MathJax para renderizado de ecuaciones
- MathQuill para editor de ecuaciones
- jQuery

## 📋 Requisitos Previos

```html
- Navegador web moderno con soporte para HTML5
- Conexión a Internet (para cargar las bibliotecas CDN)
```

## 🚀 Instalación

1. Clone el repositorio:
```bash
git clone [URL-del-repositorio]
```

2. Asegúrese de tener todos los archivos necesarios:
```
├── index.html
├── styles.css
└── js/
    └── script.js
```

3. Abra `index.html` en su navegador web

## 💻 Uso

### Herramientas Básicas

- **Lápiz**: Dibujo a mano alzada
- **Plumón**: Dibujo con opacidad reducida
- **Borrador**: Elimina partes del dibujo
- **Línea**: Dibuja líneas rectas
- **Selección**: Permite mover objetos dibujados
- **Fondo**: Permite añadir una imagen de fondo
- **Ecuaciones**: Abre el editor de ecuaciones matemáticas

### Editor de Ecuaciones

1. Haga clic en el botón "Ecuaciones"
2. Use los botones predefinidos o escriba su ecuación
3. Ajuste el tamaño con el control numérico
4. Haga clic en "Posicionar" para colocar la ecuación
5. Haga clic en el canvas donde desee insertar la ecuación

### Personalización

- Use el selector de color para cambiar el color de dibujo
- Ajuste el grosor del trazo con el control deslizante
- El botón "Borrar Canvas" limpia todo el contenido

## 🤝 Contribución

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Cree una rama para su característica
3. Commit sus cambios
4. Push a la rama
5. Abra un Pull Request

## 📝 Notas Importantes

- Las ecuaciones se renderizan como SVG para mantener la calidad
- El canvas se redimensiona automáticamente con la ventana
- Las imágenes de fondo se guardan en localStorage
- El tamaño máximo recomendado para imágenes de fondo es 5MB

## ⚠️ Limitaciones Conocidas

- Las ecuaciones insertadas no se pueden editar una vez colocadas
- El deshacer/rehacer no está implementado
- El almacenamiento local tiene límites de tamaño para imágenes de fondo


## 📄 Licencia

Este proyecto está bajo la Licencia MIT - vea el archivo LICENSE.md para detalles