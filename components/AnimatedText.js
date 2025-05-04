import React from 'react';

const AnimatedText = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen absolute top-0 left-0 w-full" style={{ zIndex: 1 }}>
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
        marginTop: '0.5rem',
        textAlign: 'center',
        letterSpacing: '0.1em', // Mayor espaciado para subtítulo
        textShadow: '1px 1px 3px rgba(0,0,0,0.5)', // Sombra sutil para legibilidad
        opacity: '0.9' // Ligeramente translúcido
      }}>
        CON THREE.JS
      </p>
      
      {/* Nuevo párrafo descriptivo similar al de la imagen */}
      <div style={{
        color: 'white',
        fontFamily: 'Arial, Helvetica, sans-serif',
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
          Notas y codigo de mis proyectos con THREE.JS
        </p>
      </div>
    </div>
  );
};

export default AnimatedText; 