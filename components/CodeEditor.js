import React, { useRef, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import { indentUnit } from '@codemirror/language';
import { autocompletion } from '@codemirror/autocomplete';

// Personalizar el tema para que tenga un aspecto transparente y mejorado
const customTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent !important',
    height: 'auto !important',
    minHeight: '100%',
    fontSize: '15px', // Aumentado ligeramente para mejor legibilidad
    position: 'relative',
  },
  '.cm-scroller': {
    overflow: 'auto', // Permitir scroll en todas direcciones
    fontFamily: '"Fira Code", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    lineHeight: '1.5', // Mejorar espaciado entre líneas
    // Estilos personalizados para las barras de desplazamiento (ahora visibles)
    '&::-webkit-scrollbar': {
      width: '8px', // Ancho de la barra de desplazamiento vertical
      height: '8px', // Altura de la barra de desplazamiento horizontal
    },
    '&::-webkit-scrollbar-track': {
      background: 'rgba(0, 0, 0, 0.2)', // Fondo semi-transparente para la pista
      borderRadius: '4px', // Bordes redondeados
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(59, 130, 246, 0.5)', // Color azul semi-transparente (coincide con el tema)
      borderRadius: '4px', // Bordes redondeados
      border: '2px solid transparent', // Borde para crear un efecto "flotante"
      backgroundClip: 'padding-box', // Evita que el fondo se vea en los bordes
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: 'rgba(59, 130, 246, 0.7)', // Más opaco al pasar el cursor
    },
    '&::-webkit-scrollbar-corner': {
      background: 'transparent', // Esquina transparente
    },
    // Estilos para Firefox
    scrollbarWidth: 'thin', // Mostrar barras delgadas en Firefox
    scrollbarColor: 'rgba(59, 130, 246, 0.5) rgba(0, 0, 0, 0.2)', // Color del thumb y track para Firefox
  },
  '.cm-content': {
    caretColor: '#5eead4',
    minHeight: '100%',
    paddingBottom: 'calc(100% - 100px)', // Mucho más padding para scroll extenso
    paddingTop: '8px', // Añadir un poco de espacio superior
    whiteSpace: 'pre', // Forzar espacio en blanco para evitar wrapping automático
  },
  '.cm-cursor': {
    borderLeftColor: '#5eead4',
    borderLeftWidth: '2px', // Cursor más visible
    transition: 'opacity 0.15s ease', // Animación suave para el cursor
    // Eliminamos la animación de pulsación
  },
  '.cm-gutters': {
    backgroundColor: 'rgba(30, 41, 59, 0.4)', // Cambio de negro a gris azulado oscuro
    color: '#6b7280',
    border: 'none',
    borderRight: '1px solid rgba(45, 55, 72, 0.5)',
    paddingRight: '8px', // Más espacio para los números de línea
    transition: 'background-color 0.2s ease', // Animación suave para cambios
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(59, 130, 246, 0.25)', // Un poco más visible
    color: '#93c5fd',
    transition: 'background-color 0.2s ease, color 0.2s ease',
    // Eliminamos la animación de pulsación
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(30, 58, 138, 0.25)', // Un poco más visible
    borderRadius: '3px', // Bordes redondeados para la línea activa
    transition: 'background-color 0.2s ease', // Transición suave
    // Eliminamos la animación de pulsación
  },
  '.cm-selectionMatch': {
    backgroundColor: 'rgba(45, 212, 191, 0.3)', // Más visible
    borderRadius: '3px', // Bordes redondeados
    // Eliminamos el efecto de resplandor
  },
  '.cm-line': {
    paddingLeft: '8px', // Más espacio para mejor legibilidad
    fontSize: '15px',
    fontVariantLigatures: 'none', // Desactivar ligaduras para mejor claridad
    transition: 'background-color 0.2s ease', // Transición más sutil solo para el color de fondo
    borderRadius: '3px', // Bordes redondeados para las líneas
    position: 'relative', // Para el hover y efectos
    '&:hover': {
      backgroundColor: 'rgba(59, 130, 246, 0.1)', // Fondo sutil al pasar el ratón (más sutil)
      // Eliminamos el desplazamiento y el espaciado de letras para un efecto más natural
    },
    '&.cm-active': { // Línea actual seleccionada
      color: '#ffffff', // Color más brillante
    }
  },
  // Añadir efectos sutiles para tokens y texto en hover
  '.cm-content .cm-line span': {
    transition: 'color 0.2s ease',
    borderRadius: '2px',
  },
  '.cm-content .cm-line span:hover': {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    animation: 'textTokenHover 1.5s infinite ease-in-out',
  },
  '.cm-selected': { // Mejorar el estilo de selección de texto
    backgroundColor: 'rgba(59, 130, 246, 0.4) !important', // Azul más vibrante
    borderRadius: '3px', // Bordes redondeados para la selección
    transition: 'background-color 0.2s ease', // Suavizar cambios
    animation: 'textHighlight 2s infinite ease-in-out', // Añadir una animación sutil
  },
  '.cm-searchMatch': {
    backgroundColor: 'rgba(250, 204, 21, 0.3)',
    outline: '1px solid rgba(234, 179, 8, 0.5)',
    borderRadius: '3px', // Bordes redondeados
    // Eliminamos la animación pulsante
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'rgba(234, 179, 8, 0.4)',
    // Eliminamos el resplandor
  },
  // Estilos para indentación y espacios en blanco
  '.cm-indent': {
    position: 'relative',
    display: 'inline-block',
  },
  // Mejora para bloques de funciones
  '.cm-line:has(.ͼb.ͼ9)': { // Selector para líneas con definición de función
    marginTop: '4px', // Espacio adicional antes de las funciones
    '&:hover': {
      backgroundColor: 'rgba(99, 102, 241, 0.15)', // Color especial para funciones (más sutil)
    }
  },
  // Estilo especial para palabras clave
  '.cm-keyword': {
    transition: 'color 0.2s ease',
    '&:hover': {
      color: '#a78bfa !important', // Color más brillante al pasar el ratón
      // Eliminamos el resplandor
      cursor: 'pointer',
    }
  },
  // Estilo especial para strings
  '.cm-string': {
    transition: 'color 0.2s ease',
    '&:hover': {
      color: '#86efac !important', // Verde más brillante al pasar el ratón
      // Eliminamos el resplandor
      cursor: 'pointer',
    }
  },
  // Estilos para el panel de autocompletado
  '.cm-tooltip': {
    backgroundColor: 'rgba(15, 23, 42, 0.95) !important',
    border: '1px solid rgba(59, 130, 246, 0.3) !important',
    borderRadius: '6px',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3), 0 0 10px rgba(59, 130, 246, 0.2)', // Resplandor azul
    overflow: 'hidden',
    animation: 'tooltipAppear 0.2s ease-out', // Animación de aparición
  },
  '.cm-tooltip.cm-tooltip-autocomplete': {
    minWidth: '220px',
    '& > ul': {
      backgroundColor: 'transparent !important',
      fontFamily: '"Fira Code", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: '14px',
      maxHeight: '300px',
      scrollbarWidth: 'none', // Para Firefox
      msOverflowStyle: 'none', // Para IE y Edge
      '&::-webkit-scrollbar': {
        display: 'none', // Ocultar completamente la barra de desplazamiento
      },
    },
    '& > ul > li': {
      padding: '4px 8px',
      borderRadius: '4px',
      margin: '2px 4px',
      transition: 'background-color 0.15s ease, transform 0.15s ease', // Animación al pasar ratón
    },
    '& > ul > li:hover': {
      backgroundColor: 'rgba(59, 130, 246, 0.25) !important',
      transform: 'translateX(3px)', // Desplazamiento al pasar el ratón
    },
    '& > ul > li[aria-selected]': {
      backgroundColor: 'rgba(59, 130, 246, 0.35) !important',
      color: '#ffffff',
      transform: 'translateX(5px)', // Mayor desplazamiento para el elemento seleccionado
      boxShadow: '0 0 10px rgba(59, 130, 246, 0.2)', // Sutil resplandor para el elemento seleccionado
    }
  },
  // Estilos para tipos de items en el autocompletado
  '.cm-completionIcon': {
    marginRight: '8px',
    color: '#94a3b8',
    width: '1.2em',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s ease', // Animación al pasar ratón
  },
  '.cm-completionIcon-function': {
    color: '#9D8FFF !important',
    '&:before': { content: "'ƒ'" },
    '&:hover': {
      transform: 'scale(1.2) rotate(5deg)', // Escalar y rotar ligeramente al pasar el ratón
    }
  },
  '.cm-completionIcon-method': {
    color: '#C792EA !important',
    '&:before': { content: "'ƒ'" },
    '&:hover': {
      transform: 'scale(1.2) rotate(-5deg)', // Escalar y rotar ligeramente al pasar el ratón
    }
  },
  '.cm-completionIcon-keyword': {
    color: '#FF5AFF !important',
    '&:before': { content: "'🔑'" },
    '&:hover': {
      transform: 'scale(1.2) rotate(10deg)', // Escalar y rotar al pasar el ratón
    }
  },
  '.cm-completionIcon-constant': {
    color: '#FFA53D !important',
    '&:before': { content: "'𝝿'" },
    '&:hover': {
      transform: 'scale(1.2)', // Escalar al pasar el ratón
    }
  },
  '.cm-completionIcon-variable': {
    color: '#80E1FF !important',
    '&:before': { content: "'𝘃'" },
    '&:hover': {
      transform: 'scale(1.2) rotate(-5deg)', // Escalar y rotar ligeramente al pasar el ratón
    }
  },
  '.cm-completionIcon-class': {
    color: '#66D9E8 !important',
    '&:before': { content: "'𝗖'" },
    '&:hover': {
      transform: 'scale(1.2)', // Escalar al pasar el ratón
    }
  },
  // Estilos para el texto de autocompletado
  '.cm-completionLabel': {
    color: '#e2e8f0',
    transition: 'color 0.15s ease', // Animación suave para cambios de color
  },
  '.cm-completionDetail': {
    color: '#94A3B8',
    fontStyle: 'italic',
    fontSize: '0.9em',
    transition: 'color 0.15s ease', // Animación suave para cambios de color
  },
  '.cm-completionMatchedText': {
    color: '#4ADE80',
    textDecoration: 'underline',
    fontWeight: '500',
    transition: 'all 0.15s ease', // Animación suave para todos los cambios
  }
});

