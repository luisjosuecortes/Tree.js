'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

// Función helper para crear geometría de rectángulo redondeado (Shape)
function createRoundedRectShape(width, height, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;

  shape.moveTo(x + radius, y); // Bottom left corner start
  shape.lineTo(x + width - radius, y); // Bottom edge
  shape.quadraticCurveTo(x + width, y, x + width, y + radius); // Bottom right corner
  shape.lineTo(x + width, y + height - radius); // Right edge
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height); // Top right corner
  shape.lineTo(x + radius, y + height); // Top edge
  shape.quadraticCurveTo(x, y + height, x, y + height - radius); // Top left corner
  shape.lineTo(x, y + radius); // Left edge
  shape.quadraticCurveTo(x, y, x + radius, y); // Bottom left corner end

  return shape;
}


const AnimatedTablet = () => {
  const [isVisible, setIsVisible] = useState(false);
  const frameMountRef = useRef(null); // Ref para el canvas del marco 3D
  const animationFrameIdRef = useRef(null);
  const sceneRef = useRef(null);
  const frameGroupRef = useRef(); // Ref para el grupo del marco 3D
   // Quitar inclinación inicial estática
   // const baseRotation = new THREE.Euler(-Math.PI / 16, Math.PI / 24, 0);


  useEffect(() => {
    setIsVisible(true); // Iniciar animación de entrada inmediatamente

    // --- Setup Three.js para el MARCO ---
    if (!frameMountRef.current) return;
    const currentFrameMount = frameMountRef.current;

    sceneRef.current = new THREE.Scene();
    const scene = sceneRef.current;

    // --- Cámara Perspectiva (para marco 3D) ---
    const aspect = currentFrameMount.clientWidth / currentFrameMount.clientHeight;
    const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
    camera.position.z = 2.0; // Un poco más cerca para el tamaño más grande

    // --- Renderizador (transparente) ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentFrameMount.clientWidth, currentFrameMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    currentFrameMount.appendChild(renderer.domElement);

    // --- Luces ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(8, 12, 10);
    scene.add(directionalLight);

    // --- Geometría del MARCO ---
    const frameGroup = new THREE.Group();
    frameGroupRef.current = frameGroup; // Guardar ref

    // Dimensiones - ajustadas para el nuevo tamaño y padding
    const frameWidth3D = 3.3; // Un poco más ancho en unidades 3D
    const frameHeight3D = frameWidth3D / aspect;
    const frameDepth = 0.05; // Mantener delgado
    const cornerRadius = 0.08; // Reducir un poco el radio de esquina
    const frameThickness = 0.04; // Marco aún más fino

    // Forma EXTERIOR
    const outerShape = createRoundedRectShape(frameWidth3D, frameHeight3D, cornerRadius);
    // Forma INTERIOR (agujero)
    const innerWidth = frameWidth3D - frameThickness * 2;
    const innerHeight = frameHeight3D - frameThickness * 2;
    const innerRadius = Math.max(0.01, cornerRadius - frameThickness); // Radio interior
    const innerShape = createRoundedRectShape(innerWidth, innerHeight, innerRadius);
    outerShape.holes.push(innerShape); // Añadir agujero

    // Extruir la forma con agujero
    const extrudeSettings = { steps: 1, depth: frameDepth, bevelEnabled: false };
    const frameGeometry = new THREE.ExtrudeGeometry(outerShape, extrudeSettings);
    frameGeometry.center(); // Centrar

    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x1c1c1e, // Revertido a gris muy oscuro / casi negro
      roughness: 0.4,
      metalness: 0.1,
      side: THREE.DoubleSide // Asegurar que se vea por ambos lados si rota mucho
    });
    const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
    frameGroup.add(frameMesh);

    // --- Añadir Cámara y Botón (Detalles 3D Refinados) --- //
    const detailRadius = 0.02; // Radio reducido para cámara más pequeña
    const detailZOffset = frameDepth / 2 + 0.005; 
    const detailYPos = frameHeight3D / 2 - frameThickness * 0.8; // Mover un poco hacia adentro

    // Cámara (arriba, centrada en X)
    const cameraGroup = new THREE.Group();

    // Lente interior oscura (escala basada en nuevo detailRadius)
    const innerLensGeometry = new THREE.CircleGeometry(detailRadius * 0.7, 16);
    const innerLensMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x080808, roughness: 0.1, metalness: 0.0, 
        transparent: true, opacity: 0.8 
    });
    const innerLensMesh = new THREE.Mesh(innerLensGeometry, innerLensMaterial);
    innerLensMesh.position.z = 0.006; 
    innerLensMesh.position.y = 0.006;
    cameraGroup.add(innerLensMesh);
    // Reflejo/Glint sutil en la lente (escala basada en nuevo detailRadius)
    const glintGeometry = new THREE.CircleGeometry(detailRadius * 0.15, 8);
    const glintMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    const glintMesh = new THREE.Mesh(glintGeometry, glintMaterial);
    glintMesh.position.set(detailRadius * 0.3, detailRadius * 0.3, 0.007); 
    cameraGroup.add(glintMesh);
    cameraGroup.position.set(0, detailYPos, detailZOffset);
    frameGroup.add(cameraGroup);

    // Botón (abajo, centrado en X) - Refinado y más pequeño
    const buttonWidth = detailRadius * 3.0; // Un poco menos ancho relativo al nuevo radio
    const buttonHeight = detailRadius * 1.1; // Un poco menos alto
    const buttonDepth = 0.01; 
    const buttonShape = createRoundedRectShape(buttonWidth, buttonHeight, buttonHeight/2);
    const buttonExtrudeSettings = { steps: 1, depth: buttonDepth, bevelEnabled: false };
    const buttonGeometry = new THREE.ExtrudeGeometry(buttonShape, buttonExtrudeSettings);
    buttonGeometry.center(); // Centrar geometría

    // Material del botón ligeramente más metálico/oscuro
    const buttonMaterial = new THREE.MeshStandardMaterial({
      color: 0x2f2f31, // Un poco más oscuro y menos gris que antes
      roughness: 0.4, // Menos rugoso que antes (más suave)
      metalness: 0.25 // Un toque más metálico
    });
    const buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);
    // Posicionar en el borde inferior, usando la nueva detailYPos
    buttonMesh.position.set(0, -detailYPos, detailZOffset);
    frameGroup.add(buttonMesh);

    // Quitar la aplicación de inclinación inicial
    // frameGroup.rotation.copy(baseRotation);

    scene.add(frameGroup);

    // --- Animación (Solo Rotación del Marco) ---
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      // const elapsedTime = clock.getElapsedTime(); // No necesario si no hay animación dependiente del tiempo

      renderer.render(scene, camera);
    };
    animate();

    // --- Manejo Redimensionamiento ---
    const handleResize = () => {
      const width = currentFrameMount.clientWidth;
      const height = currentFrameMount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // --- Limpieza --- //
    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameIdRef.current);
        if (renderer.domElement && currentFrameMount) {
            try { currentFrameMount.removeChild(renderer.domElement); } catch (e) { console.warn("Error removing renderer DOM element:", e); }
        }
        if (sceneRef.current) {
            sceneRef.current.traverse(object => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    // Check if material is an array (MultiMaterial)
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        // Dispose single material
                        object.material.dispose();
                    }
                    // If texture exists, dispose it
                    if (object.material.map) object.material.map.dispose();
                    // Add other potential texture types if used (normalMap, etc.)
                }
            });
            sceneRef.current.remove(...sceneRef.current.children);
        }
        renderer.dispose();
        sceneRef.current = null;
    };
  }, [isVisible]); // Re-ejecutar si isVisible cambia (aunque solo lo ponemos a true)

  // --- Estructura JSX ---
  return (
    // Contenedor principal que se anima (entrada)
    <div style={{
        position: 'fixed',
        left: '50%',
        bottom: isVisible ? '1%' : '-95%', // Más abajo, y empezar más abajo
        transform: 'translateX(-50%)',
        width: '96vw', // Casi todo el ancho
        height: '92vh', // Casi todo el alto
        zIndex: 10,
        transition: 'bottom 1.0s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 1.0s ease-out', // Transición CSS
        opacity: isVisible ? 1 : 0,
        pointerEvents: 'none', // Desactivar eventos en el contenedor principal
    }}>
        {/* Capa del Marco 3D (detrás) */}
        <div ref={frameMountRef} style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1, // Detrás del contenido
            pointerEvents: 'none', // No interceptar eventos
        }} />

        {/* Capa de Contenido 2D (delante, "vidrio") */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          // Estilo "vidrio": sin fondo, sin borde propio
          backgroundColor: 'transparent',
          // backgroundColor: 'rgba(255, 0, 0, 0.1)', // Rojo semi-transparente para DEBUG
          borderRadius: '25px', // Mantener redondeo para la forma general
          border: 'none', // Sin borde propio
          boxShadow: 'none', // Sin sombra propia
          zIndex: 2, // Delante del marco
          // Contenido interno
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '15px', // Reducir padding para pantalla más grande
          boxSizing: 'border-box', // Padding incluido en el tamaño
          pointerEvents: 'auto', // Habilitar eventos para el contenido
        }}>
            {/* Aquí irá el contenido futuro (editor, etc.) */}
            <p style={{
                color: '#e0e0e0', // Texto un poco más brillante
                fontSize: '1.5rem',
                fontFamily: 'monospace',
                textShadow: '1px 1px 3px rgba(0,0,0,0.7)', // Sombra para legibilidad
            }}>
              Editor Loading...
            </p>
        </div>
    </div>
  );
};

export default AnimatedTablet; 