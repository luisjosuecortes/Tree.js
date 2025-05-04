import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const ParticleSystem = () => {
    const mountRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 }); // Para guardar coords normalizadas del ratón

    useEffect(() => {
        if (!mountRef.current) return;

        const currentMount = mountRef.current;
        let animationFrameId;

        // --- Escena, Cámara, Renderizador (para partículas) ---
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 12; // Cámara más cerca (reducido de 15)

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true // Fondo transparente
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0); // Transparente
        // Asegúrate de que el canvas se superponga correctamente
        renderer.domElement.style.position = 'fixed';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.zIndex = '-1'; // Detrás del texto, sobre el fondo
        currentMount.appendChild(renderer.domElement);

        // --- Geometría de Partículas ---
        const particleCount = 1000; // Menos partículas (reducido de 5000)
        const positions = new Float32Array(particleCount * 3); // x, y, z para cada partícula
        const initialPositions = new Float32Array(particleCount * 3); // Guardar posiciones originales

        const spread = 20; // Menor dispersión (reducido de 30)

        for (let i = 0; i < particleCount * 3; i += 3) {
            // Posición x, y, z aleatoria
            positions[i] = (Math.random() - 0.5) * spread * 1.5; // Más ancho que alto
            positions[i + 1] = (Math.random() - 0.5) * spread;
            positions[i + 2] = (Math.random() - 0.5) * spread * 2; // Profundidad Z

            // Guardar posiciones iniciales
            initialPositions[i] = positions[i];
            initialPositions[i + 1] = positions[i + 1];
            initialPositions[i + 2] = positions[i + 2];
        }

        const particlesGeometry = new THREE.BufferGeometry();
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // --- Material de Partículas ---
        const particlesMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.08, // Tamaño de las partículas
            sizeAttenuation: true, // Partículas lejanas más pequeñas
            transparent: true,
            opacity: 0.4 // Reducido de 0.7 para mayor transparencia
        });

        // --- Sistema de Partículas (Points) ---
        const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particleSystem);

        // --- Event Listener para el Ratón ---
        const handleMouseMove = (event) => {
            // Normalizar coordenadas del ratón (-1 a 1)
            mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);

        // --- Manejo de Redimensionamiento ---
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener('resize', handleResize);

        // --- Bucle de Animación ---
        const clock = new THREE.Clock(); // Para animación suave
        const animate = () => {
            const elapsedTime = clock.getElapsedTime();
            const positionsAttribute = particleSystem.geometry.attributes.position;

            // Animar partículas basado en posición del ratón
            const mouseX = mouseRef.current.x;
            const mouseY = mouseRef.current.y;

            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                const initialX = initialPositions[i3];
                const initialY = initialPositions[i3 + 1];
                const initialZ = initialPositions[i3 + 2];

                // Desplazamiento basado en el ratón (efecto simple de repulsión/atracción)
                const displacementStrength = 2; // Cuánto se mueven las partículas
                const targetX = initialX + mouseX * displacementStrength;
                const targetY = initialY + mouseY * displacementStrength;
                // (Opcional) Mover en Z también: const targetZ = initialZ + mouseX * displacementStrength;

                // Interpolar suavemente hacia la posición objetivo
                positionsAttribute.array[i3] += (targetX - positionsAttribute.array[i3]) * 0.05;
                positionsAttribute.array[i3 + 1] += (targetY - positionsAttribute.array[i3 + 1]) * 0.05;
                // positionsAttribute.array[i3 + 2] += (targetZ - positionsAttribute.array[i3 + 2]) * 0.05; // Si se mueve en Z

                 // Añadir un leve movimiento ondulatorio independiente
                 positionsAttribute.array[i3+1] += Math.sin(elapsedTime + initialX * 0.5) * 0.01;

            }
            positionsAttribute.needsUpdate = true; // Importante!

            // Rotar ligeramente todo el sistema para dar sensación de movimiento
            // particleSystem.rotation.y = elapsedTime * 0.05;

            renderer.render(scene, camera);
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        // --- Limpieza ---
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
            if (currentMount && renderer.domElement) {
                currentMount.removeChild(renderer.domElement);
            }
            // Limpiar recursos de Three.js
            particlesGeometry.dispose();
            particlesMaterial.dispose();
            renderer.dispose();
             // Limpiar escena de forma segura
             scene.traverse(object => {
                if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
                    if (object.geometry) object.geometry.dispose();
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach(material => material.dispose());
                        } else {
                            object.material.dispose();
                        }
                    }
                }
             });
             scene.remove(...scene.children);
        };
    }, []);

    // Contenedor para el canvas de Three.js
    return <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }} />;
};

export default ParticleSystem; 