// Personalizar los colores de sintaxis con énfasis en funciones y definiciones
const highlightStyle = HighlightStyle.define([
  // Sintaxis con colores personalizados para mejor legibilidad de código
  { tag: t.keyword, color: '#78A9FF', fontWeight: '600' }, // Azul brillante para keywords
  { tag: t.comment, color: '#7A8899', fontStyle: 'italic' }, // Gris azulado para comentarios
  { tag: t.string, color: '#4ADE80', fontWeight: '400' }, // Verde más vivo
  { tag: t.number, color: '#FFA53D', fontWeight: '500' }, // Naranja más vibrante
  { tag: t.operator, color: '#FF5AFF', fontWeight: '500' }, // Rosa más vivo
  { tag: t.definitionKeyword, color: '#C792EA', fontWeight: '600' }, // Destacar palabras clave de definición
  { tag: t.function(t.definitionKeyword), color: '#C792EA', fontWeight: '600' }, 
  { tag: t.function(t.variableName), color: '#9D8FFF', fontWeight: '600' }, // Morado/violeta para funciones
  { tag: t.definition(t.function(t.variableName)), color: '#9D8FFF', fontWeight: '700' }, // Destacar nombres de funciones definidas
  { tag: t.typeName, color: '#8BE9FD' }, // Azul turquesa para tipos
  { tag: t.className, color: '#8BE9FD', fontWeight: '600' }, // Clases más destacadas
  { tag: t.propertyName, color: '#B4BEFE' }, // Lila para propiedades
  { tag: t.variableName, color: '#80E1FF' }, // Azul celeste más vibrante y claro para variables
  { tag: t.definition(t.variableName), color: '#80E1FF', fontWeight: '500' }, // Destacar definiciones de variables
  { tag: t.bool, color: '#FFA53D', fontWeight: '500' }, // Naranja más vibrante para booleanos
  { tag: t.null, color: '#FFA53D', fontWeight: '500' }, // Null más destacado
  { tag: t.self, color: '#FF79C6', fontWeight: '600' }, // Rosa para self
  { tag: t.special(t.variableName), color: '#FF79C6' }, // Para variables especiales
  { tag: t.moduleKeyword, color: '#78A9FF', fontWeight: '600' }, // Para import/from
  { tag: t.controlKeyword, color: '#78A9FF', fontWeight: '600' }, // Para palabras clave de control de flujo
  { tag: t.annotation, color: '#94a3b8' }, // Para anotaciones
  // Agregamos elementos que faltaban para mejor estilo
  { tag: t.meta, color: '#D8B4FE' }, // Para metatags
  { tag: t.link, color: '#60A5FA', textDecoration: 'underline' }, // Para enlaces
  { tag: t.heading, color: '#F9A8D4', fontWeight: '700' }, // Para encabezados en comentarios
  { tag: t.emphasis, fontStyle: 'italic' }, // Para énfasis
  { tag: t.strong, fontWeight: '700' }, // Para texto fuerte
  { tag: t.atom, color: '#FFD700' }, // Para átomos y símbolos
  { tag: t.contentSeparator, color: '#94A3B8' }, // Para separadores de contenido
]);

