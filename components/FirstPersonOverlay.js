import React, { useState, useEffect, useRef } from 'react';
import CodeEditor from './CodeEditor';

const FirstPersonOverlay = ({ isVisible }) => {
  const [fadeIn, setFadeIn] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState(null); // 'in' o 'out'
  const [showScrollHint, setShowScrollHint] = useState(true); // Estado para controlar la visibilidad del mensaje
  const [activeProject, setActiveProject] = useState(null); // Nuevo estado para el proyecto activo en iframe
  const [showAppliedMessage, setShowAppliedMessage] = useState(false); // Estado para mostrar mensaje de cambios aplicados
  const overlayRef = useRef(null);
  const scrollActionTriggered = useRef(false);

  // Nuevos estados para el editor de código
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [currentEditorView, setCurrentEditorView] = useState(0);
  const [isEditorTransitioning, setIsEditorTransitioning] = useState(false);
  const editorScrollActionTriggered = useRef(false);
  const editorContainerRef = useRef(null);
  // Nuevo estado para cambios aplicados
  const [justApplied, setJustApplied] = useState(false);

  // Estados para el iframe y editor integrado
  const [showEditorInIframe, setShowEditorInIframe] = useState(false);
  const iframeContainerRef = useRef(null);
  const iframeScrollTriggered = useRef(false);

  // Ejemplos de código para diferentes vistas del editor
  const editorViews = [
    {
      title: 'Primera clase Three.js',
      code: `// Inicialización básica de Three.js
import * as THREE from 'three';

// Crear una escena
const scene = new THREE.Scene();

// Crear una cámara
const camera = new THREE.PerspectiveCamera(
  75,                // Campo de visión
  window.innerWidth / window.innerHeight, // Relación de aspecto
  0.1,               // Plano cercano
  1000               // Plano lejano
);

// Posicionar la cámara
camera.position.z = 5;

// Crear un renderizador WebGL
const renderer = new THREE.WebGLRenderer({
  antialias: true,  // Suavizar bordes
  alpha: true       // Fondo transparente
});

// Configurar el tamaño del renderizador
renderer.setSize(window.innerWidth, window.innerHeight);

// Añadir el canvas del renderizador al DOM
document.body.appendChild(renderer.domElement);

// Crear un cubo
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00  // Color verde
});
const cube = new THREE.Mesh(geometry, material);

// Añadir el cubo a la escena
scene.add(cube);

// Función de animación
function animate() {
  requestAnimationFrame(animate);
  
  // Rotación del cubo
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  
  // Renderizar la escena
  renderer.render(scene, camera);
}

// Iniciar la animación
animate();`
    },
    {
      title: 'Materiales y luces',
      code: `// Ejemplo de materiales y luces en Three.js
import * as THREE from 'three';

// Configuración básica
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, 
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Habilitar sombras
document.body.appendChild(renderer.domElement);

// Añadir luces
// Luz ambiental - ilumina todas las superficies por igual
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Luz direccional - como el sol, proyecta sombras
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Luz puntual - como una bombilla, emite luz en todas direcciones
const pointLight = new THREE.PointLight(0xff9000, 1, 100);
pointLight.position.set(-5, 2, 0);
scene.add(pointLight);

// Crear objetos con diferentes materiales

// 1. MeshBasicMaterial - material básico sin iluminación
const basicGeometry = new THREE.BoxGeometry(1, 1, 1);
const basicMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const basicCube = new THREE.Mesh(basicGeometry, basicMaterial);
basicCube.position.x = -3;
scene.add(basicCube);

// 2. MeshLambertMaterial - material mate que responde a la luz
const lambertGeometry = new THREE.SphereGeometry(0.75, 32, 32);
const lambertMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const lambertSphere = new THREE.Mesh(lambertGeometry, lambertMaterial);
lambertSphere.castShadow = true;
lambertSphere.position.x = -1;
scene.add(lambertSphere);

// 3. MeshPhongMaterial - material brillante con reflejos especulares
const phongGeometry = new THREE.ConeGeometry(0.7, 1.5, 32);
const phongMaterial = new THREE.MeshPhongMaterial({ 
  color: 0x0000ff,
  shininess: 100
});
const phongCone = new THREE.Mesh(phongGeometry, phongMaterial);
phongCone.castShadow = true;
phongCone.position.x = 1;
scene.add(phongCone);

// 4. MeshStandardMaterial - material PBR con propiedades físicas
const standardGeometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
const standardMaterial = new THREE.MeshStandardMaterial({
  color: 0xffff00,
  roughness: 0.3,
  metalness: 0.8
});
const standardTorus = new THREE.Mesh(standardGeometry, standardMaterial);
standardTorus.castShadow = true;
standardTorus.position.x = 3;
scene.add(standardTorus);

// Crear un plano para recibir sombras
const planeGeometry = new THREE.PlaneGeometry(15, 15);
const planeMaterial = new THREE.MeshStandardMaterial({ 
  color: 0xeeeeee,
  roughness: 0.9
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -1.5;
plane.receiveShadow = true;
scene.add(plane);

// Función de animación
function animate() {
  requestAnimationFrame(animate);
  
  // Rotación de los objetos
  basicCube.rotation.y += 0.01;
  lambertSphere.rotation.y += 0.01;
  phongCone.rotation.y += 0.01;
  standardTorus.rotation.y += 0.01;
  
  renderer.render(scene, camera);
}

animate();`
    },
    {
      title: 'Geometrías y animaciones',
      code: `// Ejemplo de geometrías y animaciones avanzadas
import * as THREE from 'three';

// Configuración básica
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
  70, 
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 8;
camera.position.y = 2;
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Luces
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Colores para las partículas
const colors = [
  0xff0000, // rojo
  0x00ff00, // verde
  0x0000ff, // azul
  0xffff00, // amarillo
  0xff00ff, // magenta
  0x00ffff  // cian
];

// Crear un sistema de partículas
const particleGeometry = new THREE.BufferGeometry();
const particleCount = 2000;
const posArray = new Float32Array(particleCount * 3);
const colArray = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i += 3) {
  // Posiciones aleatorias en un espacio de -5 a 5
  posArray[i] = (Math.random() - 0.5) * 10;  // x
  posArray[i+1] = (Math.random() - 0.5) * 10; // y
  posArray[i+2] = (Math.random() - 0.5) * 10; // z
  
  // Color aleatorio de la paleta
  const colorIndex = Math.floor(Math.random() * colors.length);
  const color = new THREE.Color(colors[colorIndex]);
  
  colArray[i] = color.r;
  colArray[i+1] = color.g;
  colArray[i+2] = color.b;
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particleGeometry.setAttribute('color', new THREE.BufferAttribute(colArray, 3));

const particleMaterial = new THREE.PointsMaterial({
  size: 0.05,
  vertexColors: true,
  transparent: true,
  opacity: 0.8
});

const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particleSystem);

// Crear geometrías animadas
const torusKnotGeometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
const torusKnotMaterial = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  shininess: 100,
  wireframe: true
});
const torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
scene.add(torusKnot);

// Geometría personalizada: estrella
const starGeometry = new THREE.BufferGeometry();
const starVertices = [];
const numPoints = 5;
const innerRadius = 0.4;
const outerRadius = 1;

for (let i = 0; i < numPoints * 2; i++) {
  const angle = Math.PI * i / numPoints;
  const radius = i % 2 === 0 ? outerRadius : innerRadius;
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);
  starVertices.push(x, y, 0);
}

// Cerrar la estrella
starVertices.push(starVertices[0], starVertices[1], starVertices[2]);

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
starGeometry.computeVertexNormals();

const starMaterial = new THREE.MeshStandardMaterial({
  color: 0xffd700,
  metalness: 0.8,
  roughness: 0.2,
  emissive: 0xffd700,
  emissiveIntensity: 0.3
});

const stars = [];

// Crear varias estrellas
for (let i = 0; i < 8; i++) {
  const star = new THREE.Mesh(starGeometry, starMaterial);
  
  // Posiciones aleatorias
  star.position.set(
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10
  );
  
  // Tamaño aleatorio
  const scale = Math.random() * 0.3 + 0.1;
  star.scale.set(scale, scale, scale);
  
  // Rotación aleatoria
  star.rotation.z = Math.random() * Math.PI * 2;
  
  stars.push(star);
  scene.add(star);
}

// Variables para el control de la animación
const clock = new THREE.Clock();

// Función de animación
function animate() {
  requestAnimationFrame(animate);
  
  const elapsedTime = clock.getElapsedTime();
  
  // Animar el torusKnot
  torusKnot.rotation.x = elapsedTime * 0.5;
  torusKnot.rotation.y = elapsedTime * 0.2;
  
  // Animar las partículas
  particleSystem.rotation.y = elapsedTime * 0.1;
  particleSystem.rotation.x = elapsedTime * 0.05;
  
  // Onda que se propaga a través de las partículas
  const positions = particleGeometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i+1];
    const z = positions[i+2];
    
    const distance = Math.sqrt(x*x + y*y + z*z);
    const wave = Math.sin(distance * 2 - elapsedTime * 2) * 0.1;
    
    positions[i+1] += wave;
  }
  particleGeometry.attributes.position.needsUpdate = true;
  
  // Animar las estrellas
  stars.forEach((star, index) => {
    star.rotation.z = elapsedTime * (0.2 + index * 0.05);
    star.position.y += Math.sin(elapsedTime * (0.5 + index * 0.1)) * 0.01;
  });
  
  renderer.render(scene, camera);
}

// Manejo de cambios de tamaño de ventana
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();`
    }
  ];

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
      // Cerrar cualquier proyecto abierto
      setActiveProject(null);
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
      // No permitir scroll si hay un proyecto abierto
      if (activeProject) {
        e.preventDefault();
        return;
      }

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
  }, [isVisible, currentPage, isTransitioning, activeProject]);

  // Establecer contenido inicial del editor cuando se abre
  useEffect(() => {
    if (showCodeEditor && editorViews.length > 0) {
      setEditorContent(editorViews[currentEditorView].code);
    }
  }, [showCodeEditor, currentEditorView]);

  // Efecto para gestionar el scroll horizontal en el editor
  useEffect(() => {
    if (!showCodeEditor || !editorContainerRef.current) return;

    const handleEditorScroll = (e) => {
      // Solo manejamos el scroll horizontal para cambiar de vista
      // El scroll vertical lo deja al editor principal
      
      // Detectar si hay scroll horizontal significativo
      const isSignificantHorizontalScroll = Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 5;
      
      if (isSignificantHorizontalScroll) {
        // Prevenir el comportamiento por defecto solo para scroll horizontal
        e.preventDefault();
        
        // Scroll a la derecha - ir al editor
        if (e.deltaX < 0) {
          // Prevenir múltiples acciones de scroll rápidas
          if (!editorScrollActionTriggered.current) {
            editorScrollActionTriggered.current = true;
            
            // Usar la función de cambio existente
            if (showEditorInIframe) {
              setShowEditorInIframe(false);
            }
            
            // Desbloquear después de un pequeño delay
            setTimeout(() => {
              editorScrollActionTriggered.current = false;
            }, 800);
          }
        }
        // Scroll a la izquierda - ir al iframe
        else if (e.deltaX > 0) {
          // Prevenir múltiples acciones de scroll rápidas
          if (!editorScrollActionTriggered.current) {
            editorScrollActionTriggered.current = true;
            
            // Usar la función de cambio existente
            if (!showEditorInIframe) {
              setShowEditorInIframe(true);
            }
            
            // Desbloquear después de un pequeño delay
            setTimeout(() => {
              editorScrollActionTriggered.current = false;
            }, 800);
          }
        }
      }
      // Importante: ¡no manejamos el scroll vertical aquí!
      // Dejamos que el CodeEditor maneje el scroll vertical
    };

    // Agregar el evento solo al contenedor principal, no al scroller interno
    editorContainerRef.current.addEventListener('wheel', handleEditorScroll, { passive: false });

    return () => {
      editorContainerRef.current?.removeEventListener('wheel', handleEditorScroll);
    };
  }, [showCodeEditor, currentEditorView, isEditorTransitioning, showEditorInIframe, setShowEditorInIframe]);

  // Nuevo estado para manejar el archivo actual
  const [currentFile, setCurrentFile] = useState(null);
  // Nuevo estado para almacenar versiones modificadas de los archivos
  const [modifiedFiles, setModifiedFiles] = useState({});
  // Referencia para el iframe
  const iframeRef = useRef(null);

  // Función para actualizar el código en el editor
  const handleCodeChange = (newCode) => {
    if (!currentFile) return;

    // Guardar la versión modificada del archivo
    setModifiedFiles(prev => ({
      ...prev,
      [currentFile.name]: newCode
    }));

    // Eliminamos la actualización automática con temporizador
  };

  // Función para aplicar cambios manualmente
  const applyChanges = () => {
    // Si hay cambios pendientes, los aplicamos
    if (Object.keys(modifiedFiles).length > 0) {
      updateIframeContent();
      
      // Establecer justApplied a true para indicar que se acaba de aplicar un cambio
      setJustApplied(true);
      
      // Mostrar mensaje de éxito y ocultarlo después de un tiempo
      setShowAppliedMessage(true);
      setTimeout(() => {
        setShowAppliedMessage(false);
        // Después de otro corto tiempo, volver a false
        setTimeout(() => {
          setJustApplied(false);
        }, 100);
      }, 600);
    }
  };

  // Referencia para el temporizador de actualización del iframe
  const iframeUpdateTimeout = useRef(null);

  // Limpiar el temporizador cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (iframeUpdateTimeout.current) {
        clearTimeout(iframeUpdateTimeout.current);
      }
    };
  }, []);

  // Actualizar el iframe cuando se abre un proyecto
  useEffect(() => {
    if (activeProject && activeProject.files) {
      // Actualizar el iframe inmediatamente sin delay
      updateIframeContent();
    }
  }, [activeProject]);

  // Función para actualizar el contenido del iframe con el código modificado (optimizada para carga instantánea)
  const updateIframeContent = () => {
    if (!iframeRef.current || !activeProject || !activeProject.files) return;

    try {
      // Obtener el documento del iframe
      const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
      const iframeWindow = iframeRef.current.contentWindow;
      
      // Crear un documento HTML combinado con los archivos modificados
      const htmlFile = activeProject.files.find(f => f.name === 'index.html');
      const jsFile = activeProject.files.find(f => f.name === 'script.js');
      const cssFile = activeProject.files.find(f => f.name === 'style.css');
      
      if (!htmlFile) return; // Necesitamos al menos el archivo HTML

      // Obtener el contenido de cada archivo (modificado o original)
      const htmlContent = modifiedFiles[htmlFile.name] || htmlFile.code;
      const jsContent = jsFile ? (modifiedFiles[jsFile.name] || jsFile.code) : '';
      const cssContent = cssFile ? (modifiedFiles[cssFile.name] || cssFile.code) : '';

      // Preparar el contenido HTML con CSS y JS directamente integrados
      // Esto evita tener que esperar a que se cargue el documento
      const completeHtml = `
        ${htmlContent.replace(/<\/head>/i, `
          <style id="dynamic-css">${cssContent}</style>
        </head>`).replace(/<\/body>/i, `
          <script id="dynamic-js">
            // Usuario modificado - código inyectado para Three.js
            (function() {
              try {
                // Limpiar cualquier renderizador anterior si existe
                if (window._threeJSCleanup && typeof window._threeJSCleanup === 'function') {
                  window._threeJSCleanup();
                }
                
                // Verificar que Three.js esté disponible
                if (typeof THREE === 'undefined') {
                  console.error('THREE no está disponible. Asegúrate de haberlo incluido en tu HTML.');
                  return;
                }
                
                // Crear función de limpieza para la próxima ejecución
                window._threeJSCleanup = function() {
                  // Intentar limpiar cualquier renderizador o animación existente
                  if (window._threeRenderer) {
                    window._threeRenderer.dispose();
                    window._threeRenderer.forceContextLoss();
                    window._threeRenderer.domElement.remove();
                    window._threeRenderer = null;
                  }
                  
                  if (window._threeAnimationFrame) {
                    cancelAnimationFrame(window._threeAnimationFrame);
                    window._threeAnimationFrame = null;
                  }
                };
                
                // Capturar el requestAnimationFrame original para poder limpiarlo después
                const originalRAF = window.requestAnimationFrame;
                window.requestAnimationFrame = function(callback) {
                  window._threeAnimationFrame = originalRAF(callback);
                  return window._threeAnimationFrame;
                };
                
                // Guardar una referencia al WebGLRenderer original
                const originalRenderer = THREE.WebGLRenderer;
                THREE.WebGLRenderer = function(...args) {
                  const renderer = new originalRenderer(...args);
                  window._threeRenderer = renderer;
                  return renderer;
                };
                
                // Ejecutar el código del usuario
                ${jsContent}
                
                // Restaurar funciones originales
                window.requestAnimationFrame = originalRAF;
                THREE.WebGLRenderer = originalRenderer;
                
              } catch(e) {
                console.error('Error al ejecutar el código:', e);
              }
            })();
          </script>
        </body>`)}
      `;

      // Escribir el HTML completo directamente en el documento del iframe
      iframeDoc.open();
      iframeDoc.write(completeHtml);
      iframeDoc.close();
      
      console.log("Contenido del iframe actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar el iframe:", error);
    }
  };

  // Función para abrir un proyecto en iframe
  const openProject = (project) => {
    setActiveProject(project);
    setShowEditorInIframe(false); // Inicialmente mostrar el proyecto, no el editor
    setModifiedFiles({}); // Resetear archivos modificados al abrir un nuevo proyecto
    setJustApplied(false); // Resetear el estado de aplicación
    
    // Si el proyecto tiene archivos, seleccionar el primero por defecto
    if (project.files && project.files.length > 0) {
      setCurrentFile(project.files[0]);
    }
  };

  // Función para cerrar el proyecto activo
  const closeProject = () => {
    // Referencia al contenedor del iframe
    const container = iframeContainerRef.current;
    
    // Si el contenedor existe, animamos su cierre
    if (container) {
      // Aplicar animación de salida
      container.style.animation = 'fadeOut 0.4s ease-in-out forwards';
      container.style.opacity = '0';
      
      // Esperar a que termine la animación antes de cerrar realmente
      setTimeout(() => {
        setActiveProject(null);
        setShowEditorInIframe(false);
        setModifiedFiles({});
      }, 400); // Igual a la duración de la animación
    } else {
      // Si no hay contenedor, cerramos inmediatamente
      setActiveProject(null);
      setShowEditorInIframe(false);
      setModifiedFiles({});
    }
  };

  // Función para alternar la visualización del editor
  const toggleCodeEditor = () => {
    setShowCodeEditor(prev => !prev);
  };

  // Función para seleccionar una vista específica del editor
  const selectEditorView = (index) => {
    if (index >= 0 && index < editorViews.length) {
      setCurrentEditorView(index);
    }
  };

  // Efecto para manejar el deslizamiento horizontal en el iframe
  useEffect(() => {
    if (!activeProject || !iframeContainerRef.current) return;

    const handleIframeScroll = (e) => {
      // Comprobar si el desplazamiento horizontal es significativo
      const isSignificantHorizontalScroll = Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 5;
      
      if (isSignificantHorizontalScroll) {
        // Prevenir el comportamiento por defecto solo para scroll horizontal
        e.preventDefault();
        
        // Scroll a la derecha - ir al iframe
        if (e.deltaX < 0) {
          // Prevenir múltiples acciones de scroll rápidas
          if (!iframeScrollTriggered.current) {
            iframeScrollTriggered.current = true;
            
            // Usar la función de cambio existente
            if (showEditorInIframe) {
              setShowEditorInIframe(false);
            }
            
            // Desbloquear después de un pequeño delay
            setTimeout(() => {
              iframeScrollTriggered.current = false;
            }, 800);
          }
        }
        // Scroll a la izquierda - ir al editor de código
        else if (e.deltaX > 0) {
          // Prevenir múltiples acciones de scroll rápidas
          if (!iframeScrollTriggered.current) {
            iframeScrollTriggered.current = true;
            
            // Usar la función de cambio existente
            if (!showEditorInIframe) {
              setShowEditorInIframe(true);
            }
            
            // Desbloquear después de un pequeño delay
            setTimeout(() => {
              iframeScrollTriggered.current = false;
            }, 800);
          }
        }
      }
      // Para el desplazamiento vertical dentro del iframe, no hacemos nada
      // Dejamos que el comportamiento nativo del iframe maneje el scroll vertical
    };

    iframeContainerRef.current.addEventListener('wheel', handleIframeScroll, { passive: false });

    return () => {
      iframeContainerRef.current?.removeEventListener('wheel', handleIframeScroll);
    };
  }, [activeProject, showEditorInIframe, setShowEditorInIframe]);

  if (!isVisible) {
    return null;
  }

  // Array de proyectos (ahora con editor de código)
  const projects = [
    // Primera página (los primeros 6 proyectos)
    { 
      id: 1, 
      title: 'Proyecto 1', 
      image: '/codigos/imagenes/proyecto.png',
      url: '/codigos/1_primer_proyecto/index.html',
      files: [
        {
          name: 'index.html',
          language: 'html',
          code: `<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Configuración de caracteres UTF-8 para soporte de caracteres internacionales -->
    <meta charset="UTF-8">
    <!-- Configuración de la vista para dispositivos móviles -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Título de la página que aparecerá en la pestaña del navegador -->
    <title>First Three.js Project</title>
    <!-- Enlace al archivo de estilos CSS -->
    <link rel="stylesheet" href="./style.css">
</head>
<body>
    <!-- Canvas con clase "webgl" donde Three.js renderizará la escena 3D -->
    <canvas class="webgl"></canvas>
    <!-- Cargar Three.js desde CDN -->
    <script src="https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js"></script>
    <!-- Importación del script JavaScript como un módulo ES6 -->
    <script src="./script.js"></script>
</body>
</html>`
        },
        {
          name: 'script.js',
          language: 'javascript',
          code: `// Se elimina la importación ya que Three.js se carga desde CDN como variable global
// import * as THREE from 'three'

// Canvas 
const canvas = document.querySelector('canvas.webgl')

// Escena: Creación de la escena principal donde se añadirán todos los objetos 3D
const scene = new THREE.Scene()

/**
 * Objecto : Creación del objeto 3D
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
// Mesh: Combina geometría y material para crear un objeto renderizable
const mesh = new THREE.Mesh(geometry, material)

scene.add(mesh) // Añadir el objeto a la escena

/**
 * Dimensiones : Definición del tamaño del área de renderizado (800x600 píxeles)
 */
const sizes = {
    width: 800,
    height: 600
}

/**
 * Camara
 */
// Creación de una cámara en perspectiva con 75 grados de campo de visión y relación de aspecto basada en las dimensiones definidas
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)

/**
 * Rendererizador
 */
// Creación del renderizador WebGL asociado al canvas seleccionado
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
// Configuración del tamaño del renderizador para que coincida con las dimensiones
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)`
        },
        {
          name: 'style.css',
          language: 'css',
          code: `/* Resetear márgenes y rellenos predeterminados para todos los elementos */
* {
    margin: 0;
    padding: 0;
}

/* Asegurar que tanto html como body ocupen el 100% de la altura de la ventana 
   y evitar barras de desplazamiento */
html, body {
    height: 100%;
    overflow: hidden;
}

/* Centrar contenido en el body usando flexbox:
   - display: flex - activa el modelo de diseño flexbox
   - justify-content: center - centra horizontalmente
   - align-items: center - centra verticalmente */
body {
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Asegurar que el canvas se muestre como un elemento de bloque 
   (sin espacios extra debajo) */
.webgl {
    display: block;
}`
        }
      ]
    },
    { 
      id: 2, 
      title: 'Proyecto 2', 
      image: '/codigos/imagenes/proyecto2.png', 
      url: '/codigos/2_trans_objetos/index.html',
      files: [
        {
          name: 'index.html',
          language: 'html',
          code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transform objects</title>
    <link rel="stylesheet" href="./style.css">
</head>
<body>
    <canvas class="webgl"></canvas>
    <script src="https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js"></script>
    <script src="./script.js"></script>
</body>
</html>`
        },
        {
          name: 'script.js',
          language: 'javascript',
          code: `// Se elimina la importación ya que Three.js se carga desde CDN como variable global
// import * as THREE from 'three'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Axes Helper
 */
const axesHelper = new THREE.AxesHelper(2)
scene.add(axesHelper)

/**
 * Objects
 */
const group = new THREE.Group()
group.scale.y = 1
group.rotation.y = 0.2
scene.add(group)

const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
)
cube1.position.x = - 1.5
group.add(cube1)

const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
)
cube2.position.x = 0
group.add(cube2)

const cube3 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x0000ff })
)
cube3.position.x = 1.5
group.add(cube3)

