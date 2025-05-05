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

// Importar dinámicamente el componente AnimatedTablet sin SSR
const AnimatedTablet = dynamic(() => import('../components/AnimatedTablet'), {
    ssr: false,
    loading: () => null // No mostrar nada mientras carga la tablet
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
  // Nuevo estado para controlar la visibilidad de la tablet (solo después de la transición)
  const [tabletVisible, setTabletVisible] = useState(false);

  // Función para iniciar el seguimiento (envuelta en useCallback para estabilidad)
  const handleStartFollow = useCallback(() => {
    setIsFollowingPedestrian(true);
    // setTabletVisible(false); // Asegurarse de que la tablet no se muestre al inicio
  }, []); // Sin dependencias, solo se crea una vez

  // Callback para que BuildingBackground nos avise que la vista 1ra persona está lista
  const handleFirstPersonViewReady = useCallback(() => {
    console.log("Transición a primera persona completada, mostrando tablet.");
    setTabletVisible(true);
  }, []);

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

  // --- Efecto para Tecla Escape y cambio de isFollowingPedestrian ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Si se presiona Escape Y estamos siguiendo a un peatón
      if (event.key === 'Escape' && isFollowingPedestrian) {
        console.log("Escape presionado, volviendo a vista aérea...");
        setIsFollowingPedestrian(false);
        setTabletVisible(false); // Ocultar la tablet al presionar Escape
      }
    };

    // Ocultar tablet si isFollowingPedestrian se vuelve false por cualquier motivo
    if (!isFollowingPedestrian) {
        setTabletVisible(false);
    }

    // Añadir listener a la ventana
    window.addEventListener('keydown', handleKeyDown);

    // Limpieza: remover el listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // Dependencia: isFollowingPedestrian para reaccionar a cambios y capturar valor
  }, [isFollowingPedestrian]);

  return (
    <div className="min-h-screen w-full relative"> {/* Contenedor principal relativo */}
      {/* Pasar el estado de seguimiento y el nuevo callback al fondo */}
      <BuildingBackground 
        isFollowing={isFollowingPedestrian} 
        onFirstPersonViewReady={handleFirstPersonViewReady} 
      />
      {/* Renderizar el texto solo si NO estamos siguiendo */}
      {!isFollowingPedestrian && <AnimatedText onStartFollow={handleStartFollow} />}
      {/* Renderizar la tablet solo si el estado tabletVisible es true */}
      {tabletVisible && <AnimatedTablet />}
    </div>
  );
}