// Configuración de autocompletado mejorada para JavaScript
const jsCompletion = autocompletion({
  override: [
    (context) => {
      const word = context.matchBefore(/\w*/)
      if (word === null || word.from === word.to && !context.explicit)
        return null
      return {
        from: word.from,
        options: [
          // Palabras clave comunes en JavaScript
          { label: "function", type: "keyword" },
          { label: "return", type: "keyword" },
          { label: "if", type: "keyword" },
          { label: "else", type: "keyword" },
          { label: "const", type: "keyword" },
          { label: "let", type: "keyword" },
          { label: "var", type: "keyword" },
          { label: "for", type: "keyword" },
          { label: "while", type: "keyword" },
          { label: "import", type: "keyword" },
          { label: "export", type: "keyword" },
          { label: "class", type: "keyword" },
          { label: "try", type: "keyword" },
          { label: "catch", type: "keyword" },
          { label: "finally", type: "keyword" },
          { label: "switch", type: "keyword" },
          { label: "case", type: "keyword" },
          { label: "break", type: "keyword" },
          { label: "null", type: "constant" },
          { label: "true", type: "constant" },
          { label: "false", type: "constant" },
          { label: "undefined", type: "constant" },
          // Funciones comunes
          { label: "console.log", type: "function" },
          { label: "Math.random", type: "function" },
          { label: "setTimeout", type: "function" },
          { label: "setInterval", type: "function" },
          { label: "clearTimeout", type: "function" },
          { label: "clearInterval", type: "function" },
          { label: "parseInt", type: "function" },
          { label: "parseFloat", type: "function" },
          { label: "String", type: "function" },
          { label: "Number", type: "function" },
          { label: "Boolean", type: "function" },
          { label: "Array", type: "function" },
          { label: "Object", type: "function" },
          { label: "JSON.parse", type: "function" },
          { label: "JSON.stringify", type: "function" },
          // Métodos de colecciones
          { label: "forEach", type: "method" },
          { label: "map", type: "method" },
          { label: "filter", type: "method" },
          { label: "reduce", type: "method" },
          { label: "find", type: "method" },
          { label: "some", type: "method" },
          { label: "every", type: "method" },
          { label: "includes", type: "method" },
          { label: "push", type: "method" },
          { label: "pop", type: "method" },
          { label: "shift", type: "method" },
          { label: "unshift", type: "method" },
          { label: "join", type: "method" },
          { label: "slice", type: "method" },
          { label: "splice", type: "method" },
          // React
          { label: "useState", type: "function" },
          { label: "useEffect", type: "function" },
          { label: "useRef", type: "function" },
          { label: "useCallback", type: "function" },
          { label: "useMemo", type: "function" },
          { label: "useContext", type: "function" },
          { label: "useReducer", type: "function" },
          { label: "React.createElement", type: "function" },
          { label: "React.Fragment", type: "variable" },
          // Arreglos y objetos
          { label: "[]", type: "constant", apply: "[]", detail: "array" },
          { label: "{}", type: "constant", apply: "{}", detail: "object" },
          { label: "=>", type: "keyword", apply: " => ", detail: "arrow function" },
          // Three.js
          { label: "THREE.Scene", type: "class" },
          { label: "THREE.PerspectiveCamera", type: "class" },
          { label: "THREE.WebGLRenderer", type: "class" },
          { label: "THREE.BoxGeometry", type: "class" },
          { label: "THREE.MeshBasicMaterial", type: "class" },
          { label: "THREE.Mesh", type: "class" },
          { label: "THREE.Vector3", type: "class" },
          { label: "THREE.Color", type: "class" },
        ]
      }
    }
  ]
});

