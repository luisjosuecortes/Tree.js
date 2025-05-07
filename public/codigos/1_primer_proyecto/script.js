import * as THREE from 'three'

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
renderer.render(scene, camera)