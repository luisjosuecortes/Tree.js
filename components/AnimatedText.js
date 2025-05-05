import React from 'react';

const AnimatedText = ({ onStartFollow }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen absolute top-0 left-0 w-full" style={{ 
        zIndex: 1, 
        userSelect: 'none', // Añadir esta línea para prevenir selección
        WebkitUserSelect: 'none', // Prefijo para Safari
        MozUserSelect: 'none', // Prefijo para Firefox
        msUserSelect: 'none' // Prefijo para IE/Edge
    }}>
      <h1 style={{
        color: 'white',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '6rem', 
        fontWeight: '900', // Extra bold
        textShadow: '0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3)', // Efecto de resplandor
        textAlign: 'center',
        letterSpacing: '0.05em', // Espaciado entre letras
        textTransform: 'uppercase', // Todo en mayúsculas
        WebkitTextStroke: '2px white', // Contorno blanco para letras más gruesas (funciona en navegadores WebKit)
        filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' // Sombra suave para efecto de brillo
      }}>
        ANIMACIONES
      </h1>
      <p style={{
        color: 'white',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '1.8rem',
        fontWeight: '700', // Bold
        marginTop: '-0.5rem', // Valor negativo para acercarlo
        textAlign: 'center', // Mantenemos centrado el bloque, pero empujamos contenido
        letterSpacing: '0.1em',
        textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
        opacity: '0.9',
        width: '100%', // Aseguramos que ocupe ancho para que el padding funcione
        paddingLeft: '25%', // Añadido padding izquierdo para empujar a la derecha
        boxSizing: 'border-box' // Incluir padding en el ancho total
      }}>
        CON THREE.JS
      </p>
      
      {/* Nuevo párrafo descriptivo similar al de la imagen */}
      <div style={{
        color: 'white',
        fontFamily: 'monospace', /* Cambiado a tipografía monoespaciada como en la imagen */
        fontSize: '1.2rem',
        fontWeight: '400',
        marginTop: '2.5rem',
        textAlign: 'center',
        maxWidth: '80%',
        lineHeight: '1.6',
        opacity: '0.8',
        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
      }}>
        <p>
          Notas y proyectos de <a href="https://twitter.com/luiscortespn" target="_blank" rel="noopener noreferrer" style={{color: '#aaaaff', textDecoration: 'underline'}}>@luiscortespenguin</a> con THREE.JS
        </p>
      </div>
      {/* Nuevo párrafo "VER PROYECTOS" con onClick */}
      <p
        style={{
          color: 'white',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '1.5rem', // Tamaño ligeramente menor que el subtítulo
          fontWeight: '700', // Bold
          marginTop: '3rem', // Más espacio arriba
          textAlign: 'center',
          letterSpacing: '0.15em', // Espaciado entre letras aumentado
          textTransform: 'uppercase', // Todo en mayúsculas
          textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
          opacity: '0.8', // Opacidad inicial (la animación la manejará)
          cursor: 'pointer', // Indicar que es clickeable
          transition: 'opacity 0.3s ease', // Transición suave al pasar el ratón (se puede quitar si la animación es suficiente)
          animation: 'blink-scale 2s infinite ease-in-out' // Aplicar la animación
        }}
        onClick={onStartFollow} // Llamar a la función pasada por prop al hacer clic
      >
        VER PROYECTOS
      </p>
    </div>
  );
};

export default AnimatedText; 