/**
 * Sizes
 */
const sizes = {
    width: 800,
    height: 600
}

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
// camera.lookAt(new THREE.Vector3(0, - 1, 0))
scene.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)`
        },
        {
          name: 'style.css',
          language: 'css',
          code: `* {
    margin: 0;
    padding: 0;
}

html, body {
    height: 100%;
    overflow: hidden;
}

body {
    display: flex;
    justify-content: center;
    align-items: center;
}

.webgl {
    display: block;
}`
        }
      ]
    },
    { id: 3, title: 'Proyecto 3', image: '/codigos/videos/proyecto3.mp4' },
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
          transform: 'scale(1)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
          transitionDelay: '0.1s',
        };
      }
    }
    
    return baseStyle;
  };

  // Función auxiliar para determinar el icono del archivo basado en su extensión
  const getFileIcon = (filename) => {
    if (filename.endsWith('.html')) return '<>'; // HTML 
    if (filename.endsWith('.js')) return 'JS'; // JavaScript
    if (filename.endsWith('.css')) return '#'; // CSS 
    if (filename.endsWith('.json')) return '{}'; // JSON
    return '📄'; // Icono por defecto - documento genérico
  };

  // Función auxiliar para determinar el color del icono del archivo
  const getFileIconColor = (filename) => {
    if (filename.endsWith('.html')) return '#E34F26'; // Naranja para HTML
    if (filename.endsWith('.js')) return '#F7DF1E'; // Amarillo para JavaScript  
    if (filename.endsWith('.css')) return '#1572B6'; // Azul para CSS
    if (filename.endsWith('.json')) return '#5C5C5C'; // Gris para JSON
    return '#FFFFFF'; // Blanco por defecto
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
      {/* Contenido de selección de proyectos (se oculta cuando hay un proyecto activo) */}
      {!activeProject && (
        <>
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
                  onProjectClick={openProject}
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
                  onProjectClick={openProject}
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
        </>
      )}

      {/* Modal para mostrar el iframe del proyecto con editor integrado */}
      {activeProject && (
        <div 
          ref={iframeContainerRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.15)', // Cambiado de negro sólido a transparente
            backdropFilter: 'blur(3px)', // Añadir un ligero desenfoque
            display: 'flex',
            zIndex: 100,
            margin: 0,
            padding: 0,
            overflow: 'hidden',
            opacity: 1, // Siempre visible después de aparecer
            transition: 'opacity 0.6s ease-in-out', // Transición suave para aparecer/desaparecer
            animation: 'fadeIn 0.7s ease-in-out', // Animación de entrada más larga
          }}
        >
          {/* Botón de cerrar con diseño mejorado */}
          <div 
            onClick={closeProject}
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '40px',
              color: 'white',
              cursor: 'pointer',
              display: showEditorInIframe ? 'none' : 'flex', // Ocultar cuando se muestra el editor
              justifyContent: 'center',
              alignItems: 'center',
              padding: '10px 18px',
              borderRadius: '25px', // Más redondeado
              background: 'rgba(0, 0, 0, 0.85)', // Fondo negro
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              transition: 'all 0.3s ease',
              zIndex: 120,
              fontSize: '14px',
              fontWeight: '600',
              letterSpacing: '0.5px',
              opacity: 1, // Totalmente visible
              animation: 'fadeIn 0.6s ease-in-out', // Animación de aparición más lenta
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'; // Fondo blanco
              e.currentTarget.style.color = 'black'; // Texto negro
              e.currentTarget.style.transform = 'translateX(3px)';
              // También cambiar el color del SVG a negro
              const svg = e.currentTarget.querySelector('svg');
              if (svg) svg.style.stroke = 'black';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.85)'; // Restaurar fondo negro
              e.currentTarget.style.color = 'white'; // Restaurar texto blanco
              e.currentTarget.style.transform = 'translateX(0)';
              // Restaurar el color del SVG a blanco
              const svg = e.currentTarget.querySelector('svg');
              if (svg) svg.style.stroke = 'white';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
              <path d="M19 12H5"></path>
              <path d="M12 19l-7-7 7-7"></path>
            </svg>
            Volver
          </div>
          
          {/* Contenedor con transición para iframe y editor */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            overflow: 'hidden',
          }}>
            {/* Contenedor del iframe */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              transform: showEditorInIframe ? 'translateX(-100%)' : 'translateX(0)',
              transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease',
              opacity: showEditorInIframe ? 0 : 1, // Fade out cuando cambiamos al editor
              overflow: 'hidden',
              backgroundColor: 'white', // Fondo sólido blanco
              boxShadow: '0 0 20px rgba(0, 0, 0, 0.2)', // Añadir sombra para separación visual
              zIndex: 1,
              animation: !showEditorInIframe ? 'fadeIn 0.7s ease-in-out' : 'none', // Animar al mostrar
            }}>
              {/* Siempre renderizar el iframe cuando hay un proyecto activo */}
              <iframe
                ref={iframeRef}
                title={activeProject.title}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  backgroundColor: 'white', // Fondo sólido blanco
                  position: 'relative',
                  opacity: 1,
                  transition: 'opacity 0.4s ease',
                }}
                allow="fullscreen"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>
            
            {/* Editor de código (si el proyecto tiene código) */}
            {activeProject && activeProject.files && activeProject.files.length > 0 && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: '100%',
                width: '100%',
                height: '100%',
                padding: '20px',
                boxSizing: 'border-box',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(0, 0, 0, 0.3)', // Fondo más transparente para ver la ciudad
                backdropFilter: 'blur(6px)', // Mayor desenfoque para mejorar legibilidad
                transform: showEditorInIframe ? 'translateX(-100%)' : 'translateX(0)',
                transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease',
                opacity: showEditorInIframe ? 1 : 0, // Fade in cuando se muestra el editor
                zIndex: 1,
                animation: showEditorInIframe ? 'fadeIn 0.7s ease-in-out' : 'none', // Animar al mostrar
              }}>
                {/* Contenedor del editor con el marco de ventana */}
                <div style={{
                  flex: '1',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 5px 20px rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: '100%',
                }}>
                  {/* Encabezado de ventana de código */}
                  <div style={{
                    padding: '8px',
                    background: 'linear-gradient(to right, rgba(17, 24, 39, 0.8), rgba(0, 0, 0, 0.8))',
                    borderBottom: '1px solid rgba(55, 65, 81, 0.5)',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#93c5fd',
                      marginLeft: '10px',
                      fontFamily: '"Fira Code", Menlo, Monaco, Consolas, monospace',
                    }}>
                      {currentFile ? currentFile.name : activeProject.title}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(239, 68, 68, 0.7)', // Rojo
                      }}></div>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(234, 179, 8, 0.7)', // Amarillo
                      }}></div>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(34, 197, 94, 0.7)', // Verde
                      }}></div>
                    </div>
                  </div>
                  
                  {/* Contenedor principal que divide el explorador y el editor */}
                  <div style={{ 
                    flex: '1', 
                    display: 'flex', 
                    flexDirection: 'row',
                    overflow: 'hidden'
                  }}>
                    {/* Explorador de archivos */}
                    <div 
                      className="explorer-container"
                      style={{
                        width: '250px',
                        backgroundColor: 'rgba(15, 23, 42, 0.4)', // Coincide con fondo del editor
                        borderRight: '1px solid rgba(51, 65, 85, 0.3)', // Coincide con borde del editor
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        fontFamily: '"Fira Code", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', // Misma fuente que el editor
                        // Estilos básicos de barra de desplazamiento (los que funcionan en estilos inline)
                        scrollbarWidth: 'thin', // Para Firefox
                        scrollbarColor: 'rgba(59, 130, 246, 0.5) rgba(15, 23, 42, 0.4)', // Para Firefox, coincide con el editor
                      }}>
                      
                      {/* Estructura de carpetas y archivos */}
                      <div>
                        {/* Carpeta del proyecto */}
                        <div style={{
                          padding: '8px 10px',
                          fontSize: '13px',
                          color: '#93c5fd', // Color azul claro similar a elementos activos del editor
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          marginTop: '8px', // Añadir espacio arriba para compensar la cabecera eliminada
                        }}>
                          <span style={{ 
                            marginRight: '6px', 
                            fontSize: '12px',
                            transform: 'rotate(90deg)',
                            display: 'inline-block',
                            color: '#6b7280',
                          }}>▶</span>
                          <span style={{ 
                            marginRight: '8px', 
                            fontSize: '13px', 
                            display: 'inline-block',
                            color: '#6b7280',
                          }}>📁</span>
                          <span>{activeProject.title}</span>
                        </div>
                        
                        {/* Lista de archivos */}
                        <div style={{ paddingLeft: '23px' }}>
                          {activeProject.files.map((file, index) => (
                            <div 
                              key={index}
                              onClick={() => setCurrentFile(file)}
                              style={{
                                padding: '6px 10px',
                                fontSize: '13px',
                                color: '#e2e8f0',
                                backgroundColor: currentFile === file ? 'rgba(30, 58, 138, 0.18)' : 'transparent', // Color de selección como la línea activa del editor
                                borderLeft: currentFile === file ? '2px solid rgba(59, 130, 246, 0.6)' : '2px solid transparent', // Borde izquierdo para archivo seleccionado
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                margin: '1px 0',
                                marginRight: '0',
                                transition: 'background-color 0.1s ease',
                                fontFamily: '"Fira Code", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', // Misma fuente que el editor
                                paddingLeft: '8px', // Ajuste para el borde de selección
                              }}
                              onMouseEnter={(e) => {
                                if (currentFile !== file) {
                                  e.currentTarget.style.backgroundColor = 'rgba(30, 58, 138, 0.1)'; // Efecto hover sutil como en el editor
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (currentFile !== file) {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }
                              }}
                            >
                              <span style={{ 
                                marginRight: '8px', 
                                fontSize: '13px', 
                                display: 'inline-block',
                                color: getFileIconColor(file.name),
                                opacity: 0.9,
                                fontWeight: '500',
                              }}>
                                {getFileIcon(file.name)}
                              </span>
                              <span style={{ 
                                fontSize: '13px', 
                                letterSpacing: '-0.2px',
                              }}>
                                {file.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Editor de código con el archivo seleccionado */}
                    <div style={{ 
                      flex: '1', 
                      overflow: 'hidden', // Cambiado de 'auto' a 'hidden' para evitar barras de desplazamiento duplicadas
                      position: 'relative',
                      // Estos estilos adicionales ayudan a mostrar mejor las barras de desplazamiento 
                      padding: '0', 
                      margin: '0',
                      display: 'flex',
                      flexDirection: 'column',
                      // Añadir un poco de espacio para la barra de desplazamiento
                      paddingRight: '3px',
                    }}>
                      {currentFile && (
                        <>
                          <CodeEditor 
                            code={currentFile.code}
                            onChange={handleCodeChange}
                            language={currentFile.language}
                            isModified={Boolean(modifiedFiles[currentFile.name])}
                          />
                          
                          {/* Botón para aplicar cambios */}
                          {Boolean(modifiedFiles[currentFile.name]) && (
                            <div 
                              onClick={applyChanges}
                              style={{
                                position: 'absolute',
                                bottom: '20px',
                                right: '15px',
                                backgroundColor: justApplied ? 'rgba(22, 101, 52, 0.5)' : 'rgba(15, 23, 42, 0.4)',
                                color: justApplied ? '#86efac' : '#93c5fd',
                                fontSize: '13px',
                                padding: '6px 14px',
                                borderRadius: '6px',
                                backdropFilter: 'blur(6px)',
                                border: justApplied ? '1px solid rgba(74, 222, 128, 0.5)' : '1px solid rgba(59, 130, 246, 0.4)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                zIndex: 30,
                                transition: 'all 0.2s ease',
                                animation: justApplied ? 'greenPulse 1s ease' : 'applyButtonAppear 0.5s ease-out',
                                boxShadow: justApplied ? '0 2px 8px rgba(22, 101, 52, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.2)',
                                fontFamily: '"Fira Code", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                                letterSpacing: '0.3px',
                              }}
                              onMouseEnter={(e) => {
                                if (justApplied) {
                                  e.currentTarget.style.backgroundColor = 'rgba(22, 101, 52, 0.7)';
                                  e.currentTarget.style.border = '1px solid rgba(74, 222, 128, 0.7)';
                                } else {
                                  e.currentTarget.style.backgroundColor = 'rgba(30, 58, 138, 0.6)';
                                  e.currentTarget.style.border = '1px solid rgba(96, 165, 250, 0.6)';
                                }
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.25)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseLeave={(e) => {
                                if (justApplied) {
                                  e.currentTarget.style.backgroundColor = 'rgba(22, 101, 52, 0.5)';
                                  e.currentTarget.style.border = '1px solid rgba(74, 222, 128, 0.5)';
                                } else {
                                  e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.4)';
                                  e.currentTarget.style.border = '1px solid rgba(59, 130, 246, 0.4)';
                                }
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 13L9 17L19 7" stroke={justApplied ? "#4ADE80" : "#4ADE80"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              {justApplied ? 'Modificado' : 'Aplicar'}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Botón de alternancia entre proyecto y editor */}
          {activeProject && activeProject.files && activeProject.files.length > 0 && (
            <div
              onClick={() => setShowEditorInIframe(!showEditorInIframe)}
              style={{
                position: 'absolute',
                bottom: '40px',
                left: '40px',
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                color: 'white',
                borderRadius: '25px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '10px 18px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                transition: 'all 0.3s ease',
                zIndex: 120,
                fontSize: '14px',
                fontWeight: '600',
                letterSpacing: '0.5px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.color = 'black';
                e.currentTarget.style.transform = 'translateY(-3px)';
                const svg = e.currentTarget.querySelector('svg');
                if (svg) svg.style.stroke = 'black';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.85)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
                const svg = e.currentTarget.querySelector('svg');
                if (svg) svg.style.stroke = 'white';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
                {showEditorInIframe ? (
                  <path d="M15 18l-6-6 6-6" />
                ) : (
                  <path d="M9 18l6-6-6-6" />
                )}
              </svg>
              {showEditorInIframe ? 'Ver Proyecto' : 'Ver Código'}
            </div>
          )}
        </div>
      )}

      {/* Estilos globales para las animaciones y barras de desplazamiento personalizadas */}
      <style jsx global>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          15% { opacity: 0.8; }
          85% { opacity: 0.8; }
          100% { opacity: 0; }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          20% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        @keyframes fadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes fadeInPulse {
          0% { opacity: 0; transform: scale(0.9); }
          70% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes applyButtonAppear {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceIn {
          0%, 20%, 40%, 60%, 80%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes greenPulse {
          0% { background-color: rgba(22, 101, 52, 0.5); }
          50% { background-color: rgba(22, 101, 52, 0.8); box-shadow: 0 0 15px rgba(74, 222, 128, 0.7); }
          100% { background-color: rgba(22, 101, 52, 0.5); }
        }
        
        /* Estilos personalizados para barras de desplazamiento en Webkit (Chrome, Safari, Edge) */
        .explorer-container::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .explorer-container::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
        }
        .explorer-container::-webkit-scrollbar-thumb {
          background-color: rgba(59, 130, 246, 0.5);
          border-radius: 6px;
        }
        .explorer-container::-webkit-scrollbar-thumb:hover {
          background-color: rgba(59, 130, 246, 0.7);
        }
        
        /* Estilos mejorados para barras de desplazamiento en el editor de código */
        .cm-scroller::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        .cm-scroller::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 0;
        }
        .cm-scroller::-webkit-scrollbar-thumb {
          background-color: rgba(59, 130, 246, 0.5);
          border-radius: 5px;
          border: 2px solid rgba(15, 23, 42, 0.6);
          background-clip: padding-box;
          min-height: 40px;
        }
        .cm-scroller::-webkit-scrollbar-thumb:hover {
          background-color: rgba(96, 165, 250, 0.7);
        }
        .cm-scroller::-webkit-scrollbar-corner {
          background: transparent;
        }
        
        /* Estilo para la barra de desplazamiento vertical en el borde derecho */
        .cm-scroller::-webkit-scrollbar-button {
          display: none;
        }
        
        /* Animación de destello para la barra de desplazamiento cuando se activa */
        .cm-scroller::-webkit-scrollbar-thumb:active {
          background-color: rgba(96, 165, 250, 0.9);
        }
        
        /* Asegurarnos de que el contenedor del editor tiene las propiedades correctas */
        .cm-editor {
          height: 100%;
          position: relative;
          z-index: 1;
        }
        
        /* Garantizar que el contenedor del scroll recibe eventos */
        .cm-scroller {
          pointer-events: auto !important;
          touch-action: pan-y !important;
        }
      `}</style>
    </div>
  );
};

// Componente para cada ventana de proyecto
const ProjectWindow = ({ project, delay = 0, isTransitioning, transitionDirection, onProjectClick }) => {
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
      onClick={() => onProjectClick(project)}
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