// Creamos una extensión personalizada para preservar la posición del cursor
function cursorPreservationExtension() {
  let isProcessing = false;
  
  return EditorView.updateListener.of((update) => {
    // Evitar recursión infinita
    if (isProcessing) return;
    
    // Solo actuar cuando hay un cambio en el documento
    if (update.docChanged) {
      isProcessing = true;
      
      // Ejecutamos en el próximo ciclo para permitir que CodeMirror termine su actualización
      setTimeout(() => {
        try {
          // Asegurarnos de que el cursor se mantenga visible
          if (update.view) {
            update.view.dispatch({
              effects: EditorView.scrollIntoView(update.state.selection.main.head)
            });
          }
        } finally {
          isProcessing = false;
        }
      }, 0);
    }
  });
}

const CodeEditor = ({ code, onChange, language = 'javascript', isModified = false }) => {
  // Referencia al editor
  const editorRef = useRef(null);
  
  // Guarda la posición del cursor entre renderizados
  const cursorPosRef = useRef(0);
  
  // Referencia para el estado de inicialización
  const isInitializedRef = useRef(false);
  
  // Referencia para el contenedor del editor
  const editorContainerRef = useRef(null);
  
  // Configurar el manejo mejorado del scroll para trackpad
  useEffect(() => {
    // Utilizamos directamente la referencia del editor para obtener el DOM del scroller
    const handleScroll = (e) => {
      const view = editorRef.current;
      if (!view) return;
      
      const scroller = view.scrollDOM;
      if (!scroller) return;
      
      // Determinar si es un gesto de trackpad
      // La detección es más robusta: los eventos de trackpad tienen valores pequeños y fraccionarios
      const isTrackpadGesture = Math.abs(e.deltaY) < 20 && !Number.isInteger(e.deltaY);
      
      // Factores de velocidad diferentes para trackpad vs rueda de ratón
      const speedFactor = isTrackpadGesture ? 0.8 : 1.5;
      
      if (Math.abs(e.deltaY) > 0) {
        // Calcular la cantidad de desplazamiento
        const scrollAmount = e.deltaY * speedFactor;
        
        // Aplicar el desplazamiento directamente al contenedor
        scroller.scrollTop += scrollAmount;
        
        // Prevenir el comportamiento por defecto para tener control total
        e.preventDefault();
        e.stopPropagation();
        
        // Disparar un evento de scroll para que el editor actualice su estado
        const scrollEvent = new Event('scroll', { bubbles: true });
        scroller.dispatchEvent(scrollEvent);
      }
    };
    
    // Mejor manejo de la espera para que el editor esté listo
    const setupScrollHandler = () => {
      // Esperar a que el editor esté completamente inicializado
      if (!editorRef.current) {
        // Intentar de nuevo en un momento
        setTimeout(setupScrollHandler, 50);
        return;
      }
      
      const scroller = editorRef.current.scrollDOM;
      if (scroller) {
        // Limpiar cualquier controlador existente antes de añadir uno nuevo
        scroller.removeEventListener('wheel', handleScroll);
        // Agregar el controlador al contenedor específico de esta instancia
        scroller.addEventListener('wheel', handleScroll, { passive: false });
        console.log('Controlador de scroll configurado correctamente');
      }
    };
    
    // Iniciar la configuración
    setupScrollHandler();
    
    // Limpieza al desmontar
    return () => {
      if (editorRef.current && editorRef.current.scrollDOM) {
        editorRef.current.scrollDOM.removeEventListener('wheel', handleScroll);
      }
    };
  }, []);
  
  // Extensión para monitorear el editor
  const monitorEditor = EditorView.updateListener.of((update) => {
    // Actualizar la referencia
    editorRef.current = update.view;
    
    // Guardar la posición del cursor cuando cambia
    if (update.selectionSet) {
      cursorPosRef.current = update.state.selection.main.head;
    }
  });
  
  // Función que maneja cambios en el editor con preservación de cursor
  const handleChange = (value) => {
    // Una vez que el usuario comienza a editar, marcar como inicializado para evitar manipulaciones
    isInitializedRef.current = true;
    onChange(value);
  };
  
  // Seleccionar las extensiones de lenguaje adecuadas
  const languageExtension = javascript(); // Por defecto usamos JavaScript

  return (
    <div 
      ref={editorContainerRef}
      style={{
        width: '100%', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(51, 65, 85, 0.3)',
        borderRadius: '6px',
        overflow: 'hidden', // Cambiado de 'auto' a 'hidden' para evitar barras duplicadas
        position: 'relative', // Para posicionar el indicador modificado
      }}>
      {/* Estilos para las barras de desplazamiento y animaciones */}
      <style jsx>{`
        /* Estilos personalizados para barras de desplazamiento en contenedor principal */
        div::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        div::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        div::-webkit-scrollbar-thumb {
          background-color: rgba(59, 130, 246, 0.5);
          border-radius: 4px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        div::-webkit-scrollbar-thumb:hover {
          background-color: rgba(59, 130, 246, 0.7);
        }
        div::-webkit-scrollbar-corner {
          background: transparent;
        }
        
        /* Asegurarnos de que las interacciones de puntero funcionan correctamente */
        .cm-scroller {
          pointer-events: auto !important;
          touch-action: pan-y !important;
        }
        
        /* Hacer que el editor ocupe todo el espacio disponible */
        .cm-editor {
          height: 100%;
          min-height: 100%;
        }
        
        /* Simplificamos las animaciones para los efectos del editor */
        
        /* Estilos para líneas al pasar el ratón - más sutil */
        .cm-line:hover {
          z-index: 1;
        }
        
        /* Animación sutil para resaltado de texto */
        @keyframes textHighlight {
          0%, 100% { box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1); }
          50% { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }
        }
        
        /* Animación sutil para elementos de texto en hover */
        @keyframes textTokenHover {
          0%, 100% { box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1); }
          50% { box-shadow: 0 0 3px 1px rgba(59, 130, 246, 0.2); }
        }
        
        /* Estilo para elementos de texto en hover */
        .cm-content .cm-line span:hover {
          background-color: rgba(59, 130, 246, 0.15);
          position: relative;
          z-index: 2;
        }
      `}</style>
      
      {isModified && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'rgba(15, 23, 42, 0.35)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '4px',
          padding: '3px 8px',
          fontSize: '11px',
          fontWeight: '500',
          letterSpacing: '0.3px',
          color: '#93c5fd',
          zIndex: 20,
          fontFamily: '"Fira Code", Menlo, Monaco, Consolas, monospace',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
          }
        }}>
          <span style={{ 
            fontSize: '14px', 
            marginTop: '-2px',
            color: '#4ADE80'
          }}>•</span>
          Modificado
        </div>
      )}
      
      <CodeMirror
        value={code}
        extensions={[
          languageExtension,
          syntaxHighlighting(highlightStyle),
          indentUnit.of("  "), // 2 espacios para indentación en JavaScript
          jsCompletion,
          monitorEditor,
          cursorPreservationExtension(), // Extensión personalizada para preservar cursor
        ]}
        onChange={handleChange}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
        theme={customTheme}
        style={{ 
          flex: 1,
          fontFamily: '"Fira Code", monospace',
          fontSize: '15px',
          height: '100%', // Asegurar que el editor ocupe todo el espacio
          minHeight: '100%', // Asegurar altura mínima
          display: 'flex', // Usar flexbox para ocupar todo el espacio
          flexDirection: 'column'
        }}
      />
    </div>
  );
};

export default CodeEditor; 
