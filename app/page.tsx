'use client'; // Marcar como Componente de Cliente

import React, { useState, useCallback, useEffect } from "react"; // Importar useState, useCallback y useEffect
import dynamic from 'next/dynamic';

// Importar dinámicamente el componente BuildingBackground (anteriormente GradientBackground) sin SSR
const BuildingBackground = dynamic(() => import('../components/GradientBackground'), {
  ssr: false,
  loading: () => <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#000000' }}></div> // Fondo negro mientras carga
});

// Importar dinámicamente el componente AnimatedText sin SSR
const AnimatedText = dynamic(() => import('../components/AnimatedText'), {
  ssr: false,
  loading: () => null // No mostrar nada mientras carga el texto
});

// Importar dinámicamente el componente FirstPersonOverlay (nombre cambiado) sin SSR
const FirstPersonOverlay = dynamic(() => import('../components/FirstPersonOverlay'), {
  ssr: false,
  loading: () => null // No mostrar nada mientras carga el overlay
});

// Importar dinámicamente el componente ParticleSystem sin SSR (Comentado)
/*
const ParticleSystem = dynamic(() => import('../components/ParticleSystem'), {
    ssr: false,
    loading: () => null // No mostrar nada mientras cargan las partículas
});
*/

export default function Home() {
  // Estado para controlar si la cámara está siguiendo a un peatón
  const [isFollowingPedestrian, setIsFollowingPedestrian] = useState(false);
  // Estado para controlar la visibilidad del overlay
  const [showOverlay, setShowOverlay] = useState(false);

  // Función para iniciar el seguimiento (envuelta en useCallback para estabilidad)
  const handleStartFollow = useCallback(() => {
    setIsFollowingPedestrian(true);
  }, []); // Sin dependencias, solo se crea una vez

  // --- Efecto para Pantalla Completa con Doble Toque ---
  useEffect(() => {
    const handleDoubleClick = () => {
      const elem = document.documentElement; // Elemento raíz (HTML)
      if (!document.fullscreenElement) {
        // Si no estamos en pantalla completa, intentar entrar
        elem.requestFullscreen().catch((err) => {
          console.error(`Error al intentar activar pantalla completa: ${err.message} (${err.name})`);
        });
      } else {
        // Opcional: Si ya estamos en pantalla completa, salir con doble toque
        // if (document.exitFullscreen) {
        //   document.exitFullscreen();
        // }
      }
    };

    // Añadir listener a la ventana
    window.addEventListener('dblclick', handleDoubleClick);

    // Limpieza: remover el listener cuando el componente se desmonte
    return () => {
      window.removeEventListener('dblclick', handleDoubleClick);
    };
  }, []); // Array vacío: ejecutar solo una vez al montar

  // --- Efecto para Tecla Escape ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Si se presiona Escape Y estamos siguiendo a un peatón
      if (event.key === 'Escape' && isFollowingPedestrian) {
        console.log("Escape presionado, volviendo a vista aérea...");
        setIsFollowingPedestrian(false); // Cambiar el estado para detener el seguimiento
        setShowOverlay(false); // Ocultar el overlay al presionar Escape
      }
    };

    // Añadir listener a la ventana
    window.addEventListener('keydown', handleKeyDown);

    // Limpieza: remover el listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // Dependencia: isFollowingPedestrian para que el callback capture su valor actual
  }, [isFollowingPedestrian]);

   // Función para manejar el inicio real del seguimiento y mostrar el overlay con retraso
  const handleFollowStarted = useCallback(() => {
    // Añadir un pequeño retraso (por ejemplo, 500ms)
    setTimeout(() => {
      setShowOverlay(true);
    }, 500); // Retraso en milisegundos
  }, []); // Sin dependencias, solo se crea una vez

  return (
    <div className="min-h-screen w-full relative"> {/* Contenedor principal relativo */}
      {/* Pasar el estado de seguimiento al fondo y la nueva función para notificar el fin de la transición */}
      <BuildingBackground isFollowing={isFollowingPedestrian} onFollowStart={handleFollowStarted} />
      {/* Renderizar el texto solo si NO estamos siguiendo */}
      {!isFollowingPedestrian && <AnimatedText onStartFollow={handleStartFollow} />}
      {/* Renderizar la pantalla overlay (usando el nuevo nombre) */}
      <FirstPersonOverlay isVisible={showOverlay} />
    </div>
  );
}
