'use client'; // Marcar como Componente de Cliente

import React from "react";
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
  return (
    <div className="min-h-screen w-full relative"> {/* Contenedor principal relativo */}
      <BuildingBackground /> {/* Usar el nuevo componente de edificios */}
      {/* <ParticleSystem /> */}{/* Comentado temporalmente */}
      <AnimatedText />
      {/* El texto se renderizará encima del fondo de edificios */}
    </div>
  );
}
