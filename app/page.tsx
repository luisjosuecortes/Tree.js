'use client'; // Marcar como Componente de Cliente

import React, { useState, useCallback } from "react"; // Importar useState y useCallback
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

  // Función para iniciar el seguimiento (envuelta en useCallback para estabilidad)
  const handleStartFollow = useCallback(() => {
    setIsFollowingPedestrian(true);
  }, []); // Sin dependencias, solo se crea una vez

  return (
    <div className="min-h-screen w-full relative"> {/* Contenedor principal relativo */}
      {/* Pasar el estado de seguimiento al fondo */}
      <BuildingBackground isFollowing={isFollowingPedestrian} />
      {/* Renderizar el texto solo si NO estamos siguiendo */}
      {!isFollowingPedestrian && <AnimatedText onStartFollow={handleStartFollow} />}
    </div>
  );
}
