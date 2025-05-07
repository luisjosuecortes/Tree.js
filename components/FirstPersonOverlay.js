import React, { useState, useEffect, useRef } from 'react';

const FirstPersonOverlay = ({ isVisible }) => {
  const [fadeIn, setFadeIn] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState(null); // 'in' o 'out'
  const [showScrollHint, setShowScrollHint] = useState(true); // Estado para controlar la visibilidad del mensaje
  const overlayRef = useRef(null);
  const scrollActionTriggered = useRef(false);

  // Efecto para animar la entrada
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setFadeIn(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setFadeIn(false);
      // Restablecer a la primera página cuando el overlay se oculta
      setCurrentPage(0);
      // Restaurar el mensaje de scroll para la próxima vez que se muestre
      setShowScrollHint(true);
    }
  }, [isVisible]);

  // Efecto para gestionar el cambio de página con animación
  useEffect(() => {
    if (isTransitioning) {
      const transitionTimer = setTimeout(() => {
        setIsTransitioning(false);
        setTransitionDirection(null);
      }, 500); // Debe coincidir con la duración de las transiciones CSS
      
      return () => clearTimeout(transitionTimer);
    }
  }, [isTransitioning]);

  // Efecto para ocultar el mensaje de scroll después de unos segundos
  useEffect(() => {
    if (isVisible && showScrollHint) {
      const hideHintTimer = setTimeout(() => {
        setShowScrollHint(false);
      }, 5000); // Ocultar después de 5 segundos
      
      return () => clearTimeout(hideHintTimer);
    }
  }, [isVisible, showScrollHint]);

  // Efecto para gestionar el scroll
  useEffect(() => {
    if (!isVisible || !overlayRef.current) return;

    // Función para manejar el scroll
    const handleScroll = (e) => {
      // Evitamos procesamiento si ya se ha desencadenado una acción o si hay una transición en curso
      if (scrollActionTriggered.current || isTransitioning) return;

      // Detectamos la dirección del scroll usando deltaY del evento wheel
      const scrollingDown = e.deltaY > 0;
      
      if (scrollingDown && currentPage === 0) {
        scrollActionTriggered.current = true;
        // Iniciar animación de salida
        setTransitionDirection('out');
        setIsTransitioning(true);
        
        // Cambiar página después de un retraso
        setTimeout(() => {
          setCurrentPage(1);
          // Iniciar animación de entrada
          setTransitionDirection('in');
        }, 300); // Mitad de la duración total
        
        // Bloquear más acciones por un momento
        setTimeout(() => {
          scrollActionTriggered.current = false;
        }, 800);
        
      } else if (!scrollingDown && currentPage === 1) {
        scrollActionTriggered.current = true;
        // Iniciar animación de salida
        setTransitionDirection('out');
        setIsTransitioning(true);
        
        // Cambiar página después de un retraso
        setTimeout(() => {
          setCurrentPage(0);
          // Iniciar animación de entrada
          setTransitionDirection('in');
        }, 300); // Mitad de la duración total
        
        // Bloquear más acciones por un momento
        setTimeout(() => {
          scrollActionTriggered.current = false;
        }, 800);
      }
    };

    // Usamos el evento wheel en lugar de scroll para mayor precisión
    overlayRef.current.addEventListener('wheel', handleScroll, { passive: false });

    return () => {
      overlayRef.current?.removeEventListener('wheel', handleScroll);
    };
  }, [isVisible, currentPage, isTransitioning]);

  if (!isVisible) {
    return null;
  }

  // Array de proyectos (ahora con 12 elementos)
  const projects = [
    // Primera página (los primeros 6 proyectos)
    { id: 1, title: 'Proyecto 1', image: '/codigos/imagenes/proyecto.png' },
    { id: 2, title: 'Proyecto 2', image: '/codigos/imagenes/proyecto2.png' },
    { id: 3, title: 'Proyecto 3', image: '/codigos/videos/proyecto3.webm' },
    { id: 4, title: 'Proyecto 4', image: '' },
    { id: 5, title: 'Proyecto 5', image: '' },
    { id: 6, title: 'Proyecto 6', image: '' },
    // Segunda página (los 6 proyectos adicionales)
    { id: 7, title: 'Proyecto 7', image: '' },
    { id: 8, title: 'Proyecto 8', image: '' },
    { id: 9, title: 'Proyecto 9', image: '' },
    { id: 10, title: 'Proyecto 10', image: '' },
    { id: 11, title: 'Proyecto 11', image: '' },
    { id: 12, title: 'Proyecto 12', image: '' },
  ];

  // Determinar qué proyectos mostrar basados en la página actual
  const displayedProjects = projects.slice(currentPage * 6, (currentPage + 1) * 6);

  // Calcular los estilos de transición para las ventanas de proyectos
  const getMainStyle = () => {
    const baseStyle = {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '90px',
      opacity: fadeIn ? 1 : 0,
      transform: `translateY(${fadeIn ? '0' : '20px'})`,
      transition: 'opacity 1s ease, transform 1s ease',
      transitionDelay: isTransitioning ? '0s' : '0.6s',
      width: '100%',
    };

    if (isTransitioning) {
      if (transitionDirection === 'out') {
        return {
          ...baseStyle,
          opacity: 0,
          transform: `translateY(${currentPage === 0 ? '-' : ''}30px)`,
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        };
      } else if (transitionDirection === 'in') {
        return {
          ...baseStyle,
          opacity: 1,
          transform: 'translateY(0)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
          transitionDelay: '0.1s',
        };
      }
    }
    
    return baseStyle;
  };

  return (
    <div 
      ref={overlayRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(12, 18, 30, 0.05)', // Muy transparente
        zIndex: 10,
        opacity: fadeIn ? 1 : 0,
        transition: 'opacity 1s ease-out',
        fontFamily: "'Montserrat', 'Roboto', Arial, sans-serif",
        color: '#E0E0E0',
        display: 'flex',
        flexDirection: 'column',
        padding: '30px 40px', // Reducido padding vertical (top/bottom)
        boxSizing: 'border-box',
        overflowY: 'auto',
        pointerEvents: 'auto',
      }}
    >
      {/* Encabezado Minimalista */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        opacity: fadeIn ? 1 : 0,
        transition: 'opacity 0.8s ease',
        transitionDelay: '0.5s',
        marginBottom: '40px', // Ligeramente reducido
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: '600',
          letterSpacing: '0.5px',
          color: '#FFFFFF',
          transition: 'opacity 0.3s ease',
          opacity: isTransitioning ? 0.7 : 1,
        }}>
          PROYECTOS {currentPage === 1 ? '(p.2)' : ''}
        </div>
      </header>

      {/* Sección Principal con Ventanas de Proyectos */}
      <main style={getMainStyle()}>
        {/* Primera fila - 3 ventanas dispuestas en toda la anchura */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '80px', // Aumentado aún más el espacio horizontal entre ventanas
          width: '100%',
          maxWidth: '1600px', // Ajustado para más gap
        }}>
          {displayedProjects.slice(0, 3).map((project, index) => (
            <ProjectWindow 
              key={project.id} 
              project={project} 
              delay={index * 0.05} // Pequeño retraso escalonado
              isTransitioning={isTransitioning}
              transitionDirection={transitionDirection}
            />
          ))}
        </div>

        {/* Segunda fila - 3 ventanas dispuestas en toda la anchura */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '80px', // Aumentado aún más el espacio horizontal entre ventanas
          width: '100%',
          maxWidth: '1600px', // Ajustado para más gap
        }}>
          {displayedProjects.slice(3, 6).map((project, index) => (
            <ProjectWindow 
              key={project.id} 
              project={project} 
              delay={(index + 3) * 0.05} // Continuamos el retraso escalonado
              isTransitioning={isTransitioning}
              transitionDirection={transitionDirection}
            />
          ))}
        </div>
      </main>

      {/* Instrucción de scroll (temporal) */}
      {showScrollHint && (
        <div style={{
          width: '100%',
          textAlign: 'center',
          marginTop: '30px',
          fontSize: '15px',
          color: '#FFFFFF',
          opacity: fadeIn ? 0.8 : 0,
          transition: 'opacity 0.8s ease',
          animation: 'fadeInOut 5s forwards',
        }}>
          {currentPage === 0 ? 
            'Haz scroll para ver más proyectos' : 
            'Haz scroll hacia arriba para ver proyectos anteriores'}
        </div>
      )}

      {/* Pie de Página (vacío pero mantiene el espacio) */}
      <footer style={{
        width: '100%',
        height: '20px',
        marginTop: '20px', // Reducido el espacio en el footer
        opacity: fadeIn ? 1 : 0,
        transition: 'opacity 0.8s ease',
        transitionDelay: '1.1s',
        flexShrink: 0, // Evitar que el footer se encoja
      }}>
      </footer>

      {/* Estilos globales para la animación */}
      <style jsx global>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          15% { opacity: 0.8; }
          85% { opacity: 0.8; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// Componente para cada ventana de proyecto
const ProjectWindow = ({ project, delay = 0, isTransitioning, transitionDirection }) => {
  const [hover, setHover] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const videoRef = useRef(null);
  
  // Función para detectar si el archivo es un video basado en su extensión
  const isVideo = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  // Verificar si el proyecto tiene un video
  const hasVideo = project.image && isVideo(project.image);
  
  // Manejar eventos de hover para video
  useEffect(() => {
    if (hasVideo && videoRef.current) {
      if (hover) {
        videoRef.current.play().catch(err => {
          console.log('Error al reproducir video:', err);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [hover, hasVideo]);

  // Calcular los estilos de transición para cada ventana
  const getWindowStyle = () => {
    const baseStyle = {
      width: '450px', // Ventanas más grandes
      height: '270px', // Manteniendo proporción 16:9
      border: '3px solid #FFFFFF', // Marco un poco más grueso
      borderRadius: '12px', // Bordes más redondeados
      overflow: 'hidden',
      position: 'relative',
      cursor: 'pointer',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease',
      transform: hover ? 'scale(1.02)' : 'scale(1)',
      boxShadow: hover ? '0 0 15px rgba(255, 255, 255, 0.3)' : 'none',
      flex: '0 0 auto', // Evitar que las ventanas se estiren
    };
    
    if (isTransitioning) {
      if (transitionDirection === 'out') {
        return {
          ...baseStyle,
          opacity: 0,
          transform: 'scale(0.95)',
          transition: 'transform 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease',
        };
      } else if (transitionDirection === 'in') {
        return {
          ...baseStyle,
          opacity: 1,
          transform: 'scale(1)',
          transition: `transform 0.4s ease, opacity 0.4s ease, box-shadow 0.3s ease`,
          transitionDelay: `${0.1 + delay}s`,
        };
      }
    }
    
    return baseStyle;
  };

  return (
    <div 
      style={getWindowStyle()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => console.log(`Clicked on ${project.title}`)}
    >
      {/* Contenido del proyecto (imagen, video o placeholder) */}
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.1)', // Sutil fondo para las ventanas
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '9px', // Bordes redondeados para el contenido interior
      }}>
        {project.image && !mediaError ? (
          hasVideo ? (
            // Renderizar video
            <video 
              ref={videoRef}
              src={project.image}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '9px'
              }}
              muted
              loop
              playsInline
              onError={() => setMediaError(true)}
              poster={project.poster || ''} // Imagen de portada opcional
            />
          ) : (
            // Renderizar imagen
            <img 
              src={project.image} 
              alt={project.title} 
              style={{
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                borderRadius: '9px'
              }} 
              onError={() => setMediaError(true)}
            />
          )
        ) : (
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '16px' }}>
            {project.title}
          </p>
        )}
      </div>
    </div>
  );
};

// Componente auxiliar para enlaces de navegación (mantenido por si necesitas usarlo en el futuro)
const MinimalNavLink = ({ children }) => (
  <a href="#" style={{
    color: '#E0E0E0',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '18px',
    position: 'relative',
    padding: '5px 0',
    transition: 'color 0.3s ease',
    pointerEvents: 'all',
  }}>
    {children}
  </a>
);

// Componentes auxiliares no utilizados en este diseño (pero mantenidos por si acaso)
const FeatureCard = ({ title, description }) => (
  <div style={{
    // ... estilos anteriores ...
  }}>
    {/* ... contenido anterior ... */}
  </div>
);

export default FirstPersonOverlay; 