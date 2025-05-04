import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const BuildingBackground = ({ isFollowing }) => {
  const mountRef = useRef(null);
  const cameraRef = useRef(); // Referencia para la cámara
  const pedestrianGroupRef = useRef(); // Referencia para el grupo de peatones
  const followedPedestrianRef = useRef(null); // Referencia para el peatón a seguir
  const originalCameraPos = useRef(new THREE.Vector3(0, 8, 20)); // Guardar pos inicial
  const animationFrameIdRef = useRef(); // Para cancelar el frame correcto
  const clockRef = useRef(null); // Ref para el Clock

  // Refs para el movimiento de cabeza
  const isLookingAround = useRef(false);
  const currentLookOffset = useRef(new THREE.Vector3(0, 0, 0));
  const targetLookOffset = useRef(new THREE.Vector3(0, 0, 0));
  const lookAroundEndTime = useRef(0);
  const nextLookAroundTime = useRef(5); // Empezar a mirar después de 5s
  const lookAroundParams = { // Configuración
      duration: 0.8, // Duración para mirar a un lado
      returnDuration: 1.2, // Duración para volver
      pauseMin: 3.0, // Pausa mínima entre miradas
      pauseMax: 8.0, // Pausa máxima
      maxOffsetH: 0.6, // Desplazamiento horizontal máx (radianes)
      maxOffsetV: 0.3  // Desplazamiento vertical máx
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Inicializar clock si no existe
    if (!clockRef.current) {
        clockRef.current = new THREE.Clock();
    }

    const currentMount = mountRef.current;
    let animationFrameId;

    // --- Escena ---
    const scene = new THREE.Scene();
    // scene.fog = new THREE.FogExp2(0x000000, 0.03); // Niebla exponencial negra
    // Usar niebla lineal para un resplandor/color de fondo gradual
    // Hacer el color más oscuro y el rango más lejano para un efecto muy sutil
    scene.fog = new THREE.Fog(0x040408, 80, 300); // Color casi negro, empieza a los 80, total a los 300 (antes 0x080818, 50, 200)

    // --- Cámara Perspectiva ---
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 5000);
    camera.position.copy(originalCameraPos.current);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera; // Guardar referencia a la cámara

    // --- Renderizador y Composer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Establecer clearColor al mismo color base de la niebla para transición suave
    renderer.setClearColor(0x040408); // Color casi negro (antes 0x080818)
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '-1';
    currentMount.appendChild(renderer.domElement);

    const renderScene = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.2, // strength - Menos intensidad (antes 1.8)
        0.6, // radius - Mantenemos radio
        0.7  // threshold - Umbral un poco más alto (antes 0.65)
    );
    // Ajustar valores si es necesario:
    // bloomPass.threshold = 0.8; 
    // bloomPass.strength = 0.8;
    // bloomPass.radius = 0.3;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // --- Luces ---
    const ambientLight = new THREE.AmbientLight(0x606070, 1.5); // Mantenemos ambiental
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xa0b0ff, 1.0); // Más intensidad y color ajustado (antes 0x90a0ff, 0.8)
    directionalLight.position.set(20, 40, -100); // Posición alta/lejana, similar a la luna (antes 8, 15, 10)
    directionalLight.target.position.set(0, 0, 0); // Asegurar que apunta al centro
    scene.add(directionalLight);
    scene.add(directionalLight.target); // Es necesario añadir el target a la escena si se mueve
    
    // const pointLight = new THREE.PointLight(0xffcc88, 0.5); // Quitar la puntual general?
    // pointLight.position.set(-8, 6, 8);
    // scene.add(pointLight);

    // --- Materiales ---
    const buildingMaterial = new THREE.MeshLambertMaterial({ color: 0x333344 });
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x0a0a10 });
    const streetMaterial = new THREE.MeshLambertMaterial({ color: 0x222228 });
    const carLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe0 }); // Blanco-amarillo más brillante
    // Array de colores para carros
    const carBodyColors = [0xaa2222, 0x2244aa, 0xaaaaaa, 0x22aa44, 0x888822];
    const carBodyMaterials = carBodyColors.map(color => new THREE.MeshLambertMaterial({ color }));
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a }); // Material negro/gris oscuro para ruedas
    const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x666677 }); // Material poste grisáceo
    const streetLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }); // Blanco puro ya es brillante
    const trafficLightBodyMaterial = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
    const redLightMaterial = new THREE.MeshBasicMaterial({ color: 0xff4444 }); // Rojo más vibrante (antes 0xff6666)
    const amberLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc66 }); // Ámbar más vibrante (antes 0xffdd88)
    const greenLightMaterial = new THREE.MeshBasicMaterial({ color: 0x44ff44 }); // Verde más vibrante (antes 0x66ff66)
    const windowMaterial = new THREE.MeshBasicMaterial({ color: 0xffffd0, side: THREE.DoubleSide }); // Amarillo más saturado, antes 0xffffe0
    // Materiales para Peatones
    const pedestrianColors = [0xaaaaaa, 0x8888aa, 0xaa8888, 0x88aa88, 0xaaaa88, 0x88aaaa];
    const pedestrianMaterials = pedestrianColors.map(color => new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.2 }));
    // Material para Líneas de Calle
    const streetLineMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    // Material para la Luna
    const moonMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }); // Añadir fog: false
    // Material para Estrellas
    const starMaterial = new THREE.PointsMaterial({
        size: 1.5, // Tamaño de las estrellas (en píxeles)
        sizeAttenuation: false, // Tamaño constante sin importar distancia
        vertexColors: true, // Usar colores definidos por vértice
        fog: false, // Ignorar niebla
        blending: THREE.AdditiveBlending, // Efecto de brillo al superponerse
        depthWrite: false // Para que no se oculten estrictamente unas a otras
    });

    // --- Geometrías ---
    const buildingGeometry = new THREE.BoxGeometry(1, 1, 1);
    const gridSize = 20; // Grid más grande
    const spacing = 3.0; // Más espacio
    const buildingWidth = 1.2; // Edificios un poco más anchos
    const streetWidth = spacing - buildingWidth;
    const groundSize = gridSize * spacing * 1.2;
    const enlargedGroundSize = groundSize * 10; // Hacer el suelo 10 veces más grande
    const groundGeometry = new THREE.PlaneGeometry(enlargedGroundSize, enlargedGroundSize);
    const streetHGeometry = new THREE.PlaneGeometry(groundSize, streetWidth);
    const streetVGeometry = new THREE.PlaneGeometry(streetWidth, groundSize);
    const carWidth = 0.4, carHeight = 0.2, carLength = 0.8;
    const carGeometry = new THREE.BoxGeometry(carWidth, carHeight, carLength);
    const carLightGeometry = new THREE.PlaneGeometry(0.15, 0.08);
    const wheelRadius = 0.1, wheelWidth = 0.08; // Ruedas un poco más anchas
    const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 8); // Menos segmentos para rendimiento
    const poleHeight = 3.0;
    const poleGeometry = new THREE.CylinderGeometry(0.05, 0.08, poleHeight, 8);
    const streetLampGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const trafficLightBoxGeometry = new THREE.BoxGeometry(0.2, 0.5, 0.15);
    const trafficLightBulbGeometry = new THREE.SphereGeometry(0.07, 8, 8); // Bombillas un poco más pequeñas
    const windowSize = 0.3; // Tamaño de la ventana cuadrada
    const windowGeometry = new THREE.PlaneGeometry(windowSize, windowSize);
    
    // --- Geometrías para Stickman (Revisadas) ---
    const segments = 12; // Aumentar segmentos para suavidad
    const headRadius = 0.11; // Ligeramente más grande
    const neckHeight = 0.05; 
    const neckRadius = 0.025;
    const torsoHeight = 0.35; // Altura del cilindro central de la cápsula torso
    const torsoRadius = 0.04; // Más grueso
    const limbLength = 0.32; // Longitud del cilindro central de la cápsula extremidad
    const limbRadius = 0.03; // Más gruesas

    const headGeometry = new THREE.SphereGeometry(headRadius, segments * 2, segments);
    const neckGeometry = new THREE.CapsuleGeometry(neckRadius, neckHeight, segments / 2, segments); // Usar Capsule
    const torsoGeometry = new THREE.CapsuleGeometry(torsoRadius, torsoHeight, segments / 2, segments); // Usar Capsule
    const limbGeometry = new THREE.CapsuleGeometry(limbRadius, limbLength, segments / 2, segments); // Usar Capsule

    // Geometría para Líneas de Calle
    const lineLength = 0.8;
    const lineWidth = 0.05;
    const streetLineGeometry = new THREE.PlaneGeometry(lineLength, lineWidth);
    // Geometría para la Luna
    const moonRadius = 12; // Más grande (antes 8)
    const moonGeometry = new THREE.SphereGeometry(moonRadius, 32, 16);
    // Geometría para Estrellas
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 400; // Número de estrellas (mucho menor, antes 7000)
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starFieldRadius = 800; // Radio de la esfera de estrellas

    for (let i = 0; i < starCount; i++) {
        // Posición en esfera usando coordenadas esféricas
        const phi = Math.acos(-1 + (2 * Math.random())); // Distribución uniforme en esfera
        const theta = Math.sqrt(starCount * Math.PI) * phi; // Otra forma de distribución (Phyllotaxis)
        // O usar theta aleatorio simple: const theta = Math.random() * 2 * Math.PI;

        const x = starFieldRadius * Math.sin(phi) * Math.cos(theta);
        const y = starFieldRadius * Math.sin(phi) * Math.sin(theta);
        const z = starFieldRadius * Math.cos(phi);

        starPositions[i * 3] = x;
        starPositions[i * 3 + 1] = y;
        starPositions[i * 3 + 2] = z;

        // Color base blanco, con ligera variación
        const baseColor = new THREE.Color(0xffffff);
        const variance = Math.random();
        if (variance < 0.1) { // 10% ligeramente azuladas
            baseColor.lerp(new THREE.Color(0xccccff), 0.3);
        } else if (variance < 0.2) { // 10% ligeramente amarillentas
            baseColor.lerp(new THREE.Color(0xffffcc), 0.3);
        }
        // Añadir ligera variación de brillo
        const brightness = 0.8 + Math.random() * 0.2;
        baseColor.multiplyScalar(brightness);

        starColors[i * 3] = baseColor.r;
        starColors[i * 3 + 1] = baseColor.g;
        starColors[i * 3 + 2] = baseColor.b;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    // --- Helper Functions ---
    function createStreetLight(x, z) {
        const lightGroup = new THREE.Group();
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = poleHeight / 2;
        lightGroup.add(pole);
        const armGeometry = new THREE.BoxGeometry(0.5, 0.05, 0.05);
        const arm = new THREE.Mesh(armGeometry, poleMaterial);
        arm.position.set(0.25, poleHeight - 0.1, 0);
        lightGroup.add(arm);
        const lamp = new THREE.Mesh(streetLampGeometry, streetLightMaterial);
        lamp.position.set(0.45, poleHeight - 0.2, 0);
        lightGroup.add(lamp);
        lightGroup.position.set(x, 0, z);
        return lightGroup;
    }

    function createTrafficLight(x, z, rotationY) {
        const trafficGroup = new THREE.Group();
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.scale.y = 0.8;
        pole.position.y = poleHeight * 0.8 / 2;
        trafficGroup.add(pole);
        const body = new THREE.Mesh(trafficLightBoxGeometry, trafficLightBodyMaterial);
        body.position.y = poleHeight * 0.8;
        trafficGroup.add(body);
        const redLight = new THREE.Mesh(trafficLightBulbGeometry, redLightMaterial);
        redLight.position.set(0, poleHeight * 0.8 + 0.15, 0.08);
        trafficGroup.add(redLight);
        const amberLight = new THREE.Mesh(trafficLightBulbGeometry, amberLightMaterial);
        amberLight.position.set(0, poleHeight * 0.8, 0.08);
        trafficGroup.add(amberLight);
        const greenLight = new THREE.Mesh(trafficLightBulbGeometry, greenLightMaterial);
        greenLight.position.set(0, poleHeight * 0.8 - 0.15, 0.08);
        trafficGroup.add(greenLight);
        trafficGroup.position.set(x, 0, z);
        trafficGroup.rotation.y = rotationY;
        return trafficGroup;
    }

    // Función para crear un Stickman
    function createStickman(material) {
        const group = new THREE.Group();
        const epsilon = 0.001; // Pequeño offset para evitar z-fighting

        // Torso (el origen estará en la base del torso)
        const torso = new THREE.Mesh(torsoGeometry, material);
        torso.position.y = torsoHeight / 2;
        group.add(torso);

        // Cabeza
        const head = new THREE.Mesh(headGeometry, material);
        head.position.y = torsoHeight + headRadius * 0.9;
        group.add(head);

        // Brazos
        const armY = torsoHeight * 0.85;
        const armX = torsoRadius + limbRadius + epsilon; // Añadir epsilon
        const armZ = 0;

        const leftArm = new THREE.Mesh(limbGeometry, material);
        leftArm.position.set(-(armX), armY, armZ); // Usar -armX con epsilon
        leftArm.rotation.z = -Math.PI / 8;
        group.add(leftArm);

        const rightArm = new THREE.Mesh(limbGeometry, material);
        rightArm.position.set(armX, armY, armZ); // Usar armX con epsilon
        rightArm.rotation.z = Math.PI / 8;
        group.add(rightArm);

        // Piernas
        const legY = limbLength / 2;
        const legX = torsoRadius + epsilon; // Añadir epsilon

        const leftLeg = new THREE.Mesh(limbGeometry, material);
        leftLeg.position.set(-(legX), legY, 0); // Usar -legX con epsilon
        group.add(leftLeg);

        const rightLeg = new THREE.Mesh(limbGeometry, material);
        rightLeg.position.set(legX, legY, 0); // Usar legX con epsilon
        group.add(rightLeg);

        return group;
    }

    // --- Crear Ciudad --- //
    const cityGroup = new THREE.Group();
    const buildingGroup = new THREE.Group();
    const streetGroup = new THREE.Group(); // Calles y ahora también líneas
    const carGroup = new THREE.Group();
    const utilityGroup = new THREE.Group(); // Grupo para farolas y semáforos
    const pedestrianGroup = new THREE.Group(); // Grupo para peatones
    pedestrianGroupRef.current = pedestrianGroup; // ASIGNAR REFERENCIA

    const lineSegmentSpacing = lineLength * 2.5; // Espacio entre segmentos de línea
    const streetYLevel = 0.01;
    const lineYLevel = streetYLevel + 0.005; // Ligeramente encima de la calle

    for (let i = -gridSize; i <= gridSize; i++) {
        for (let j = -gridSize; j <= gridSize; j++) {
            // Edificio
            if (Math.abs(i) > 1 || Math.abs(j) > 1) {
                 const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
                 const height = Math.max(1.5, Math.random() * 12);
                 building.scale.set(buildingWidth, height, buildingWidth);
                 building.position.set(i * spacing, height / 2, j * spacing);
                 buildingGroup.add(building);

                 // Añadir ventanas aleatoriamente a algunos edificios
                 if (Math.random() < 0.30) { // ~30% de probabilidad (antes 0.15)
                    const windowCount = 2; // Exactamente 2 ventanas (antes 4)
                    
                    // Elegir un par de caras opuestas: (Frontal/Trasera) o (Derecha/Izquierda)
                    const useZAxisPair = Math.random() > 0.5;
                    const faceIndices = useZAxisPair ? [0, 1] : [2, 3]; // [0:+Z, 1:-Z] o [2:+X, 3:-X]

                    for (let k = 0; k < windowCount; k++) { // Iterar exactamente 2 veces
                        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
                        const faceIndex = faceIndices[k]; // Usar la cara del par elegido

                        // Calcular posición y rotación local en la cara elegida
                        const buildingLocalWidth = 1.0; // Ancho/Profundidad local antes de escalar
                        const buildingLocalHeight = 1.0;
                        const epsilon = 0.01; // Pequeño offset hacia afuera

                        // Posición Y aleatoria (evitando bordes superior/inferior)
                        const wy = (Math.random() * 0.8 + 0.1) * buildingLocalHeight - buildingLocalHeight / 2; // Entre 10% y 90% de altura local

                        if (faceIndex === 0) { // Cara +Z (Frontal)
                            const wx = (Math.random() - 0.5) * (buildingLocalWidth - windowSize);
                            windowMesh.position.set(wx, wy, buildingLocalWidth / 2 + epsilon);
                        } else if (faceIndex === 1) { // Cara -Z (Trasera)
                            const wx = (Math.random() - 0.5) * (buildingLocalWidth - windowSize);
                            windowMesh.position.set(wx, wy, -buildingLocalWidth / 2 - epsilon);
                            windowMesh.rotation.y = Math.PI;
                        } else if (faceIndex === 2) { // Cara +X (Derecha)
                            const wz = (Math.random() - 0.5) * (buildingLocalWidth - windowSize);
                            windowMesh.position.set(buildingLocalWidth / 2 + epsilon, wy, wz);
                            windowMesh.rotation.y = Math.PI / 2;
                        } else { // Cara -X (Izquierda)
                            const wz = (Math.random() - 0.5) * (buildingLocalWidth - windowSize);
                            windowMesh.position.set(-buildingLocalWidth / 2 - epsilon, wy, wz);
                            windowMesh.rotation.y = -Math.PI / 2;
                        }
                        
                        // Compensar escala del padre para mantener tamaño visual aprox.
                        windowMesh.scale.set(1 / buildingWidth, 1 / height, 1 / buildingWidth);

                        building.add(windowMesh); // Añadir ventana como hija del edificio
                    }
                 }
            }

            // Calles y Líneas
            // Calles Verticales y sus líneas (si corresponde)
            if (i < gridSize) {
                const streetX = (i + 0.5) * spacing;
                const streetV = new THREE.Mesh(streetVGeometry, streetMaterial);
                streetV.rotation.x = -Math.PI / 2;
                streetV.position.set(streetX, streetYLevel, 0);
                streetGroup.add(streetV);

                // Añadir líneas amarillas raramente (solo si i es múltiplo de 11, antes 23)
                if (i !== 0 && i % 11 === 0) { // Condición de rareza (menos estricta)
                     for (let z = -groundSize / 2 + lineLength; z < groundSize / 2 - lineLength; z += lineSegmentSpacing) {
                        const line = new THREE.Mesh(streetLineGeometry, streetLineMaterial);
                        line.rotation.x = -Math.PI / 2;
                        line.rotation.z = Math.PI / 2; // Rotar para alinear verticalmente
                        line.position.set(streetX, lineYLevel, z);
                        streetGroup.add(line);
                    }
                }
            }
            // Calles Horizontales y sus líneas (si corresponde)
             if (j < gridSize) {
                const streetZ = (j + 0.5) * spacing;
                const streetH = new THREE.Mesh(streetHGeometry, streetMaterial);
                streetH.rotation.x = -Math.PI / 2;
                streetH.position.set(0, streetYLevel, streetZ);
                streetGroup.add(streetH);

                 // Añadir líneas amarillas raramente (solo si j es múltiplo de 7, antes 19)
                if (j !== 0 && j % 7 === 0) { // Condición de rareza (menos estricta)
                    for (let x = -groundSize / 2 + lineLength; x < groundSize / 2 - lineLength; x += lineSegmentSpacing) {
                        const line = new THREE.Mesh(streetLineGeometry, streetLineMaterial);
                        line.rotation.x = -Math.PI / 2;
                        // No necesita rotación Z extra
                        line.position.set(x, lineYLevel, streetZ);
                        streetGroup.add(line);
                    }
                }
            }

            // Añadir Farolas y Semáforos en las intersecciones (Lógica Mejorada)
             if (i < gridSize && j < gridSize && i > -gridSize + 1 && j > -gridSize + 1 ) { // Evitar bordes exteriores
                 const intersectionX = (i + 0.5) * spacing;
                 const intersectionZ = (j + 0.5) * spacing;
                 const streetStartX = i * spacing + buildingWidth / 2;
                 const streetEndX = (i + 1) * spacing - buildingWidth / 2;
                 const streetStartZ = j * spacing + buildingWidth / 2;
                 const streetEndZ = (j + 1) * spacing - buildingWidth / 2;
                 const smallOffset = 0.15;

                // Poner farola si la suma de índices es múltiplo de 17 (muy dispersa)
                if ((i + j + 100) % 17 === 0) { // Antes era % 11
                     const lightX = streetStartX + smallOffset;
                     const lightZ = streetStartZ + smallOffset;
                     utilityGroup.add(createStreetLight(lightX, lightZ));
                 }

                 // Colocar semáforos si i Y j son múltiplos de 7 (cruces aún más principales)
                if ((Math.abs(i) > 1 || Math.abs(j) > 1) && (i % 7 === 0 && j % 7 === 0) ) { // Antes era % 5
                    const trafficLightOffsetX = streetWidth / 2 + 0.1;
                    // Semáforo para tráfico vertical
                    const trafficLightVZ = streetEndZ - smallOffset;
                    utilityGroup.add(createTrafficLight(streetStartX + smallOffset, trafficLightVZ, 0)); // Mirando Sur

                    // Semáforo para tráfico horizontal
                     const trafficLightHX = streetEndX - smallOffset;
                     utilityGroup.add(createTrafficLight(trafficLightHX, streetStartZ + smallOffset, Math.PI / 2)); // Mirando Oeste
                 }
            }
        }
    }
    cityGroup.add(buildingGroup);
    cityGroup.add(streetGroup);
    cityGroup.add(utilityGroup); // Añadir farolas/semáforos

    // --- Crear Carros --- //
    const carCount = 80;
    const wheelOffsetX = carWidth / 2;
    const wheelOffsetZ = carLength / 2 - wheelRadius * 1.2;
    const wheelOffsetY = -carHeight / 2;

    for (let i = 0; i < carCount; i++) {
        const car = new THREE.Group();
        const bodyMaterial = carBodyMaterials[i % carBodyMaterials.length];
        const bodyGeometry = new THREE.BoxGeometry(carWidth, carHeight, carLength);
        const carBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
        car.add(carBody);
        const cabinHeight = 0.15;
        const cabinLength = 0.4;
        const cabinGeometry = new THREE.BoxGeometry(carWidth * 0.9, cabinHeight, cabinLength);
        const carCabin = new THREE.Mesh(cabinGeometry, bodyMaterial); // Mismo material por ahora
        carCabin.position.set(0, (carHeight + cabinHeight) / 2, (carLength - cabinLength) * 0.2); // Posicionar encima y un poco hacia atrás
        car.add(carCabin);
        const frontLight = new THREE.Mesh(carLightGeometry, carLightMaterial);
        frontLight.position.set(0, carHeight * 0.3, carLength / 2 + 0.01); // En el frente del cuerpo
        frontLight.scale.set(0.8, 0.8, 1); // Un poco más pequeñas
        car.add(frontLight);
        const backLight = new THREE.Mesh(carLightGeometry, new THREE.MeshBasicMaterial({ color: 0xcc0000 }));
        backLight.position.set(0, carHeight * 0.3, -carLength / 2 - 0.01); // Atrás del cuerpo
        backLight.scale.set(0.8, 0.8, 1);
        car.add(backLight);

        const wheelPositions = [
            { x: wheelOffsetX, y: wheelOffsetY, z: wheelOffsetZ }, { x: -wheelOffsetX, y: wheelOffsetY, z: wheelOffsetZ },
            { x: wheelOffsetX, y: wheelOffsetY, z: -wheelOffsetZ }, { x: -wheelOffsetX, y: wheelOffsetY, z: -wheelOffsetZ }
        ];
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, pos.y, pos.z);
            car.add(wheel);
        });

        const laneOffset = streetWidth * 0.25 * (Math.random() > 0.5 ? 1 : -1);
        const isHorizontal = Math.random() > 0.5;
        const carBaseY = wheelRadius;
        if (isHorizontal) {
            car.position.set((Math.random() * 2 - 1) * groundSize * 0.4, carBaseY, (Math.floor(Math.random() * (gridSize * 2) - gridSize) + 0.5) * spacing + laneOffset);
            car.rotation.y = Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1);
        } else {
            car.position.set((Math.floor(Math.random() * (gridSize * 2) - gridSize) + 0.5) * spacing + laneOffset, carBaseY, (Math.random() * 2 - 1) * groundSize * 0.4);
            car.rotation.y = Math.random() > 0.5 ? 0 : Math.PI;
        }
        car.userData.speed = Math.random() * 0.03 + 0.02;
        carGroup.add(car);
    }
    cityGroup.add(carGroup);

    // --- Crear Peatones --- //
    const pedestrianCount = 150; // Número de peatones
    const sidewalkOffsetRatio = 0.4; // Qué tan cerca del borde de la calle (0.5 es el borde)

    for (let i = 0; i < pedestrianCount; i++) {
        const material = pedestrianMaterials[i % pedestrianMaterials.length];
        const pedestrian = createStickman(material); // Crear stickman en su lugar

        const isHorizontal = Math.random() > 0.5; // Caminará por calle horizontal o vertical?
        const side = Math.random() > 0.5 ? 1 : -1; // A qué lado de la línea central de la calle
        const speed = (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1);

        if (isHorizontal) {
            // Caminando en eje X sobre una calle horizontal (línea Z constante)
            const streetZ = (Math.floor(Math.random() * (gridSize * 2)) - gridSize + 0.5) * spacing;
            const sidewalkZ = streetZ + side * streetWidth * sidewalkOffsetRatio;
            pedestrian.position.set(
                (Math.random() * 2 - 1) * groundSize * 0.48,
                0, // Stickman base está en y=0
                sidewalkZ
            );
            pedestrian.rotation.y = speed > 0 ? -Math.PI / 2 : Math.PI / 2;
        } else {
            // Caminando en eje Z sobre una calle vertical (línea X constante)
            const streetX = (Math.floor(Math.random() * (gridSize * 2)) - gridSize + 0.5) * spacing;
            const sidewalkX = streetX + side * streetWidth * sidewalkOffsetRatio;
            pedestrian.position.set(
                sidewalkX,
                0, // Stickman base está en y=0
                (Math.random() * 2 - 1) * groundSize * 0.48
            );
            pedestrian.rotation.y = speed > 0 ? Math.PI : 0;
        }

        pedestrian.userData.speed = speed;
        pedestrian.userData.isHorizontal = isHorizontal;

        pedestrianGroup.add(pedestrian);
    }
    cityGroup.add(pedestrianGroup); // Añadir grupo de peatones a la ciudad

    scene.add(cityGroup); // Añadir ciudad a la escena

    // --- Crear Luna --- //
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    // moon.material.fog = false; // Aplicado directamente en la definición del material
    moon.position.set(50, 100, -400); // Posición lejana y alta
    scene.add(moon); // Añadir directamente a la escena, no al cityGroup

    // --- Crear Estrellas --- //
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars); // Añadir directamente a la escena

    // --- Suelo --- //
    const groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = 0;
    scene.add(groundPlane);

    // --- Manejo de Redimensionamiento --- //
    const handleResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        composer.setSize(width, height); // Redimensionar composer también
        // Actualizar resolución del bloom pass si es necesario
        bloomPass.resolution.set(width, height);
    };
    window.addEventListener('resize', handleResize);

    // --- Bucle de Animación --- //
    const targetPositionVec = new THREE.Vector3();
    const offsetVec = new THREE.Vector3();
    const cameraPositionVec = new THREE.Vector3();
    const lookAtPositionVec = new THREE.Vector3();
    const forwardVec = new THREE.Vector3();
    const baseLookDirection = new THREE.Vector3(); // Dirección base (adelante y arriba)
    const finalLookDirection = new THREE.Vector3(); // Dirección final + offset
    const zeroVector = new THREE.Vector3(0,0,0); // Para comparar
    const lookLerpFactor = 0.06; // Suavidad de la interpolación de mirada

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();
      const elapsedTime = clockRef.current.getElapsedTime();

      // --- Movimiento Cámara --- //
      if (followedPedestrianRef.current) {
        const pedestrian = followedPedestrianRef.current;
        const camera = cameraRef.current;

        // --- Calcular Posición Cámara (igual que antes) ---
        pedestrian.getWorldPosition(targetPositionVec);
        const headHeight = torsoHeight + headRadius * 0.9;
        offsetVec.set(0, headHeight, 0.1);
        offsetVec.applyQuaternion(pedestrian.quaternion);
        cameraPositionVec.copy(targetPositionVec).add(offsetVec);
        camera.position.lerp(cameraPositionVec, 0.15);

        // --- Calcular Dirección Base de Mirada (Adelante y Arriba) --- //
        forwardVec.set(0, 0, 1); // Vector hacia adelante local del peatón
        forwardVec.applyQuaternion(pedestrian.quaternion);
        baseLookDirection.copy(forwardVec);
        baseLookDirection.y += 0.3; // Mirar más arriba por defecto (ajusta este valor)
        baseLookDirection.normalize();

        // --- Lógica de Movimiento de Cabeza --- //
        // Decidir si iniciar una nueva mirada
        if (!isLookingAround.current && elapsedTime >= nextLookAroundTime.current) {
            if (Math.random() < 0.6) { // 60% de probabilidad de mirar
                isLookingAround.current = true;
                // Calcular offset aleatorio (horizontal y vertical)
                const randomAngleH = (Math.random() - 0.5) * 2 * lookAroundParams.maxOffsetH;
                const randomAngleV = (Math.random() - 0.5) * 2 * lookAroundParams.maxOffsetV;
                // Crear vector de offset (más simple que ángulos)
                targetLookOffset.current.set(randomAngleH, randomAngleV, 0);
                // targetLookOffset.current.applyQuaternion(pedestrian.quaternion); // ¿Aplicar rotación? No, es un offset relativo a la vista
                lookAroundEndTime.current = elapsedTime + lookAroundParams.duration;
            }
             else {
                 // Si no miramos, esperar un poco menos para volver a intentar
                 nextLookAroundTime.current = elapsedTime + lookAroundParams.pauseMin * 0.5;
            }
        }

        // Interpolar la mirada y gestionar fases
        if (isLookingAround.current) {
            currentLookOffset.current.lerp(targetLookOffset.current, lookLerpFactor);

            if (elapsedTime >= lookAroundEndTime.current) {
                // Si estábamos mirando a un lado (target no es cero)
                if (!targetLookOffset.current.equals(zeroVector)) {
                    targetLookOffset.current.set(0, 0, 0); // Establecer objetivo a cero (volver)
                    lookAroundEndTime.current = elapsedTime + lookAroundParams.returnDuration;
                } else { // Si ya estábamos volviendo (target era cero)
                    isLookingAround.current = false;
                    currentLookOffset.current.set(0, 0, 0); // Resetear offset actual
                    // Calcular próxima vez para mirar
                    const pause = lookAroundParams.pauseMin + Math.random() * (lookAroundParams.pauseMax - lookAroundParams.pauseMin);
                    nextLookAroundTime.current = elapsedTime + pause;
                }
            }
        }
         else {
             // Si no estamos mirando activamente, asegurarse de que volvemos rápido al centro
             currentLookOffset.current.lerp(zeroVector, lookLerpFactor * 2.0); // Doble velocidad para volver
        }

        // --- Aplicar Mirada Final --- //
        // Rotar la dirección base según el offset actual (simplificado)
        // NOTA: Esto es una aproximación. Una rotación correcta usaría cuaterniones.
        finalLookDirection.copy(baseLookDirection);
        // Aplicar offset horizontal como rotación Y aproximada
        finalLookDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), currentLookOffset.current.x);
        // Aplicar offset vertical como rotación X local aproximada
        const rightVec = new THREE.Vector3().crossVectors(camera.up, finalLookDirection).normalize(); // Vector derecha local
        finalLookDirection.applyAxisAngle(rightVec, currentLookOffset.current.y);

        lookAtPositionVec.copy(camera.position).add(finalLookDirection);
        camera.lookAt(lookAtPositionVec);

      } else {
        // --- Movimiento Cámara Original --- //
        const camera = cameraRef.current;
        if (originalCameraPos.current && camera) { 
            const basePosX = originalCameraPos.current.x;
            const basePosZ = originalCameraPos.current.z;
            camera.position.x = basePosX + Math.sin(elapsedTime * 0.04) * 10;
            camera.position.z = basePosZ + Math.cos(elapsedTime * 0.04) * 10;
            camera.position.y = originalCameraPos.current.y;
            camera.lookAt(0, 1, 0);
        }
      }

      // --- Movimiento Carros --- //
      carGroup.children.forEach(car => {
            car.translateZ(car.userData.speed);
            const limit = groundSize * 0.5;
            if (Math.abs(car.position.x) > limit || Math.abs(car.position.z) > limit) {
                 const laneOffset = streetWidth * 0.25 * (Math.random() > 0.5 ? 1 : -1);
                 const isHorizontal = Math.random() > 0.5;
                 const carBaseY = wheelRadius;
                 if (isHorizontal) {
                    car.position.set(-limit * Math.sign(car.position.x) * (Math.random() * 0.5 + 0.5), carBaseY, (Math.floor(Math.random() * (gridSize * 2) - gridSize) + 0.5) * spacing + laneOffset);
                    car.rotation.y = Math.PI / 2 * (car.position.x > 0 ? 1 : -1);
                } else {
                    car.position.set((Math.floor(Math.random() * (gridSize * 2) - gridSize) + 0.5) * spacing + laneOffset, carBaseY, -limit * Math.sign(car.position.z) * (Math.random() * 0.5 + 0.5) );
                     car.rotation.y = car.position.z > 0 ? 0 : Math.PI;
                }
            }
        });

      // --- Movimiento Peatones --- //
      const limit = groundSize * 0.5;
      if (pedestrianGroupRef.current) { // Check if ref is populated
            pedestrianGroupRef.current.children.forEach((pedestrian, index) => {
                let uuidOffset = 0;
                for(let charIndex = 0; charIndex < Math.min(pedestrian.uuid.length, 6); charIndex++) {
                    uuidOffset += pedestrian.uuid.charCodeAt(charIndex);
                }
                const legMovement = Math.sin(elapsedTime * 10 + uuidOffset) * 0.4;
                const children = pedestrian.children;
                const leftLeg = children[4];
                const rightLeg = children[5];
                if (leftLeg) leftLeg.rotation.x = legMovement;
                if (rightLeg) rightLeg.rotation.x = -legMovement;
                pedestrian.translateZ(Math.abs(pedestrian.userData.speed));
                const pos = pedestrian.position;
                const needsRepositionX = pedestrian.userData.isHorizontal && Math.abs(pos.x) > limit;
                const needsRepositionZ = !pedestrian.userData.isHorizontal && Math.abs(pos.z) > limit;
                if (needsRepositionX || needsRepositionZ) {
                    const isHorizontal = Math.random() > 0.5;
                    const side = Math.random() > 0.5 ? 1 : -1;
                    const speed = (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1);
                    let startPos;
                    if (isHorizontal) {
                        const streetZ = (Math.floor(Math.random() * (gridSize * 2)) - gridSize + 0.5) * spacing;
                        const sidewalkZ = streetZ + side * streetWidth * sidewalkOffsetRatio;
                        startPos = needsRepositionX ? -limit * Math.sign(pos.x) * 0.98 : (Math.random() * 2 - 1) * limit * 0.95;
                        pedestrian.position.set(startPos, 0, sidewalkZ);
                        pedestrian.rotation.y = speed > 0 ? -Math.PI / 2 : Math.PI / 2;
                    } else {
                        const streetX = (Math.floor(Math.random() * (gridSize * 2)) - gridSize + 0.5) * spacing;
                        const sidewalkX = streetX + side * streetWidth * sidewalkOffsetRatio;
                        startPos = needsRepositionZ ? -limit * Math.sign(pos.z) * 0.98 : (Math.random() * 2 - 1) * limit * 0.95;
                        pedestrian.position.set(sidewalkX, 0, startPos);
                        pedestrian.rotation.y = speed > 0 ? Math.PI : 0;
                    }
                    pedestrian.userData.speed = speed;
                    pedestrian.userData.isHorizontal = isHorizontal;
                }
           });
        } // End check for pedestrianGroupRef.current

      composer.render(delta);
    };
    animate();

    // --- Limpieza --- //
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameIdRef.current);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      scene.traverse(object => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        pedestrianMaterials.forEach(m => m.dispose());
        streetLineMaterial.dispose(); // Disponer material de línea
        // Disponer geometrías de Stickman
        headGeometry.dispose();
        torsoGeometry.dispose();
        limbGeometry.dispose();
        streetLineGeometry.dispose(); // Disponer geometría de línea
        moonGeometry.dispose(); // Disponer geometría de la luna
        starGeometry.dispose(); // Disponer geometría de estrellas

        scene.remove(...scene.children);
        scene.remove(ambientLight);
        scene.remove(directionalLight);
        scene.remove(directionalLight.target);
        scene.remove(moon);
        scene.remove(stars); // Remover estrellas
        scene.remove(cityGroup); // Remover el grupo principal
        scene.remove(groundPlane);

        ambientLight.dispose();
        directionalLight.dispose();
        renderer.dispose();
        composer.dispose();
        bloomPass.dispose();
        renderScene.dispose();
        moonMaterial.dispose(); // Disponer material de la luna
        starMaterial.dispose(); // Disponer material de estrellas
        groundMaterial.dispose(); // Dispose ground material
    };
  }, []); // Dependencia vacía inicial

  // --- Efecto para manejar isFollowing --- //
  useEffect(() => {
    if (isFollowing && pedestrianGroupRef.current && pedestrianGroupRef.current.children.length > 0) {
      const pedestrians = pedestrianGroupRef.current.children;
      const randomIndex = Math.floor(Math.random() * pedestrians.length);
      followedPedestrianRef.current = pedestrians[randomIndex];
      if (cameraRef.current) {
           if (!followedPedestrianRef.current) { 
               originalCameraPos.current.copy(cameraRef.current.position);
           } 
      }
      // Resetear estado de mirada al empezar a seguir
      isLookingAround.current = false;
      currentLookOffset.current.set(0,0,0);
      targetLookOffset.current.set(0,0,0);
      // Asegurarse que clockRef.current existe antes de usarlo
      if (clockRef.current) {
        nextLookAroundTime.current = clockRef.current.getElapsedTime() + lookAroundParams.pauseMin; // Usar ref
      }

    } else {
      followedPedestrianRef.current = null; // Dejar de seguir si isFollowing es false
    }
  }, [isFollowing]);

  return <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }} />;
};

export default BuildingBackground; 